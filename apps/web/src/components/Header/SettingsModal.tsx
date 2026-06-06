import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import type { Provider } from '../../types';

interface Props {
  onClose: () => void;
}

const ANTHROPIC_MODELS = [
  'claude-3-5-sonnet-latest',
  'claude-3-5-haiku-latest',
  'claude-3-opus-latest',
];

export function SettingsModal({ onClose }: Props) {
  const settings = useChatStore((s) => s.settings);
  const userMemory = useChatStore((s) => s.userMemory);
  const setSettings = useChatStore((s) => s.setSettings);
  const setUserMemory = useChatStore((s) => s.setUserMemory);

  const [provider, setProvider] = useState<Provider>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [memory, setMemory] = useState(userMemory);

  const save = () => {
    setSettings({ provider, apiKey: apiKey.trim(), model: model.trim(), baseUrl: baseUrl.trim() });
    setUserMemory(memory);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>⚙️ 设置</h2>
        <p className="muted">
          Key 仅保存在本地浏览器（localStorage），请求直连模型服务，不经过任何中间服务器。
        </p>

        <div className="field">
          <label>模型提供方</label>
          <select
            value={provider}
            onChange={(e) => {
              const p = e.target.value as Provider;
              setProvider(p);
              if (p === 'anthropic') setModel('claude-3-5-sonnet-latest');
              else setModel('deepseek-chat');
            }}
          >
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI 兼容 (OpenAI / DeepSeek / 其他)</option>
          </select>
        </div>

        <div className="field">
          <label>API Key</label>
          <input
            type="password"
            value={apiKey}
            placeholder={provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div className="field">
          <label>模型</label>
          <input
            list="model-presets"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          {provider === 'anthropic' && (
            <datalist id="model-presets">
              {ANTHROPIC_MODELS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          )}
          <div className="hint">
            {provider === 'anthropic'
              ? '推荐 claude-3-5-sonnet-latest'
              : 'DeepSeek 示例：deepseek-chat；OpenAI 示例：gpt-4o-mini'}
          </div>
        </div>

        {provider === 'openai' && (
          <div className="field">
            <label>Base URL</label>
            <input
              value={baseUrl}
              placeholder="https://api.openai.com/v1"
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <div className="hint">DeepSeek 用 https://api.deepseek.com/v1</div>
          </div>
        )}

        <div className="field">
          <label>全局知识记忆（可选）</label>
          <input
            value={memory}
            placeholder="例如：我是 React 开发者，喜欢简洁幽默的语气"
            onChange={(e) => setMemory(e.target.value)}
          />
          <div className="hint">会在所有对话中自动作为上下文提供给模型。</div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={save}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
