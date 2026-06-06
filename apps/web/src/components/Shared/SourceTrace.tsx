import { useChatStore } from '../../store/chatStore';
import { htmlToText, truncate } from '../../utils/id';
import type { MessageNode } from '../../types';

interface Props {
  node: MessageNode;
  x: number;
  y: number;
  onClose: () => void;
}

/** Provenance popover: shows how a bubble's content came to be (Prompt Trace). */
export function SourceTrace({ node, x, y, onClose }: Props) {
  const nodes = useChatStore((s) => s.nodes);

  return (
    <>
      <div className="modal-overlay" style={{ background: 'transparent' }} onClick={onClose} />
      <div className="trace-popover" style={{ left: x, top: y }}>
        <h4>🔍 生成依据 (Prompt Trace)</h4>
        <ul>
          <li>融合次数 version：{node.version}</li>
          <li>{node.edited ? '用户手动编辑过此内容' : '未经手动编辑'}</li>
          {node.source_refs.length > 0 ? (
            node.source_refs.map((ref, idx) => {
              const src = nodes[ref];
              return (
                <li key={ref}>
                  融合自分支 #{idx + 1}（{src?.role === 'user' ? '提问' : '回答'}）：
                  {src ? truncate(htmlToText(src.content), 60) : '已删除节点'}
                </li>
              );
            })
          ) : (
            <li>暂无外部融合来源，由模型直接生成。</li>
          )}
        </ul>
      </div>
    </>
  );
}
