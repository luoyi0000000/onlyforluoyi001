'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ShortcutHint } from '@/components/ui/shortcut-hint'
import { useApplePlatform } from '@/hooks/use-hotkeys'
import { cn } from '@/lib/utils'

/**
 * The `?` shortcut sheet.
 *
 * Built on Radix's dialog rather than the hand-rolled `Drawer`, for one reason:
 * this component only ever loads inside the same lazy chunk as the command
 * palette, and `cmdk` already brings `@radix-ui/react-dialog` with it. Using it
 * here costs nothing extra, while the initial bundle — which loads neither —
 * stays exactly as small as it was. That is also why the mobile drawer is still
 * hand-rolled: it *is* in the initial bundle.
 *
 * Rows are handed in already translated. This component knows about key glyphs
 * and layout, not about language.
 */
export interface ShortcutRow {
  /** `ShortcutHint` tokens, e.g. `['mod', 'K']`. */
  keys: readonly string[]
  label: string
}

export interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labels: {
    title: string
    desc: string
    close: string
  }
  rows: readonly ShortcutRow[]
}

export function ShortcutsDialog({ open, onOpenChange, labels, rows }: ShortcutsDialogProps) {
  const apple = useApplePlatform()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Flat tint, no blur: the panel is `.glass` and the sticky header behind
            it is too, which is already the whole two-layer budget. 92% so the
            page stays hidden even when the blur is dropped for
            `prefers-reduced-transparency`. */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/92" />

        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto',
            'rounded-lg glass p-5 outline-none',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-lg font-semibold">{labels.title}</Dialog.Title>
              <Dialog.Description className="measure text-2xs text-muted-foreground">
                {labels.desc}
              </Dialog.Description>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label={labels.close}
              onClick={() => onOpenChange(false)}
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>

          <dl className="mt-4 flex flex-col">
            {rows.map((row) => (
              <div
                key={row.label}
                className={cn(
                  'flex items-center justify-between gap-4 py-2',
                  'border-b border-border/60 last:border-b-0',
                )}
              >
                <dt className="text-xs">{row.label}</dt>
                <dd className="shrink-0">
                  <ShortcutHint keys={row.keys} apple={apple} />
                </dd>
              </div>
            ))}
          </dl>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
