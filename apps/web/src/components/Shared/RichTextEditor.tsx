import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Props {
  initialHtml: string;
  onSave: (html: string) => void;
  onCancel: () => void;
}

/** Tiptap-powered inline rich-text editor for AI/user message bubbles. */
export function RichTextEditor({ initialHtml, onSave, onCancel }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml || '<p></p>',
    autofocus: 'end',
  });

  if (!editor) return null;

  const btn = (active: boolean) => (active ? 'save' : '');

  return (
    <div className="editor-wrap" onMouseDown={(e) => e.stopPropagation()}>
      <EditorContent editor={editor} />
      <div className="editor-actions">
        <button
          type="button"
          className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="加粗"
        >
          B
        </button>
        <button
          type="button"
          className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜体"
        >
          i
        </button>
        <button
          type="button"
          className={btn(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="列表"
        >
          •
        </button>
        <button
          type="button"
          className={btn(editor.isActive('codeBlock'))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="代码块"
        >
          {'</>'}
        </button>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="save" onClick={() => onSave(editor.getHTML())}>
          保存
        </button>
      </div>
    </div>
  );
}
