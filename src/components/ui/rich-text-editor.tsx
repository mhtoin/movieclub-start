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
        heading: false,
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

  const isBold = editor.isActive('bold')
  const isItalic = editor.isActive('italic')
  const isUnderline = editor.isActive('underline')
  const isBulletList = editor.isActive('bulletList')
  const isOrderedList = editor.isActive('orderedList')
  const hasLink = editor.isActive('link')

  return (
    <div className="rounded-md border border-border bg-background overflow-hidden focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-primary transition-colors">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        <ToolbarButton active={isBold} onClick={toggleBold} label="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={isItalic} onClick={toggleItalic} label="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={isUnderline}
          onClick={toggleUnderline}
          label="Underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          active={isBulletList}
          onClick={toggleBulletList}
          label="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={isOrderedList}
          onClick={toggleOrderedList}
          label="Ordered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          active={hasLink}
          onClick={handleLink}
          label={hasLink ? 'Remove link' : 'Add link'}
        >
          {hasLink ? (
            <Unlink className="h-3.5 w-3.5" />
          ) : (
            <Link className="h-3.5 w-3.5" />
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
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground/70 hover:text-foreground hover:bg-accent',
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
