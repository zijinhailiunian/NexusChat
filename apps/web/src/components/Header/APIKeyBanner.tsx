import { useChatStore } from '../../store/chatStore';

interface Props {
  onConfigure: () => void;
}

/** Warning banner shown until an API key is configured. */
export function APIKeyBanner({ onConfigure }: Props) {
  const hasKey = useChatStore((s) => Boolean(s.settings.apiKey));
  const error = useChatStore((s) => s.error);
  const setError = useChatStore((s) => s.setError);

  if (hasKey && !error) return null;

  if (error) {
    return (
      <div className="banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
        <span>⚠️ {error}</span>
        <button style={{ color: '#991b1b' }} onClick={() => setError(null)}>
          知道了
        </button>
      </div>
    );
  }

  return (
    <div className="banner">
      <span>🔑 还没有配置模型 API Key，配置后即可开始对话。</span>
      <button onClick={onConfigure}>去设置</button>
    </div>
  );
}
