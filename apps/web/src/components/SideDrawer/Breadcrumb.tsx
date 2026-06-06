import { useChatStore } from '../../store/chatStore';
import { truncate } from '../../utils/id';

interface Props {
  drawerId: string;
}

/** Breadcrumb trail: 主线 > selection 1 > selection 2 ... for the given drawer. */
export function Breadcrumb({ drawerId }: Props) {
  const drawers = useChatStore((s) => s.drawers);
  const focusDrawer = useChatStore((s) => s.focusDrawer);
  const closeDrawer = useChatStore((s) => s.closeDrawer);

  const chain: string[] = [];
  let cursor: string | undefined = drawerId;
  while (cursor) {
    chain.unshift(cursor);
    cursor = drawers[cursor]?.parent_drawer_id;
  }

  return (
    <div className="breadcrumb">
      <span className="crumb" onClick={() => closeDrawer(chain[0])}>
        主线
      </span>
      {chain.map((id, idx) => {
        const isLast = idx === chain.length - 1;
        return (
          <span key={id}>
            <span className="sep"> › </span>
            <span
              className={`crumb ${isLast ? 'active' : ''}`}
              onClick={() => !isLast && focusDrawer(id)}
            >
              {truncate(drawers[id]?.highlighted_text ?? '', 16)}
            </span>
          </span>
        );
      })}
    </div>
  );
}
