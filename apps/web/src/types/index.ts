export type Role = 'user' | 'assistant';

export type ContentType = 'code' | 'term' | 'sentence';

export type MergeStrategy = 'extend' | 'replace' | 'insert';

/** Core message entity. Stored in a single global map keyed by id (the DAG). */
export interface MessageNode {
  id: string;
  role: Role;
  content: string; // rich text (HTML)
  edited: boolean; // whether the user manually intervened
  version: number; // number of merges applied
  parent_id: string | null; // linear previous message
  branch_ids: string[]; // DrawerThread ids spawned from this node
  source_refs: string[]; // node ids this content was merged from (provenance)
  created_at: number;
  streaming?: boolean; // true while the assistant reply is being streamed
}

/** A side-drawer discussion thread (knowledge drill-down). */
export interface DrawerThread {
  id: string;
  root_message_id: string; // main-stream node this drawer is mounted on
  highlighted_text: string; // selection that triggered this branch
  node_ids: string[]; // message ids belonging to this drawer (point into the global map)
  parent_drawer_id?: string; // for nested drawers
  created_at: number;
}

export type Provider = 'anthropic' | 'openai';

export interface Settings {
  provider: Provider;
  apiKey: string;
  model: string;
  baseUrl: string; // used by openai-compatible providers (DeepSeek, etc.)
}

export interface SemanticAction {
  id: string;
  label: string;
  icon: string;
  /** Builds the user prompt sent to the model for this action. */
  prompt: (selection: string) => string;
}
