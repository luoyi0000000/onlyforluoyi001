'use client'

import { Search } from 'lucide-react'

import { ShortcutHint } from '@/components/ui/shortcut-hint'
import { useApplePlatform } from '@/hooks/use-hotkeys'
import { openPalette } from '@/lib/palette-events'
import { cn } from '@/lib/utils'

/**
 * The header's global search affordance: a button that looks like a field.
 *
 * It is an anchor, not a bare button, so it still does something useful with
 * JavaScript switched off — it jumps to the full list of entries on the home
 * page. With JavaScript it opens the command palette instead.
 */
export interface SearchTriggerProps {
  label: string
  placeholder: string
  /** Fallback destination for the no-JS case, e.g. `/zh/#all-tools`. */
  href: string
  className?: string
}

export function SearchTrigger({ label, placeholder, href, className }: SearchTriggerProps) {
  const apple = useApplePlatform()

  return (
    <a
      href={href}
      aria-label={label}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        openPalette()
      }}
      className={cn(
        'group flex h-9 items-center gap-2 rounded-md border border-input glass-inset px-2.5',
        'text-2xs text-muted-foreground',
        // `halo` puts an accent-tinted blur behind the control on hover and on
        // keyboard focus. It is the one place on the page that gets it: this is
        // the entry point the ⌘K hint advertises, and a glow on everything is a
        // glow on nothing.
        'halo',
        'transition-[border-color,color] duration-200 ease-glide',
        'hover:border-foreground/30 hover:text-foreground',
        'focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'coarse:h-11',
        className,
      )}
    >
      <Search aria-hidden="true" className="size-4 shrink-0" />
      <span className="hidden truncate sm:inline">{placeholder}</span>
      <ShortcutHint keys={['mod', 'K']} apple={apple} className="ml-auto hidden sm:inline-flex" />
    </a>
  )
}
