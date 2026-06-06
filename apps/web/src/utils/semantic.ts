import type { ContentType, SemanticAction } from '../types';

const CODE_SIGNALS = [
  /[{}();]/,
  /=>/,
  /\b(function|const|let|var|return|import|export|class|def|async|await|for|while|if|else)\b/,
  /<\/?[a-z][\s\S]*>/i,
  /\b\w+\([^)]*\)/,
  /[=!<>]==?/,
];

/** Lightweight, millisecond client-side classification of a selection. */
export function detectContentType(raw: string): ContentType {
  const text = raw.trim();
  if (!text) return 'sentence';

  const codeScore = CODE_SIGNALS.reduce((acc, re) => acc + (re.test(text) ? 1 : 0), 0);
  const symbolRatio = (text.match(/[{}();=<>[\]/]/g)?.length ?? 0) / text.length;
  if (codeScore >= 2 || symbolRatio > 0.08 || text.includes('\n  ')) {
    return 'code';
  }

  const words = text.split(/\s+/).filter(Boolean);
  const hasSentencePunctuation = /[.!?。！？,，;；]/.test(text);
  const isCjkShort = /[\u4e00-\u9fa5]/.test(text) && text.length <= 12;
  if ((words.length <= 4 && !hasSentencePunctuation) || isCjkShort) {
    return 'term';
  }

  return 'sentence';
}

const CODE_ACTIONS: SemanticAction[] = [
  {
    id: 'explain-code',
    label: '解释代码',
    icon: '🐛',
    prompt: (s) => `请逐段解释下面这段代码的作用、关键逻辑与潜在副作用：\n\n${s}`,
  },
  {
    id: 'find-bug',
    label: '找 Bug',
    icon: '⚡',
    prompt: (s) => `请审查下面这段代码，指出潜在的 bug、边界问题与改进建议，并给出修正后的代码：\n\n${s}`,
  },
  {
    id: 'add-comments',
    label: '加注释',
    icon: '📝',
    prompt: (s) => `请为下面这段代码补充清晰、必要的注释（保持原逻辑不变），直接返回带注释的代码：\n\n${s}`,
  },
];

const TERM_ACTIONS: SemanticAction[] = [
  {
    id: 'plain-explain',
    label: '通俗解释',
    icon: '💡',
    prompt: (s) => `请用通俗易懂的方式解释「${s}」，并给一个贴近生活的类比。`,
  },
  {
    id: 'pros-cons',
    label: '优劣对比',
    icon: '⚖️',
    prompt: (s) => `请分析「${s}」的优点与缺点，并说明它适合 / 不适合的典型场景。`,
  },
  {
    id: 'history',
    label: '历史渊源',
    icon: '📜',
    prompt: (s) => `请讲讲「${s}」的由来与发展脉络：它解决了什么问题、如何演进到今天。`,
  },
];

const SENTENCE_ACTIONS: SemanticAction[] = [
  {
    id: 'rephrase',
    label: '换种润色',
    icon: '🔄',
    prompt: (s) => `请把下面这句话润色成更清晰、地道的表达，并给出 2 个不同风格的版本：\n\n${s}`,
  },
  {
    id: 'why',
    label: '为什么',
    icon: '🤔',
    prompt: (s) => `针对这段内容「${s}」，请解释其背后的原因 / 原理是什么。`,
  },
];

const DEEP_DIVE: SemanticAction = {
  id: 'deep-dive',
  label: '深度追问',
  icon: '🔍',
  prompt: (s) => `我想深入了解这部分内容：「${s}」。请展开讲讲，并指出值得进一步探索的方向。`,
};

export function actionsForType(type: ContentType): SemanticAction[] {
  switch (type) {
    case 'code':
      return [...CODE_ACTIONS, DEEP_DIVE];
    case 'term':
      return [...TERM_ACTIONS, DEEP_DIVE];
    case 'sentence':
    default:
      return [...SENTENCE_ACTIONS, DEEP_DIVE];
  }
}

export const TYPE_LABEL: Record<ContentType, string> = {
  code: 'Code',
  term: 'Term',
  sentence: 'Text',
};
