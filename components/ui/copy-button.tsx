'use client'

import { Check, Copy, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Copy-to-clipboard with an honest failure state.
 *
 * `navigator.clipboard` is unavailable outside a secure context and can be
 * refused by permission policy even inside one. Rather than pretend, the button
 * says so: three states, each announced through a live region that exists in the
 * DOM from the first render — a region inserted at the same moment its text
 * appears is frequently missed by screen readers.
 *
 * There is deliberately no `document.execCommand('copy')` fallback. It needs a
 * throwaway textarea, a selection steal and a focus round trip, all to serve
 * browsers this project does not target.
 */
export interface CopyButtonLabels {
  copy: string
  copied: string
  failed: string
}

type CopyState = 'idle' | 'copied' | 'failed'

/** Long enough to read, short enough that the button is ready again quickly. */
const RESET_MS = 1600

export interface CopyButtonProps {
  /**
   * A getter is accepted so a caller with a large or lazily derived value does
   * not have to keep it in a prop on every keystroke.
   */
  value: string | (() => string)
  labels: CopyButtonLabels
  disabled?: boolean
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  /** `false` renders icon-only; the accessible name still comes from `labels`. */
  showLabel?: boolean
}

const icons: Record<CopyState, typeof Copy> = {
  idle: Copy,
  copied: Check,
  failed: TriangleAlert,
}

export function CopyButton({
  value,
  labels,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
  showLabel = true,
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(async () => {
    const text = typeof value === 'function' ? value() : value
    let ok = false

    // Optional chaining rather than a feature flag: `clipboard` is undefined in
    // an insecure context, and `writeText` can be missing on its own.
    if (navigator.clipboard?.writeText !== undefined && text !== '') {
      try {
        await navigator.clipboard.writeText(text)
        ok = true
      } catch {
        ok = false
      }
    }

    setState(ok ? 'copied' : 'failed')
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), RESET_MS)
  }, [value])

  const label =
    state === 'copied' ? labels.copied : state === 'failed' ? labels.failed : labels.copy
  const Icon = icons[state]

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => void copy()}
        aria-label={showLabel ? undefined : label}
        className={cn(state === 'failed' && 'text-destructive', className)}
      >
        <Icon aria-hidden="true" className="size-4" />
        {showLabel ? <span>{label}</span> : null}
      </Button>

      {/* Always mounted, empty while idle: the announcement rides on a text
          change inside an existing region, not on the region appearing. */}
      <span aria-live="polite" className="sr-only">
        {state === 'idle' ? '' : label}
      </span>
    </>
  )
}
