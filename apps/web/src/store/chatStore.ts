import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DrawerThread, MergeStrategy, MessageNode, Settings } from '../types';
import { generateId } from '../utils/id';
import { htmlToText, textToHtml } from '../utils/id';
import { mdToHtml } from '../utils/markdown';
import { streamChat } from '../api/llm';
import {
  DRAWER_SYSTEM_PROMPT,
  MAIN_SYSTEM_PROMPT,
  buildMergePrompt,
  drawerContext,
  withMemory,
} from '../api/prompts';

const DEFAULT_SETTINGS: Settings = {
  provider: 'anthropic',
  apiKey: '',
  model: 'claude-3-5-sonnet-latest',
  baseUrl: 'https://api.openai.com/v1',
};

type NewNode = Omit<MessageNode, 'id' | 'created_at'>;

interface ChatStore {
  nodes: Record<string, MessageNode>;
  rootNodeIds: string[];
  drawers: Record<string, DrawerThread>;
  activeDrawerIds: string[];
  drawerCounter: number;

  isStreaming: boolean;
  currentNodeId: string | null;
  error: string | null;
  editingNodeId: string | null;

  settings: Settings;
  userMemory: string;

  setSettings: (partial: Partial<Settings>) => void;
  setUserMemory: (memory: string) => void;
  setError: (error: string | null) => void;
  setEditingNode: (id: string | null) => void;

  addNode: (node: NewNode) => string;
  updateNode: (id: string, updates: Partial<MessageNode>) => void;
  saveEdit: (id: string, html: string) => void;

  createDrawer: (input: {
    root_message_id: string;
    highlighted_text: string;
    parent_drawer_id?: string;
  }) => string;
  focusDrawer: (id: string) => void;
  closeDrawer: (id: string) => void;

  sendMessage: (content: string) => Promise<void>;
  sendDrawerMessage: (drawerId: string, content: string) => Promise<void>;
  runSemanticAction: (input: {
    rootMessageId: string;
    highlighted: string;
    displayLabel: string;
    prompt: string;
    parentDrawerId?: string;
  }) => Promise<void>;
  mergeUp: (sourceNodeId: string, targetNodeId: string, strategy: MergeStrategy) => Promise<void>;

  reset: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const buildNode = (node: NewNode): MessageNode => ({
        ...node,
        id: generateId(node.role === 'user' ? 'u' : 'a'),
        created_at: Date.now(),
      });

      const addDrawerNode = (drawerId: string, node: NewNode): string => {
        const full = buildNode(node);
        set((s) => ({
          nodes: { ...s.nodes, [full.id]: full },
          drawers: {
            ...s.drawers,
            [drawerId]: {
              ...s.drawers[drawerId],
              node_ids: [...s.drawers[drawerId].node_ids, full.id],
            },
          },
        }));
        return full.id;
      };

      const streamInto = async (
        assistantId: string,
        system: string,
        messages: { role: 'user' | 'assistant'; content: string }[],
      ): Promise<string> => {
        set({ isStreaming: true, currentNodeId: assistantId, error: null });
        let acc = '';
        try {
          await streamChat({
            system,
            messages,
            settings: get().settings,
            onDelta: (chunk) => {
              acc += chunk;
              get().updateNode(assistantId, { content: textToHtml(acc) });
            },
          });
          get().updateNode(assistantId, { content: mdToHtml(acc), streaming: false });
        } catch (err) {
          get().updateNode(assistantId, {
            content: acc ? textToHtml(acc) : '',
            streaming: false,
          });
          set({ error: err instanceof Error ? err.message : String(err) });
        } finally {
          set({ isStreaming: false, currentNodeId: null });
        }
        return acc;
      };

      return {
        nodes: {},
        rootNodeIds: [],
        drawers: {},
        activeDrawerIds: [],
        drawerCounter: 0,
        isStreaming: false,
        currentNodeId: null,
        error: null,
        editingNodeId: null,
        settings: DEFAULT_SETTINGS,
        userMemory: '',

        setSettings: (partial) => set((s) => ({ settings: { ...s.settings, ...partial } })),
        setUserMemory: (memory) => set({ userMemory: memory }),
        setError: (error) => set({ error }),
        setEditingNode: (id) => set({ editingNodeId: id }),

        addNode: (node) => {
          const full = buildNode(node);
          set((s) => ({
            nodes: { ...s.nodes, [full.id]: full },
            rootNodeIds: [...s.rootNodeIds, full.id],
          }));
          return full.id;
        },

        updateNode: (id, updates) =>
          set((s) => {
            const existing = s.nodes[id];
            if (!existing) return s;
            return { nodes: { ...s.nodes, [id]: { ...existing, ...updates } } };
          }),

        saveEdit: (id, html) =>
          set((s) => {
            const existing = s.nodes[id];
            if (!existing) return s;
            return {
              nodes: {
                ...s.nodes,
                [id]: { ...existing, content: html, edited: true, version: existing.version + 1 },
              },
              editingNodeId: null,
            };
          }),

        createDrawer: ({ root_message_id, highlighted_text, parent_drawer_id }) => {
          const id = generateId('d');
          const drawer: DrawerThread = {
            id,
            root_message_id,
            highlighted_text,
            node_ids: [],
            parent_drawer_id,
            created_at: Date.now(),
          };
          set((s) => {
            let stack: string[];
            if (parent_drawer_id) {
              const idx = s.activeDrawerIds.indexOf(parent_drawer_id);
              stack = [...s.activeDrawerIds.slice(0, idx + 1), id];
            } else {
              stack = [id];
            }
            const rootNode = s.nodes[root_message_id];
            const nodes = rootNode
              ? {
                  ...s.nodes,
                  [root_message_id]: {
                    ...rootNode,
                    branch_ids: [...rootNode.branch_ids, id],
                  },
                }
              : s.nodes;
            return {
              drawers: { ...s.drawers, [id]: drawer },
              activeDrawerIds: stack,
              drawerCounter: s.drawerCounter + 1,
              nodes,
            };
          });
          return id;
        },

        focusDrawer: (id) =>
          set((s) => {
            const idx = s.activeDrawerIds.indexOf(id);
            if (idx === -1) return s;
            return { activeDrawerIds: s.activeDrawerIds.slice(0, idx + 1) };
          }),

        closeDrawer: (id) =>
          set((s) => {
            const idx = s.activeDrawerIds.indexOf(id);
            if (idx === -1) return s;
            return { activeDrawerIds: s.activeDrawerIds.slice(0, idx) };
          }),

        sendMessage: async (content) => {
          const text = content.trim();
          if (!text || get().isStreaming) return;
          const parent = get().rootNodeIds.at(-1) ?? null;
          get().addNode({
            role: 'user',
            content: textToHtml(text),
            edited: false,
            version: 0,
            parent_id: parent,
            branch_ids: [],
            source_refs: [],
          });
          const assistantId = get().addNode({
            role: 'assistant',
            content: '',
            edited: false,
            version: 0,
            parent_id: get().rootNodeIds.at(-1) ?? null,
            branch_ids: [],
            source_refs: [],
            streaming: true,
          });
          const { nodes, rootNodeIds, userMemory } = get();
          const messages = rootNodeIds
            .map((id) => nodes[id])
            .filter((n) => n && n.id !== assistantId)
            .map((n) => ({ role: n.role, content: htmlToText(n.content) }))
            .filter((m) => m.content.trim() !== '');
          await streamInto(assistantId, withMemory(MAIN_SYSTEM_PROMPT, userMemory), messages);
        },

        sendDrawerMessage: async (drawerId, content) => {
          const text = content.trim();
          if (!text || get().isStreaming) return;
          const drawer = get().drawers[drawerId];
          if (!drawer) return;
          addDrawerNode(drawerId, {
            role: 'user',
            content: textToHtml(text),
            edited: false,
            version: 0,
            parent_id: drawer.node_ids.at(-1) ?? drawer.root_message_id,
            branch_ids: [],
            source_refs: [],
          });
          const assistantId = addDrawerNode(drawerId, {
            role: 'assistant',
            content: '',
            edited: false,
            version: 0,
            parent_id: null,
            branch_ids: [],
            source_refs: [],
            streaming: true,
          });
          const { nodes, userMemory } = get();
          const refreshed = get().drawers[drawerId];
          const messages = refreshed.node_ids
            .map((id) => nodes[id])
            .filter((n) => n && n.id !== assistantId)
            .map((n) => ({ role: n.role, content: htmlToText(n.content) }))
            .filter((m) => m.content.trim() !== '');
          const system = withMemory(
            `${DRAWER_SYSTEM_PROMPT}\n\n${drawerContext(drawer.highlighted_text)}`,
            userMemory,
          );
          await streamInto(assistantId, system, messages);
        },

        runSemanticAction: async ({
          rootMessageId,
          highlighted,
          displayLabel,
          prompt,
          parentDrawerId,
        }) => {
          if (get().isStreaming) return;
          const drawerId = get().createDrawer({
            root_message_id: rootMessageId,
            highlighted_text: highlighted,
            parent_drawer_id: parentDrawerId,
          });
          addDrawerNode(drawerId, {
            role: 'user',
            content: textToHtml(displayLabel),
            edited: false,
            version: 0,
            parent_id: rootMessageId,
            branch_ids: [],
            source_refs: [],
          });
          const assistantId = addDrawerNode(drawerId, {
            role: 'assistant',
            content: '',
            edited: false,
            version: 0,
            parent_id: null,
            branch_ids: [],
            source_refs: [],
            streaming: true,
          });
          const system = withMemory(
            `${DRAWER_SYSTEM_PROMPT}\n\n${drawerContext(highlighted)}`,
            get().userMemory,
          );
          await streamInto(assistantId, system, [{ role: 'user', content: prompt }]);
        },

        mergeUp: async (sourceNodeId, targetNodeId, strategy) => {
          if (get().isStreaming) return;
          const { nodes } = get();
          const source = nodes[sourceNodeId];
          const target = nodes[targetNodeId];
          if (!source || !target) return;
          const original = htmlToText(target.content);
          const branch = htmlToText(source.content);
          const prompt = buildMergePrompt(strategy, original, branch);

          set({ isStreaming: true, currentNodeId: targetNodeId, error: null });
          let acc = '';
          try {
            await streamChat({
              system: MAIN_SYSTEM_PROMPT,
              messages: [{ role: 'user', content: prompt }],
              settings: get().settings,
              onDelta: (chunk) => {
                acc += chunk;
                if (strategy !== 'insert') {
                  get().updateNode(targetNodeId, { content: textToHtml(acc) });
                }
              },
            });
            const merged =
              strategy === 'insert'
                ? `${target.content}${mdToHtml(`- ${acc}`)}`
                : mdToHtml(acc);
            get().updateNode(targetNodeId, {
              content: merged,
              edited: true,
              version: target.version + 1,
              source_refs: [...target.source_refs, sourceNodeId],
            });
          } catch (err) {
            if (strategy !== 'insert') {
              get().updateNode(targetNodeId, { content: target.content });
            }
            set({ error: err instanceof Error ? err.message : String(err) });
          } finally {
            set({ isStreaming: false, currentNodeId: null });
          }
        },

        reset: () =>
          set({
            nodes: {},
            rootNodeIds: [],
            drawers: {},
            activeDrawerIds: [],
            drawerCounter: 0,
            currentNodeId: null,
            error: null,
            editingNodeId: null,
          }),
      };
    },
    {
      name: 'nexuschat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings, userMemory: state.userMemory }),
    },
  ),
);
