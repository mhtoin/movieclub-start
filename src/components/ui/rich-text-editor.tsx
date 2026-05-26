'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  Unlink,
} from 'lucide-react'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  minHeight = '120px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-primary underline underline-offset-2 hover:text-primary/80',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[80px] px-3.5 py-2 text-sm leading-relaxed text-foreground placeholder:text-gray-400',
        'data-placeholder': placeholder,
      },
    },
    immediatelyRender: false,
  })

  const toggleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      editor?.chain().focus().toggleHeading({ level }).run()
    },
    [editor],
  )
  const toggleBold = useCallback(
    () => editor?.chain().focus().toggleBold().run(),
    [editor],
  )
  const toggleItalic = useCallback(
    () => editor?.chain().focus().toggleItalic().run(),
    [editor],
  )
  const toggleUnderline = useCallback(
    () => editor?.chain().focus().toggleUnderline().run(),
    [editor],
  )
  const toggleBulletList = useCallback(
    () => editor?.chain().focus().toggleBulletList().run(),
    [editor],
  )
  const toggleOrderedList = useCallback(
    () => editor?.chain().focus().toggleOrderedList().run(),
    [editor],
  )

  const handleLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    if (previousUrl) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Link URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  const isH1 = editor.isActive('heading', { level: 1 })
  const isH2 = editor.isActive('heading', { level: 2 })
  const isH3 = editor.isActive('heading', { level: 3 })
  const isBold = editor.isActive('bold')
  const isItalic = editor.isActive('italic')
  const isUnderline = editor.isActive('underline')
  const isBulletList = editor.isActive('bulletList')
  const isOrderedList = editor.isActive('orderedList')
  const hasLink = editor.isActive('link')

  return (
    <div className="rounded-md border border-border bg-background overflow-hidden focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-primary transition-colors">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        <ToolbarButton
          active={isH1}
          onClick={() => toggleHeading(1)}
          label="Heading 1"
          text
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={isH2}
          onClick={() => toggleHeading(2)}
          label="Heading 2"
          text
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={isH3}
          onClick={() => toggleHeading(3)}
          label="Heading 3"
          text
        >
          H3
        </ToolbarButton>
        <span className="w-px h-4 bg-border mx-1" />
        <ToolbarButton active={isBold} onClick={toggleBold} label="Bold">
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton active={isItalic} onClick={toggleItalic} label="Italic">
          <Italic className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={isUnderline}
          onClick={toggleUnderline}
          label="Underline"
        >
          <UnderlineIcon className="size-3.5" />
        </ToolbarButton>
        <span className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          active={isBulletList}
          onClick={toggleBulletList}
          label="Bullet list"
        >
          <List className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={isOrderedList}
          onClick={toggleOrderedList}
          label="Ordered list"
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>
        <span className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          active={hasLink}
          onClick={handleLink}
          label={hasLink ? 'Remove link' : 'Add link'}
        >
          {hasLink ? (
            <Unlink className="size-3.5" />
          ) : (
            <Link className="size-3.5" />
          )}
        </ToolbarButton>
      </div>
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
  text,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
  text?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center justify-center rounded-md transition-colors',
        text ? 'h-7 w-7 text-[11px] font-bold' : 'h-7 w-7',
        active
          ? 'bg-foreground/15 text-foreground'
          : 'text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5',
      )}
    >
      {children}
    </button>
  )
}

export function RichTextContent({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  return (
    <div
      className={cn('rich-text', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
