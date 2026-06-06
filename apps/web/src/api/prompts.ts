import type { MergeStrategy } from '../types';

export const MAIN_SYSTEM_PROMPT = `你是 NexusChat —— 一个"AI 思考与创作工作台"的智能助手。
- 回答要结构清晰、可直接作为草稿被编辑和复用。
- 涉及代码时使用 Markdown 代码块。
- 简洁但不遗漏关键点；优先给出可操作的内容。`;

export const DRAWER_SYSTEM_PROMPT = `你正在一个"知识下钻"侧边栏里回答问题。用户从主线内容中划选了一段文字，想要深入理解。
- 聚焦用户划选的上下文，给出深入但克制的解释。
- 适合被进一步追问，可在结尾点出值得深挖的方向。`;

/** Build the system prompt, optionally injecting long-term user memory. */
export function withMemory(base: string, memory: string): string {
  const mem = memory.trim();
  if (!mem) return base;
  return `${base}\n\n[关于用户的长期记忆，请在回答时自然地纳入考虑]\n${mem}`;
}

/** Context block describing the triggering selection for a drawer thread. */
export function drawerContext(highlighted: string): string {
  return `用户划选的内容是：\n"""\n${highlighted}\n"""\n`;
}

const MERGE_INSTRUCTIONS: Record<MergeStrategy, string> = {
  extend: '请把"分支内容"无缝地融合进"原文段落"，扩写成一段连贯、自然的文字。直接返回融合后的完整段落，不要解释。',
  replace: '请用"分支内容"的核心信息重写并替换"原文段落"，保持与上下文一致的风格。直接返回替换后的段落，不要解释。',
  insert: '请把"分支内容"提炼成一个简洁的要点（bullet），用于追加在"原文段落"之后。直接返回该要点文本，不要解释。',
};

export function buildMergePrompt(
  strategy: MergeStrategy,
  original: string,
  branch: string,
): string {
  return `${MERGE_INSTRUCTIONS[strategy]}

原文段落：
"""
${original}
"""

分支内容：
"""
${branch}
"""`;
}
