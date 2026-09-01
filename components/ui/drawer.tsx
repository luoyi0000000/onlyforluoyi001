'use client'

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * A hand-rolled modal drawer: overlay, focus trap, Esc, scroll lock, focus
 * restore.
 *
 * Written rather than pulled in, because the only alternative in this stack is
 * a dialog primitive that would land in the initial bundle for the sake of one
 * mobile-only panel. Everything it needs is ~60 lines of DOM behaviour.
 *
 * It renders through a portal on `document.body` on purpose. Nesting a fixed
 * overlay inside the sticky `.glass` header would put it inside that element's
 * backdrop-filter containing block, and it would be clipped and blurred by its
 * own ancestor.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  children: React.ReactNode
  className?: string
}

export function Drawer({ open, onClose, title, closeLabel, children, className }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const panel = panelRef.current
    panel?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes || nodes.length === 0) {
        // Nothing to move to; keep focus inside rather than letting it escape
        // to the page behind the overlay.
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* Decorative: Esc and the labelled close button are the accessible ways
          out, so this must not appear as an unnamed button to a screen reader.

          A flat tint, not a blurred scrim: the panel is `.glass` and the sticky
          header underneath is too, so blurring here would stack three
          backdrop-filter layers in the same strip of screen. The tint is raised
          instead, which reads the same and costs nothing. */}
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-background/92" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex h-full w-[min(20rem,86vw)] flex-col gap-3 rounded-none border-y-0 border-l-0 glass p-4 safe-b',
          'overflow-y-auto outline-none',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">{title}</p>
          <Button variant="ghost" size="icon" aria-label={closeLabel} onClick={onClose}>
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
