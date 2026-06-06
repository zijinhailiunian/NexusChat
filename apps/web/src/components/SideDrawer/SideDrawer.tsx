import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageBubble } from '../MainStream/MessageBubble';
import { InputArea } from '../MainStream/InputArea';
import { Breadcrumb } from './Breadcrumb';
import { truncate } from '../../utils/id';

interface Props {
  drawerId: string;
  depth: number;
}

/** A single knowledge drill-down drawer. Drawers stack to the right. */
export function SideDrawer({ drawerId, depth }: Props) {
  const drawer = useChatStore((s) => s.drawers[drawerId]);
  const drawers = useChatStore((s) => s.drawers);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const sendDrawerMessage = useChatStore((s) => s.sendDrawerMessage);
  const closeDrawer = useChatStore((s) => s.closeDrawer);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [drawer?.node_ids.length, isStreaming]);

  if (!drawer) return null;

  // Resolve the main-stream node this branch ultimately merges back into.
  let top = drawer;
  while (top.parent_drawer_id) top = drawers[top.parent_drawer_id];
  const mergeTargetId = top.root_message_id;

  return (
    <div
      className="side-drawer"
      data-drawer-id={drawerId}
      style={{ zIndex: 100 + depth, background: 'var(--drawer-bg-1)' }}
    >
      <div className="drawer-header">
        <Breadcrumb drawerId={drawerId} />
        <div className="drawer-title-row">
          <div className="trigger-context" title={drawer.highlighted_text}>
            “{truncate(drawer.highlighted_text, 80)}”
          </div>
          <button className="drawer-close" onClick={() => closeDrawer(drawerId)} title="关闭">
            ✕
          </button>
        </div>
      </div>

      <div className="drawer-scroll" ref={scrollRef}>
        {drawer.node_ids.map((id) => (
          <MessageBubble key={id} nodeId={id} mergeTargetId={mergeTargetId} />
        ))}
      </div>

      <div className="drawer-input">
        <InputArea
          disabled={isStreaming}
          placeholder="继续追问，或划词开子抽屉…"
          onSend={(text) => void sendDrawerMessage(drawerId, text)}
        />
      </div>
    </div>
  );
}
