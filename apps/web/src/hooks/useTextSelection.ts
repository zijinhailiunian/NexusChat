import { useCallback, useEffect, useState } from 'react';

export interface ActiveSelection {
  text: string;
  x: number; // viewport x of selection center
  y: number; // viewport y of selection top
  nodeId: string | null;
  drawerId: string | null;
}

/**
 * Tracks the current text selection inside elements marked with
 * `data-selectable`, resolving the owning message (`data-node-id`) and
 * drawer (`data-drawer-id`) so callers know where a branch should mount.
 */
export function useTextSelection(): {
  selection: ActiveSelection | null;
  clear: () => void;
} {
  const [selection, setSelection] = useState<ActiveSelection | null>(null);

  const clear = useCallback(() => setSelection(null), []);

  useEffect(() => {
    const onMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        return;
      }
      const text = sel.toString().trim();
      if (!text) return;

      const range = sel.getRangeAt(0);
      const anchor = range.commonAncestorContainer;
      const el =
        anchor.nodeType === Node.ELEMENT_NODE
          ? (anchor as Element)
          : anchor.parentElement;
      const selectable = el?.closest('[data-selectable]');
      if (!selectable) return;

      const rect = range.getBoundingClientRect();
      const nodeEl = el?.closest('[data-node-id]');
      const drawerEl = el?.closest('[data-drawer-id]');
      setSelection({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top,
        nodeId: nodeEl?.getAttribute('data-node-id') ?? null,
        drawerId: drawerEl?.getAttribute('data-drawer-id') ?? null,
      });
    };

    const onMouseDown = () => setSelection(null);

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  return { selection, clear };
}
