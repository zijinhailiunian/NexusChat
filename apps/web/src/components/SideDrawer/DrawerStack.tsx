import { useChatStore } from '../../store/chatStore';
import { SideDrawer } from './SideDrawer';

/** Renders the active stack of drawers left-to-right (newest on the right). */
export function DrawerStack() {
  const activeDrawerIds = useChatStore((s) => s.activeDrawerIds);

  if (activeDrawerIds.length === 0) return null;

  return (
    <div className="drawer-stack">
      {activeDrawerIds.map((id, idx) => (
        <SideDrawer key={id} drawerId={id} depth={idx} />
      ))}
    </div>
  );
}
