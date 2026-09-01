'use client'

import { ClipboardPaste, Download, Eraser } from 'lucide-react'
import { useCallback, useId, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

/**
 * The reserved workspace and the two-pane template that fills it.
 *
 * `ToolWorkspaceShell` is the frame every tool page renders: a titled panel with
 * one slot. Pass children and they own the slot; pass nothing and the slot states
 * in plain words that this is where a tool goes, then renders `ToolTwoPane` below
 * it as a working example rather than a picture of one.
 *
 * `ToolTwoPane` is the part meant to be reused. It owns the input state, the
 * toolbar and every clipboard/file interaction, and takes the actual work as a
 * `transform` function — so a real tool is one pure function plus one line of
 * JSX, and nothing in this file has to change.
 */
export interface ToolWorkspaceLabels {
  title: string
  placeholder: string
  hint: string
  inputLabel: string
  outputLabel: string
  inputPlaceholder: string
  outputPlaceholder: string
  copy: string
  copied: string
  copyFailed: string
  clear: string
  paste: string
  pasteFailed: string
  download: string
}

export interface ToolWorkspaceShellProps {
  labels: ToolWorkspaceLabels
  /** The tool's own UI. Omit it to render the placeholder plus the template. */
  children?: ReactNode
}

export function ToolWorkspaceShell({ labels, children }: ToolWorkspaceShellProps) {
  return (
    <GlassCard as="section" pad="lg" className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">{labels.title}</h2>

      {children ?? (
        <>
          {/* A dashed outline, not a skeleton: a skeleton would imply something
              is loading. Nothing is loading — this space is unclaimed. */}
          <div
            className={cn(
              'flex flex-col items-center gap-2 rounded-md border border-dashed border-border',
              'bg-inset px-4 py-8 text-center',
            )}
          >
            <p className="text-xs font-medium text-foreground">{labels.placeholder}</p>
            <p className="measure text-2xs text-muted-foreground">{labels.hint}</p>
          </div>

          <ToolTwoPane labels={labels} />
        </>
      )}
    </GlassCard>
  )
}

export interface ToolTwoPaneProps {
  labels: ToolWorkspaceLabels
  /**
   * The tool itself. Left out, the pane passes text through unchanged, which is
   * what makes the template usable — copy and download operate on real content.
   */
  transform?: (input: string) => string
  /** Base name for the downloaded file; `.txt` is appended. */
  downloadName?: string
  rows?: number
}

export function ToolTwoPane({
  labels,
  transform,
  downloadName = 'output',
  rows = 10,
}: ToolTwoPaneProps) {
  const [input, setInput] = useState('')
  const [pasteFailed, setPasteFailed] = useState(false)
  const inputId = useId()
  const outputId = useId()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const output = transform === undefined ? input : transform(input)

  const clear = useCallback(() => {
    setInput('')
    setPasteFailed(false)
    inputRef.current?.focus()
  }, [])

  const paste = useCallback(async () => {
    // Reading the clipboard is a permission-gated operation and is simply
    // unavailable in an insecure context. When it is refused the caret is put
    // in the field instead, so the manual paste the user already knows still
    // works and the failure is stated rather than swallowed.
    if (navigator.clipboard?.readText === undefined) {
      setPasteFailed(true)
      inputRef.current?.focus()
      return
    }
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      setPasteFailed(false)
    } catch {
      setPasteFailed(true)
      inputRef.current?.focus()
    }
  }, [])

  const download = useCallback(() => {
    // Everything stays on the machine: a Blob URL is a pointer into this tab's
    // memory, so no bytes cross the network and no server sees the content.
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${downloadName}.txt`
    anchor.click()
    // Revoked on the next task, not immediately: Safari has been known to
    // cancel a download whose URL disappears in the same tick.
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }, [output, downloadName])

  const paneClass = cn(
    'w-full resize-y rounded-md border border-input bg-inset px-3 py-2',
    'font-mono text-2xs leading-relaxed text-foreground',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton
          value={() => output}
          labels={{ copy: labels.copy, copied: labels.copied, failed: labels.copyFailed }}
          disabled={output === ''}
        />
        <Button variant="outline" size="sm" onClick={() => void paste()}>
          <ClipboardPaste aria-hidden="true" className="size-4" />
          {labels.paste}
        </Button>
        <Button variant="outline" size="sm" onClick={download} disabled={output === ''}>
          <Download aria-hidden="true" className="size-4" />
          {labels.download}
        </Button>
        <Button variant="ghost" size="sm" onClick={clear} disabled={input === ''}>
          <Eraser aria-hidden="true" className="size-4" />
          {labels.clear}
        </Button>
      </div>

      {/* Mounted unconditionally so the message is a text change inside an
          existing live region rather than a region that pops into being. */}
      <p aria-live="polite" className={cn('text-2xs text-destructive', !pasteFailed && 'sr-only')}>
        {pasteFailed ? labels.pasteFailed : ''}
      </p>

      {/* One column until there is width for two full-height panes side by side.
          Below that they stack, which keeps both readable instead of squeezing
          two 20-character columns onto a phone. */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={inputId} className="text-2xs font-medium text-foreground">
            {labels.inputLabel}
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            rows={rows}
            spellCheck={false}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={labels.inputPlaceholder}
            className={paneClass}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={outputId} className="text-2xs font-medium text-foreground">
            {labels.outputLabel}
          </label>
          <textarea
            id={outputId}
            rows={rows}
            readOnly
            spellCheck={false}
            value={output}
            placeholder={labels.outputPlaceholder}
            className={cn(paneClass, 'text-muted-foreground')}
          />
        </div>
      </div>
    </div>
  )
}
