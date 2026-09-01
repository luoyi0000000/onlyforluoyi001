'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ToolCard, type ToolCardLabels } from '@/components/tool-card'
import type { Locale } from '@/types/i18n'
import type { ToolItem } from '@/types/tool'

/**
 * The card grid, with roving tabindex.
 *
 * A grid of 60 cards should not cost 60 tab stops. Exactly one card is
 * tabbable; the arrow keys move between cards and take the tab stop with them,
 * which is the pattern WAI-ARIA prescribes for a two-dimensional composite.
 *
 * Column count is read from the computed `grid-template-columns` at the moment
 * a key is pressed rather than tracked in state: the grid is `auto-fill`, so the
 * real answer depends on the container width and the density token, and asking
 * the browser is both cheaper and always right.
 */
export interface ToolGridProps {
  tools: readonly ToolItem[]
  locale: Locale
  labels: ToolCardLabels
  favorites?: readonly string[]
  onToggleFavorite?: (id: string) => void
  onNavigate?: (id: string) => void
  /** id of the heading that names this grid. */
  'aria-labelledby'?: string
}

export function ToolGrid({
  tools,
  locale,
  labels,
  favorites,
  onToggleFavorite,
  onNavigate,
  'aria-labelledby': labelledBy,
}: ToolGridProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  // A filter change can leave the tab stop pointing past the end of the list.
  useEffect(() => {
    setActive((current) => (current < tools.length ? current : 0))
  }, [tools.length])

  const columnCount = useCallback((): number => {
    const list = listRef.current
    if (!list) return 1
    const template = getComputedStyle(list).gridTemplateColumns
    const columns = template.split(' ').filter((part) => part.trim() !== '').length
    return Math.max(1, columns)
  }, [])

  const focusIndex = useCallback((index: number) => {
    const list = listRef.current
    if (!list) return
    const links = list.querySelectorAll<HTMLAnchorElement>('a[data-card-link]')
    const target = links[index]
    if (!target) return
    setActive(index)
    target.focus()
  }, [])

  const handleKeyDown = useCallback(
    (index: number) => (event: React.KeyboardEvent<HTMLAnchorElement>) => {
      const last = tools.length - 1
      if (last < 0) return

      const columns = columnCount()
      let next: number | null = null

      switch (event.key) {
        case 'ArrowRight':
          next = Math.min(index + 1, last)
          break
        case 'ArrowLeft':
          next = Math.max(index - 1, 0)
          break
        case 'ArrowDown':
          next = Math.min(index + columns, last)
          break
        case 'ArrowUp':
          next = Math.max(index - columns, 0)
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = last
          break
        default:
          return
      }

      if (next === null || next === index) {
        // Still swallow the key: letting ArrowDown scroll the page while the
        // user is clearly navigating the grid is worse than doing nothing.
        event.preventDefault()
        return
      }
      event.preventDefault()
      focusIndex(next)
    },
    [columnCount, focusIndex, tools.length],
  )

  return (
    <ul ref={listRef} aria-labelledby={labelledBy} className="m-0 tool-grid list-none p-0">
      {tools.map((tool, index) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          locale={locale}
          labels={labels}
          favorite={favorites?.includes(tool.id) ?? false}
          onToggleFavorite={onToggleFavorite}
          onNavigate={onNavigate}
          tabIndex={index === active ? 0 : -1}
          onKeyDown={handleKeyDown(index)}
          index={index}
        />
      ))}
    </ul>
  )
}
