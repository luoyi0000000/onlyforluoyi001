'use client'

import { LayoutTemplate, PackageOpen, SearchX } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { CategorySection } from '@/components/category-section'
import { EmptyState } from '@/components/empty-state'
import { HomeDiscovery, type HomeDiscoveryLabels } from '@/components/home-discovery'
import type { ToolCardLabels } from '@/components/tool-card'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import type { EmptySlotPresentation, HomeConfig } from '@/config/site'
import { useFavorites } from '@/hooks/use-favorites'
import { useRecent } from '@/hooks/use-recent'
import { selectHomeTools } from '@/lib/home-catalogue'
import { shouldRenderHomeSlot } from '@/lib/home-layout'
import { categoryCounts, enabledTools, groupByCategory, orderedCategories } from '@/lib/tools'
import { cn, fill } from '@/lib/utils'
import type { Locale } from '@/types/i18n'

/**
 * The whole home page below the hero: two optional extension bands followed by
 * one searchable, category-filterable catalogue carrying every registered tool.
 * Empty bands are hidden by default and can be exposed as authoring placeholders
 * through `siteConfig.home.emptySlots`.
 *
 * The categories are one pane rather than four because four identical frames
 * stacked down the page read as four unrelated widgets, while one pane with
 * hairline-divided bands reads as a single list of everything you own. It also
 * keeps the whole page inside the two-blurred-layers-per-region budget: one
 * catalogue pane plus at most two owner panes, with no blurred nesting.
 *
 * It is a client component because pins and history come out of localStorage.
 * Everything else it renders is static config, so the prerendered HTML already
 * contains every card; hydration only fills in the star states.
 */
export interface HomeShellLabels {
  card: ToolCardLabels
  discovery: HomeDiscoveryLabels & {
    resultCount: string
    resultCountFiltered: string
  }
  /** Template such as "{count} tools". */
  countLabel: string
  emptyTitle: string
  emptyDesc: string
  noResultsTitle: string
  noResultsDesc: string
  clearFilters: string
  /** Heading shown on a reserved band until its slot is filled. */
  slotTitle: string
  /** Template with `{name}`, naming the slot component to edit. */
  slotDesc: string
}

export interface HomeShellProps {
  locale: Locale
  labels: HomeShellLabels
  settings: HomeConfig
  /** Fills the first reserved band. */
  topSlot?: ReactNode
  /** Fills the second reserved band. */
  midSlot?: ReactNode
  /** Optional extension point, rendered under the tool pane. */
  slot?: ReactNode
}

/** One fillable pane with configurable hidden, compact or full empty states. */
function ReservedBand({
  title,
  desc,
  emptyPresentation,
  children,
}: {
  title: string
  desc: string
  emptyPresentation: EmptySlotPresentation
  children?: ReactNode
}) {
  const filled = children !== null && children !== undefined && children !== false
  if (!shouldRenderHomeSlot(filled, emptyPresentation)) return null

  return (
    <GlassCard
      pad="panel"
      data-section-panel=""
      className={cn(
        'flex flex-col rounded-xl',
        !filled && (emptyPresentation === 'full' ? 'min-h-71' : 'min-h-32'),
      )}
    >
      {filled ? (
        children
      ) : (
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

export function HomeShell({ locale, labels, settings, topSlot, midSlot, slot }: HomeShellProps) {
  const { favorites, toggle } = useFavorites()
  const { push } = useRecent()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const selectedTools = useMemo(
    () => selectHomeTools(enabledTools, { query, categoryId }),
    [query, categoryId],
  )
  const groups = useMemo(() => groupByCategory(selectedTools), [selectedTools])
  const counts = useMemo(() => categoryCounts(), [])
  const categoryOptions = useMemo(
    () =>
      orderedCategories
        .filter((category) => (counts[category.id] ?? 0) > 0)
        .map((category) => ({
          id: category.id,
          label: category.name[locale],
          count: counts[category.id] ?? 0,
        })),
    [counts, locale],
  )
  const filtered = query.trim() !== '' || categoryId !== null

  function clearFilters() {
    setQuery('')
    setCategoryId(null)
  }

  return (
    <>
      {/* Each band names the component that fills it, so the copy doubles as the
          instruction and the two are never confused for each other. */}
      <ReservedBand
        title={labels.slotTitle}
        desc={fill(labels.slotDesc, { name: 'HomeTopSlot' })}
        emptyPresentation={settings.emptySlots.top}
      >
        {topSlot}
      </ReservedBand>

      <ReservedBand
        title={labels.slotTitle}
        desc={fill(labels.slotDesc, { name: 'HomeMidSlot' })}
        emptyPresentation={settings.emptySlots.middle}
      >
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
        {enabledTools.length > 0 &&
        (settings.showInlineSearch || settings.showCategoryNavigation) ? (
          <HomeDiscovery
            labels={labels.discovery}
            query={query}
            categoryId={categoryId}
            categories={categoryOptions}
            resultLabel={fill(
              filtered ? labels.discovery.resultCountFiltered : labels.discovery.resultCount,
              { count: selectedTools.length, total: enabledTools.length },
            )}
            showSearch={settings.showInlineSearch}
            showCategories={settings.showCategoryNavigation}
            onQueryChange={setQuery}
            onCategoryChange={setCategoryId}
            onClear={clearFilters}
          />
        ) : null}

        {groups.length === 0 ? (
          <EmptyState
            icon={filtered ? SearchX : PackageOpen}
            title={filtered ? labels.noResultsTitle : labels.emptyTitle}
            description={filtered ? labels.noResultsDesc : labels.emptyDesc}
            action={
              filtered ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  {labels.clearFilters}
                </Button>
              ) : undefined
            }
            className={filtered ? 'mt-5' : undefined}
          />
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
