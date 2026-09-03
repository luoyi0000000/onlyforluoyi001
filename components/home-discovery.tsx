'use client'

import { RotateCcw, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface HomeCategoryOption {
  id: string
  label: string
  count: number
}

export interface HomeDiscoveryLabels {
  search: string
  placeholder: string
  clearSearch: string
  categories: string
  allCategories: string
  clearFilters: string
}

export interface HomeDiscoveryProps {
  labels: HomeDiscoveryLabels
  query: string
  categoryId: string | null
  categories: readonly HomeCategoryOption[]
  resultLabel: string
  showSearch: boolean
  showCategories: boolean
  onQueryChange: (query: string) => void
  onCategoryChange: (categoryId: string | null) => void
  onClear: () => void
}

function CategoryButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-2xs font-medium',
        'transition-[background-color,border-color,color] duration-200 ease-glide coarse:h-11',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active
          ? 'border-primary/45 bg-primary text-primary-foreground shadow-e1'
          : 'border-border bg-inset text-muted-foreground hover:border-foreground/25 hover:text-foreground',
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          'rounded-full px-1.5 py-0.5 tnum text-[0.6875rem] leading-none',
          active ? 'bg-primary-foreground/14' : 'bg-foreground/7',
        )}
      >
        {count}
      </span>
    </button>
  )
}

export function HomeDiscovery({
  labels,
  query,
  categoryId,
  categories,
  resultLabel,
  showSearch,
  showCategories,
  onQueryChange,
  onCategoryChange,
  onClear,
}: HomeDiscoveryProps) {
  const filtered = query.trim() !== '' || categoryId !== null
  const total = categories.reduce((sum, category) => sum + category.count, 0)

  return (
    <div className="flex flex-col gap-4 pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showSearch ? (
          <div role="search" className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              aria-label={labels.search}
              placeholder={labels.placeholder}
              className={cn(
                'h-11 w-full rounded-lg border border-input bg-inset pr-11 pl-10 text-xs text-foreground',
                'shadow-e1 transition-[border-color,box-shadow,background-color] duration-200 ease-glide outline-none',
                'hover:border-foreground/30 focus:border-ring focus:ring-3 focus:ring-ring/15',
              )}
            />
            {query !== '' ? (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label={labels.clearSearch}
                className={cn(
                  'absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md',
                  'text-muted-foreground hover:bg-foreground/7 hover:text-foreground',
                  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
                  'coarse:size-11',
                )}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="tnum text-2xs whitespace-nowrap text-muted-foreground"
          >
            {resultLabel}
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-2xs font-medium',
                'text-muted-foreground hover:bg-foreground/7 hover:text-foreground coarse:h-11',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              )}
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              {labels.clearFilters}
            </button>
          ) : null}
        </div>
      </div>

      {showCategories ? (
        <nav aria-label={labels.categories} className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-max gap-2">
            <CategoryButton
              active={categoryId === null}
              label={labels.allCategories}
              count={total}
              onClick={() => onCategoryChange(null)}
            />
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                active={categoryId === category.id}
                label={category.label}
                count={category.count}
                onClick={() => onCategoryChange(category.id)}
              />
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
