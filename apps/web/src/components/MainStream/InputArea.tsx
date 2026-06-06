import { useRef, useState } from 'react';

interface Props {
  placeholder?: string;
  disabled?: boolean;
  onSend: (text: string) => void;
}

/** Auto-growing input with Enter-to-send / Shift+Enter for newline. */
export function InputArea({ placeholder, disabled, onSend }: Props) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const grow = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  return (
    <div className="input-inner">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder ?? '输入消息，Enter 发送，Shift+Enter 换行'}
        onChange={(e) => {
          setValue(e.target.value);
          grow();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button className="send-btn" onClick={submit} disabled={disabled || !value.trim()} title="发送">
        ➤
      </button>
    </div>
  );
}
