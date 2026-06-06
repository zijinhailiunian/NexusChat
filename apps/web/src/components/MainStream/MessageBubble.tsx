import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { RichTextEditor } from '../Shared/RichTextEditor';
import { SourceTrace } from '../Shared/SourceTrace';
import type { MergeStrategy } from '../../types';

interface Props {
  nodeId: string;
  /** When set, this bubble lives in a drawer and can be merged into this main-stream node. */
  mergeTargetId?: string;
}

const MERGE_OPTIONS: { strategy: MergeStrategy; title: string; desc: string }[] = [
  { strategy: 'extend', title: 'A · 扩展原文', desc: '把这段细节无缝揉进上方文章' },
  { strategy: 'replace', title: 'B · 替换原文', desc: '直接覆盖上方对应段落' },
  { strategy: 'insert', title: 'C · 子段插入', desc: '在上方段落后新建一个要点' },
];

export function MessageBubble({ nodeId, mergeTargetId }: Props) {
  const node = useChatStore((s) => s.nodes[nodeId]);
  const editingNodeId = useChatStore((s) => s.editingNodeId);
  const setEditingNode = useChatStore((s) => s.setEditingNode);
  const saveEdit = useChatStore((s) => s.saveEdit);
  const mergeUp = useChatStore((s) => s.mergeUp);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const [trace, setTrace] = useState<{ x: number; y: number } | null>(null);
  const [mergeAnchor, setMergeAnchor] = useState<{ x: number; y: number } | null>(null);

  if (!node) return null;
  const isEditing = editingNodeId === node.id;
  const canMerge = Boolean(mergeTargetId) && node.role === 'assistant' && !node.streaming;

  return (
    <div className={`bubble-row ${node.role}`}>
      <div
        className={`bubble ${node.role}`}
        data-node-id={node.id}
        onDoubleClick={() => !node.streaming && setEditingNode(node.id)}
      >
        {isEditing ? (
          <RichTextEditor
            initialHtml={node.content}
            onSave={(html) => saveEdit(node.id, html)}
            onCancel={() => setEditingNode(null)}
          />
        ) : (
          <div
            className={`content ${node.streaming ? 'cursor-blink' : ''}`}
            data-selectable
            dangerouslySetInnerHTML={{ __html: node.content || '<p></p>' }}
          />
        )}
      </div>

      {!isEditing && (
        <div className="bubble-meta">
          <span>{node.role === 'user' ? '你' : 'AI'}</span>
          {node.edited && <span className="edited-tag">已编辑</span>}
          {node.branch_ids.length > 0 && (
            <span className="branch-tag">↳ {node.branch_ids.length} 个分支</span>
          )}
          <div className="bubble-toolbar">
            {!node.streaming && (
              <button onClick={() => setEditingNode(node.id)}>✏️ 编辑</button>
            )}
            <button
              onClick={(e) => setTrace({ x: e.clientX - 280, y: e.clientY + 12 })}
            >
              🔍 来源
            </button>
            {canMerge && (
              <button
                onClick={(e) => setMergeAnchor({ x: e.clientX - 280, y: e.clientY + 12 })}
                disabled={isStreaming}
              >
                🧩 向上融合
              </button>
            )}
          </div>
        </div>
      )}

      {trace && (
        <SourceTrace node={node} x={trace.x} y={trace.y} onClose={() => setTrace(null)} />
      )}

      {mergeAnchor && mergeTargetId && (
        <>
          <div
            className="modal-overlay"
            style={{ background: 'transparent' }}
            onClick={() => setMergeAnchor(null)}
          />
          <div className="merge-popover" style={{ left: mergeAnchor.x, top: mergeAnchor.y }}>
            <h4>🧩 如何融合到主线？</h4>
            {MERGE_OPTIONS.map((opt) => (
              <button
                key={opt.strategy}
                className="merge-option"
                onClick={() => {
                  setMergeAnchor(null);
                  void mergeUp(node.id, mergeTargetId, opt.strategy);
                }}
              >
                <strong>{opt.title}</strong>
                <span>{opt.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
