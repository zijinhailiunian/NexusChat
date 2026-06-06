import type { Settings } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamOptions {
  system: string;
  messages: ChatMessage[];
  settings: Settings;
  onDelta: (textChunk: string) => void;
  signal?: AbortSignal;
}

export class LLMError extends Error {}

/** Iterate over an SSE stream body, yielding each `data:` payload string. */
async function* readSSE(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      if (signal?.aborted) return;
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          yield trimmed.slice(5).trim();
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function streamAnthropic(opts: StreamOptions): Promise<string> {
  const { settings, system, messages, onDelta, signal } = opts;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 2048,
      system,
      stream: true,
      messages,
    }),
  });

  if (!res.ok || !res.body) {
    throw new LLMError(await describeError(res));
  }

  let full = '';
  for await (const data of readSSE(res.body, signal)) {
    if (!data || data === '[DONE]') continue;
    try {
      const evt = JSON.parse(data);
      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        full += evt.delta.text;
        onDelta(evt.delta.text);
      } else if (evt.type === 'error') {
        throw new LLMError(evt.error?.message ?? 'Anthropic stream error');
      }
    } catch (err) {
      if (err instanceof LLMError) throw err;
      // ignore malformed keep-alive lines
    }
  }
  return full;
}

async function streamOpenAICompatible(opts: StreamOptions): Promise<string> {
  const { settings, system, messages, onDelta, signal } = opts;
  const base = settings.baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  if (!res.ok || !res.body) {
    throw new LLMError(await describeError(res));
  }

  let full = '';
  for await (const data of readSSE(res.body, signal)) {
    if (!data || data === '[DONE]') continue;
    try {
      const evt = JSON.parse(data);
      const chunk = evt.choices?.[0]?.delta?.content;
      if (chunk) {
        full += chunk;
        onDelta(chunk);
      }
    } catch {
      // ignore
    }
  }
  return full;
}

async function describeError(res: Response): Promise<string> {
  let detail = '';
  try {
    const body = await res.json();
    detail = body?.error?.message ?? JSON.stringify(body);
  } catch {
    detail = await res.text().catch(() => '');
  }
  return `请求失败 (${res.status})${detail ? `: ${detail}` : ''}`;
}

/** Provider-pluggable streaming chat. Defaults to Anthropic. */
export function streamChat(opts: StreamOptions): Promise<string> {
  if (!opts.settings.apiKey) {
    return Promise.reject(new LLMError('未配置 API Key，请先在右上角设置。'));
  }
  if (opts.settings.provider === 'openai') {
    return streamOpenAICompatible(opts);
  }
  return streamAnthropic(opts);
}
