import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';

export function MainStream() {
  const rootNodeIds = useChatStore((s) => s.rootNodeIds);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const hasKey = useChatStore((s) => Boolean(s.settings.apiKey));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rootNodeIds.length, isStreaming]);

  return (
    <div className="main-stream">
      <div className="stream-scroll" ref={scrollRef}>
        {rootNodeIds.length === 0 ? (
          <div className="empty-state">
            <h3>🧠 开始你的思考</h3>
            <p>提问后，划选任意回答即可在右侧抽屉深钻；满意的分支可“向上融合”回主线草稿。</p>
          </div>
        ) : (
          <div className="stream-inner">
            {rootNodeIds.map((id) => (
              <MessageBubble key={id} nodeId={id} />
            ))}
          </div>
        )}
      </div>
      <div className="input-area">
        <InputArea
          disabled={isStreaming || !hasKey}
          placeholder={hasKey ? undefined : '请先在右上角配置 API Key'}
          onSend={(text) => void sendMessage(text)}
        />
      </div>
    </div>
  );
}
