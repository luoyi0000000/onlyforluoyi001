import { ArrowUpRight, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { IconTile } from '@/components/ui/icon-tile'
import { resolveIcon } from '@/lib/icons'
import { toolTarget } from '@/lib/tools'
import { cn, fill } from '@/lib/utils'
import type { Locale } from '@/types/i18n'
import type { BadgeKind, ToolItem } from '@/types/tool'

/**
 * Labels arrive pre-selected for the active language but still as templates —
 * `{name}` is filled in here, per card. That keeps the server from having to
 * emit one resolved string per tool per label.
 */
export interface ToolCardLabels {
  /** Template, e.g. "Open {name}". */
  open: string
  externalHint: string
  demoHint: string
  /** Templates for the star's accessible name. */
  pinOn: string
  pinOff: string
  badges: Record<BadgeKind, string>
  demoBadge: string
}

/** Shared with the tool detail page, so a badge means the same colour everywhere. */
export const badgeTone: Record<BadgeKind, 'success' | 'primary' | 'warning'> = {
  new: 'success',
  beta: 'primary',
  wip: 'warning',
}

/**
 * Entrance cascade, in milliseconds per card, and the index at which the
 * cascade stops growing. 28ms reads as one flowing gesture rather than as a
 * queue; capping at the 10th card keeps a 60-entry grid from taking 1.7s to
 * finish arriving.
 */
const STAGGER_STEP = 28
const STAGGER_CAP = 9

export interface ToolCardProps {
  tool: ToolItem
  locale: Locale
  labels: ToolCardLabels
  favorite?: boolean
  /** Omit to render a card with no star at all (e.g. a server-only listing). */
  onToggleFavorite?: (id: string) => void
  /** Roving tabindex: exactly one card in a grid holds 0, the rest hold -1. */
  tabIndex?: number
  onKeyDown?: (event: React.KeyboardEvent<HTMLAnchorElement>) => void
  onNavigate?: (id: string) => void
  /** Position in the grid. Drives the entrance delay, nothing else. */
  index?: number
}

/**
 * One entry in the launcher.
 *
 * Icon-first and vertical: a 48px tile on its own row, then the name, then two
 * lines of description, then whatever status the entry carries. A launcher is
 * scanned by shape and colour before it is read, and the tile is the only part
 * of a card that is recognisable at a glance, so it gets the top-left corner
 * instead of sharing a cramped row with a truncated title.
 *
 * Tags are deliberately not on the card face. They still exist in the config and
 * still feed the command palette's search index; putting three grey chips under
 * every entry filled the bottom of the card with text nobody reads on the way to
 * clicking it.
 */
export function ToolCard({
  tool,
  locale,
  labels,
  favorite = false,
  onToggleFavorite,
  tabIndex,
  onKeyDown,
  onNavigate,
  index = 0,
}: ToolCardProps) {
  const Icon = resolveIcon(tool.icon)
  const target = toolTarget(tool, locale)
  const name = tool.name[locale]
  const hasMeta = tool.demo === true || Boolean(tool.badge)

  return (
    <li
      data-card=""
      className="rise-in group relative list-none"
      style={{ animationDelay: `${Math.min(index, STAGGER_CAP) * STAGGER_STEP}ms` }}
    >
      {/* `inset` rather than `glass`: the section panel underneath already
          carries this region's one backdrop blur, so the card only needs the
          tint and the border. One blurred layer per section, not one per card. */}
      <GlassCard
        surface="inset"
        interactive
        className={cn(
          'relative flex h-full flex-col gap-3 overflow-hidden p-card',
          // The border warms to the accent on hover and on keyboard focus, so
          // the two states look identical instead of the pointer getting the
          // nicer one.
          'group-focus-within:border-primary/35 group-hover:border-primary/35',
        )}
      >
        <span aria-hidden="true" className="card-sheen" />

        <span
          aria-hidden="true"
          className="card-shimmer absolute inset-0 opacity-0 transition-opacity duration-200 ease-glide group-focus-within:opacity-100 group-hover:opacity-100"
        />

        <div className="flex items-start justify-between gap-2">
          <IconTile
            icon={Icon}
            accent={tool.accent}
            size="lg"
            className={cn(
              'transition-transform duration-200 ease-glide',
              'group-focus-within:scale-105 group-hover:scale-105',
            )}
          />

          {onToggleFavorite ? (
            <button
              type="button"
              aria-pressed={favorite}
              aria-label={fill(favorite ? labels.pinOff : labels.pinOn, { name })}
              onClick={() => onToggleFavorite(tool.id)}
              className={cn(
                // `relative z-10` lifts it above the stretched ::before of the
                // card link, so it stays clickable without being nested inside
                // the anchor. It shares the tile's row instead of floating in a
                // corner, which keeps it aligned at either density.
                'relative z-10 -mt-1 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-sm',
                'text-muted-foreground transition-opacity duration-200 ease-glide',
                'hover:bg-foreground/8 hover:text-foreground',
                // Fades in on hover, but it is a real tab stop at all times: the
                // opacity change never removes it from the focus order, and
                // `focus-visible` brings it back to full opacity.
                'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                'group-focus-within:opacity-100 group-hover:opacity-100 coarse:size-11 coarse:opacity-100',
                favorite ? 'text-warning opacity-100' : 'opacity-0',
              )}
            >
              <Star
                aria-hidden="true"
                className="size-4"
                fill={favorite ? 'currentColor' : 'none'}
              />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-1 text-base font-semibold">
            {/* The stretched ::before turns the whole card into one hit area
                and one tab stop, so the star can sit on top without nesting
                interactive elements. The focus ring is drawn on that same
                pseudo-element, which is why it outlines the card and not the
                three words of the title. */}
            <a
              href={target.href}
              data-card-link=""
              tabIndex={tabIndex}
              onKeyDown={onKeyDown}
              onClick={() => onNavigate?.(tool.id)}
              aria-label={fill(labels.open, { name })}
              {...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={cn(
                // Blockified as a flex child, which is what makes `truncate`
                // work on what is otherwise an inline element.
                'min-w-0 truncate rounded-sm',
                'before:absolute before:inset-0 before:rounded-lg before:content-[""]',
                'focus-visible:outline-none focus-visible:before:outline-2',
                'focus-visible:before:outline-offset-2 focus-visible:before:outline-ring',
              )}
            >
              <span aria-hidden="true">{name}</span>
            </a>

            {target.external ? (
              <>
                <ArrowUpRight
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground',
                    'transition-transform duration-200 ease-glide',
                    'group-focus-within:-translate-y-px group-hover:-translate-y-px',
                  )}
                />
                <span className="sr-only">{labels.externalHint}</span>
              </>
            ) : null}
          </h3>

          <p className="line-clamp-2 text-2xs leading-relaxed text-muted-foreground">
            {tool.desc[locale]}
          </p>
        </div>

        {hasMeta ? (
          <div className="mt-auto flex flex-wrap items-center gap-1.5">
            {tool.demo === true ? (
              <Badge tone="demo" title={labels.demoHint}>
                {labels.demoBadge}
              </Badge>
            ) : null}

            {tool.badge ? (
              <Badge tone={badgeTone[tool.badge]}>{labels.badges[tool.badge]}</Badge>
            ) : null}
          </div>
        ) : null}
      </GlassCard>
    </li>
  )
}
