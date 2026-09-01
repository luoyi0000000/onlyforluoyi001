import { cn } from '@/lib/utils'

/**
 * Keyboard shortcut hint rendered as real <kbd> elements.
 *
 * Pass platform-neutral tokens (`mod`, `shift`, `enter`, `esc`) and the display
 * glyph is picked per key. `mod` renders as ⌘ only when the caller says the
 * platform is Apple-like, so a static export can still render a sensible
 * default on the server.
 */
const glyphs: Record<string, { apple: string; other: string; label: string }> = {
  mod: { apple: '⌘', other: 'Ctrl', label: 'Command or Control' },
  alt: { apple: '⌥', other: 'Alt', label: 'Option or Alt' },
  shift: { apple: '⇧', other: 'Shift', label: 'Shift' },
  enter: { apple: '↵', other: '↵', label: 'Enter' },
  esc: { apple: 'Esc', other: 'Esc', label: 'Escape' },
  up: { apple: '↑', other: '↑', label: 'Arrow up' },
  down: { apple: '↓', other: '↓', label: 'Arrow down' },
  left: { apple: '←', other: '←', label: 'Arrow left' },
  right: { apple: '→', other: '→', label: 'Arrow right' },
}

export interface ShortcutHintProps {
  /** e.g. `['mod', 'K']` or `['/']` */
  keys: readonly string[]
  apple?: boolean
  className?: string
  /** Accessible name for the whole combination. */
  label?: string
}

export function ShortcutHint({ keys, apple = false, className, label }: ShortcutHintProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 tnum', className)}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {keys.map((key, index) => {
        const glyph = glyphs[key.toLowerCase()]
        const text = glyph ? (apple ? glyph.apple : glyph.other) : key.toUpperCase()
        return (
          <kbd
            // Shortcut arrays are static config, so index is a stable key here.
            key={`${key}-${index}`}
            aria-hidden={label ? 'true' : undefined}
            className={cn(
              'inline-flex min-w-5 items-center justify-center rounded-sm border border-border',
              'bg-inset px-1 py-0.5 font-sans text-2xs leading-none text-muted-foreground',
            )}
          >
            {text}
          </kbd>
        )
      })}
    </span>
  )
}
