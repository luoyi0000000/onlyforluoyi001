import type { LucideIcon } from 'lucide-react'

import { ToolGrid } from '@/components/tool-grid'
import type { ToolCardLabels } from '@/components/tool-card'
import { GlassCard } from '@/components/ui/glass-card'
import { resolveIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types/i18n'
import type { ToolItem } from '@/types/tool'

/**
 * One titled band of the home page: pinned, recent, search results, or a
 * category. Each band is a real `<section>` with its own heading, so the page
 * has a navigable outline instead of one flat list of cards.
 *
 * By default the band *is* the glass pane — the same treatment as the hero panel
 * — and the cards it holds drop to `glass-inset`. That is a deliberate inversion
 * of the obvious arrangement: floating every card on its own blurred surface
 * costs one `backdrop-filter` per card, whereas carrying them on one pane costs
 * exactly one per section and reads as a tray of entries instead of a scatter of
 * tiles.
 *
 * Pass `panel={false}` when several bands share one outer pane. The band then
 * renders as a plain `<section>`, because the pane above it already supplies the
 * glass, the padding and the reveal animation — and stacking a second
 * `backdrop-filter` inside the first would both blow the two-layer budget and
 * blur nothing, since a nested filter only sees its ancestor's output.
 */
export interface CategorySectionProps {
  /** Anchor target — the sidebar and the palette both jump here. */
  id: string
  title: string
  /** Either a lucide component or a registered icon name from the config. */
  icon: LucideIcon | string
  count?: number
  /** Template such as "{count} tools", already language-selected. */
  countLabel?: string
  tools: readonly ToolItem[]
  locale: Locale
  labels: ToolCardLabels
  favorites?: readonly string[]
  onToggleFavorite?: (id: string) => void
  onNavigate?: (id: string) => void
  action?: React.ReactNode
  /** `false` renders a bare `<section>` for bands that share an outer pane. */
  panel?: boolean
  className?: string
}

export function CategorySection({
  id,
  title,
  icon,
  count,
  countLabel,
  tools,
  locale,
  labels,
  favorites,
  onToggleFavorite,
  onNavigate,
  action,
  panel = true,
  className,
}: CategorySectionProps) {
  const Icon = typeof icon === 'string' ? resolveIcon(icon) : icon
  const headingId = `section-${id}`

  const body = (
    <>
      <div className="flex items-center gap-2.5">
        {/* The icon gets a tinted plate rather than sitting bare next to the
            heading. At 16px a stroked glyph beside 20px text reads as a bullet
            point; a 36px plate reads as the section's marker and gives the row
            a consistent height whatever the glyph is. */}
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/12 text-primary"
        >
          <Icon className="size-4" />
        </span>
        <h2 id={headingId} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {count !== undefined && countLabel ? (
          <span className="rounded-full bg-inset px-2 py-0.5 tnum text-2xs text-muted-foreground">
            {countLabel}
          </span>
        ) : null}
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>

      <ToolGrid
        tools={tools}
        locale={locale}
        labels={labels}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onNavigate={onNavigate}
        aria-labelledby={headingId}
      />
    </>
  )

  // `scroll-mt-24` on both forms: `#cat-*` is a jump target from the palette, and
  // without it the sticky header would cover the heading it just scrolled to.
  if (!panel) {
    return (
      <section
        id={id}
        aria-labelledby={headingId}
        className={cn('flex scroll-mt-24 flex-col gap-4', className)}
      >
        {body}
      </section>
    )
  }

  return (
    <GlassCard
      as="section"
      id={id}
      aria-labelledby={headingId}
      pad="panel"
      data-section-panel=""
      // `rounded-xl` (24px) rather than the card default: the largest radius on
      // the scale belongs to the largest surface, otherwise the pane and the
      // tiles it holds look like the same kind of object.
      className={cn('flex scroll-mt-24 flex-col gap-4 rounded-xl', className)}
    >
      {body}
    </GlassCard>
  )
}
