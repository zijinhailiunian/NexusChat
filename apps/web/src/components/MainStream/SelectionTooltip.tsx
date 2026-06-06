import { useChatStore } from '../../store/chatStore';
import type { ActiveSelection } from '../../hooks/useTextSelection';
import { actionsForType, detectContentType, TYPE_LABEL } from '../../utils/semantic';

interface Props {
  selection: ActiveSelection;
  onClose: () => void;
}

/** Context-aware action menu shown when the user highlights text. */
export function SelectionTooltip({ selection, onClose }: Props) {
  const runSemanticAction = useChatStore((s) => s.runSemanticAction);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const type = detectContentType(selection.text);
  const actions = actionsForType(type);

  const handle = (label: string, prompt: string) => {
    if (!selection.nodeId) return;
    window.getSelection()?.removeAllRanges();
    onClose();
    void runSemanticAction({
      rootMessageId: selection.nodeId,
      highlighted: selection.text,
      displayLabel: label,
      prompt,
      parentDrawerId: selection.drawerId ?? undefined,
    });
  };

  return (
    <div
      className="selection-tooltip"
      style={{ left: selection.x, top: selection.y - 8 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="type-tag">{TYPE_LABEL[type]}</span>
      {actions.map((a) => (
        <button
          key={a.id}
          className="tooltip-btn"
          disabled={isStreaming}
          onClick={() => handle(`${a.icon} ${a.label}`, a.prompt(selection.text))}
        >
          {a.icon} {a.label}
        </button>
      ))}
    </div>
  );
}
