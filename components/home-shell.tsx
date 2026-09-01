'use client'

import { LayoutTemplate, PackageOpen } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'

import { CategorySection } from '@/components/category-section'
import { EmptyState } from '@/components/empty-state'
import type { ToolCardLabels } from '@/components/tool-card'
import { GlassCard } from '@/components/ui/glass-card'
import { useFavorites } from '@/hooks/use-favorites'
import { useRecent } from '@/hooks/use-recent'
import { groupByCategory } from '@/lib/tools'
import { cn, fill } from '@/lib/utils'
import type { Locale } from '@/types/i18n'

/**
 * The whole home page below the hero: two reserved bands you fill yourself, then
 * one pane carrying every registered tool.
 *
 * The pinned/recent rail that used to sit on top is gone. It was a summary of
 * data the page already shows — the star on a card and the command palette both
 * still work — and this is a personal launcher, so the space above the tool list
 * is worth more as somewhere to put your own things.
 *
 * The categories are one pane rather than four because four identical frames
 * stacked down the page read as four unrelated widgets, while one pane with
 * hairline-divided bands reads as a single list of everything you own. It also
 * keeps the whole page inside the two-blurred-layers-per-region budget with room
 * to spare: three panes, no nesting.
 *
 * There is no sidebar, no tag filter and no inline search box — searching is ⌘K.
 *
 * It is a client component because pins and history come out of localStorage.
 * Everything else it renders is static config, so the prerendered HTML already
 * contains every card; hydration only fills in the star states.
 */
export interface HomeShellLabels {
  card: ToolCardLabels
  /** Template such as "{count} tools". */
  countLabel: string
  emptyTitle: string
  emptyDesc: string
  /** Heading shown on a reserved band until its slot is filled. */
  slotTitle: string
  /** Template with `{name}`, naming the slot component to edit. */
  slotDesc: string
}

export interface HomeShellProps {
  locale: Locale
  labels: HomeShellLabels
  /** Fills the first reserved band. */
  topSlot?: ReactNode
  /** Fills the second reserved band. */
  midSlot?: ReactNode
  /** Optional extension point, rendered under the tool pane. */
  slot?: ReactNode
}

/**
 * One fillable pane.
 *
 * `min-h-71` is 17.75rem = 284px, measured off a one-row category pane at `lg`
 * (24 top pad + 36 header + 16 gap + 184 card row + 24 bottom pad), so an empty
 * band occupies exactly the footprint a filled one will and nothing jumps the day
 * something lands here. Both bands use it, which is what keeps them identical.
 */
function ReservedBand({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children?: ReactNode
}) {
  return (
    <GlassCard pad="panel" data-section-panel="" className="flex min-h-71 flex-col rounded-xl">
      {children ?? (
        /* A dashed frame rather than an `EmptyState`: this is not a list that
           happens to be empty, it is a slot waiting to be filled, and the dashed
           edge says so. It also stays a frame and not a second surface — no
           background, no border shorthand — so it neither adds a blurred layer
           nor collides with `glass-inset`'s own `border: 1px solid`, which the
           utility layer emits after `border-dashed` and would win. */
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-6 text-center">
          <LayoutTemplate aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="text-xl font-semibold tracking-tight">{title}</p>
          <p className="measure text-xs text-muted-foreground">{desc}</p>
        </div>
      )}
    </GlassCard>
  )
}

export function HomeShell({ locale, labels, topSlot, midSlot, slot }: HomeShellProps) {
  const { favorites, toggle } = useFavorites()
  const { push } = useRecent()

  const groups = useMemo(() => groupByCategory(), [])

  return (
    <>
      {/* Each band names the component that fills it, so the copy doubles as the
          instruction and the two are never confused for each other. */}
      <ReservedBand title={labels.slotTitle} desc={fill(labels.slotDesc, { name: 'HomeTopSlot' })}>
        {topSlot}
      </ReservedBand>

      <ReservedBand title={labels.slotTitle} desc={fill(labels.slotDesc, { name: 'HomeMidSlot' })}>
        {midSlot}
      </ReservedBand>

      {/* One pane for every category. The hero's primary call to action and the
          header's no-JS search fallback both point at this id.

          The bands inside are separated by a hairline and vertical rhythm rather
          than by their own frames: `divide-y` draws the rule, and the padding is
          zeroed at both ends so the first heading and the last card row still sit
          on the pane's own padding instead of one band's worth deeper. */}
      <GlassCard
        id="all-tools"
        pad="panel"
        data-section-panel=""
        className={cn(
          'flex scroll-mt-24 flex-col rounded-xl',
          'divide-y divide-border',
          '[&>section]:py-5 [&>section:first-child]:pt-0 [&>section:last-child]:pb-0',
        )}
      >
        {groups.length === 0 ? (
          <EmptyState icon={PackageOpen} title={labels.emptyTitle} description={labels.emptyDesc} />
        ) : (
          groups.map(({ category, tools }) => (
            <CategorySection
              key={category.id}
              id={`cat-${category.id}`}
              panel={false}
              title={category.name[locale]}
              icon={category.icon}
              count={tools.length}
              countLabel={fill(labels.countLabel, { count: tools.length })}
              tools={tools}
              locale={locale}
              labels={labels.card}
              favorites={favorites}
              onToggleFavorite={toggle}
              onNavigate={push}
            />
          ))
        )}
      </GlassCard>

      {slot}
    </>
  )
}
