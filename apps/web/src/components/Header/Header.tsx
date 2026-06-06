import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { SettingsModal } from './SettingsModal';

interface Props {
  onOpenGraph: () => void;
}

export function Header({ onOpenGraph }: Props) {
  const hasKey = useChatStore((s) => Boolean(s.settings.apiKey));
  const model = useChatStore((s) => s.settings.model);
  const reset = useChatStore((s) => s.reset);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="header">
      <div className="header-brand">
        <span className="logo">◆</span>
        <span>NexusChat</span>
        <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 'var(--text-sm)' }}>
          IDE for Thinking
        </span>
      </div>
      <div className="header-actions">
        <span className="api-pill" title={hasKey ? model : '未配置 API Key'}>
          <span className={`dot ${hasKey ? 'ok' : 'off'}`} />
          {hasKey ? model : '未连接'}
        </span>
        <button className="btn btn-ghost" onClick={onOpenGraph} title="全局图谱视野">
          🕸 图谱
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (confirm('清空当前所有对话与分支？此操作不可撤销。')) reset();
          }}
        >
          🗑 清空
        </button>
        <button className="btn btn-primary" onClick={() => setShowSettings(true)}>
          ⚙️ 设置
        </button>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
}
