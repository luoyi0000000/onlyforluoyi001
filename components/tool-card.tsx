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
 * The icon and title share one compact identity row, followed by the description
 * and status. The whole surface remains the link target while the favorite
 * button sits above the stretched link layer as a separate control.
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
          'relative flex h-full min-h-32 flex-col gap-4 overflow-hidden p-card',
          // The border warms to the accent on hover and on keyboard focus, so
          // the two states look identical instead of the pointer getting the
          // nicer one.
          'group-focus-within:border-primary/35 group-hover:border-primary/35',
        )}
      >
        <div className="flex items-start gap-3">
          {tool.iconSrc ? (
            // Same-origin owner artwork keeps custom cards visually distinct;
            // the lucide icon remains available as the semantic fallback.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tool.iconSrc}
              alt=""
              width={40}
              height={40}
              className={cn(
                'size-10 shrink-0 rounded-md bg-white/90 object-contain p-0.5 shadow-e1',
                'transition-transform duration-200 ease-glide',
                'group-focus-within:scale-[1.03] group-hover:scale-[1.03]',
              )}
            />
          ) : (
            <IconTile
              icon={Icon}
              accent={tool.accent}
              size="md"
              className={cn(
                'transition-transform duration-200 ease-glide',
                'group-focus-within:scale-[1.03] group-hover:scale-[1.03]',
              )}
            />
          )}

          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1 text-base font-semibold">
              {/* The stretched ::before turns the whole card into one hit area
                  and one tab stop, so the star can sit on top without nesting
                  interactive elements. */}
              <a
                href={target.href}
                data-card-link=""
                tabIndex={tabIndex}
                onKeyDown={onKeyDown}
                onClick={() => onNavigate?.(tool.id)}
                aria-label={fill(labels.open, { name })}
                {...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={cn(
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

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {tool.desc[locale]}
            </p>
          </div>

          {onToggleFavorite ? (
            <button
              type="button"
              aria-pressed={favorite}
              aria-label={fill(favorite ? labels.pinOff : labels.pinOn, { name })}
              onClick={() => onToggleFavorite(tool.id)}
              className={cn(
                'relative z-10 -mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-sm',
                'text-muted-foreground transition-opacity duration-200 ease-glide',
                'hover:bg-foreground/8 hover:text-foreground',
                'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                'group-focus-within:opacity-100 group-hover:opacity-100 coarse:size-11 coarse:opacity-100',
                favorite ? 'text-warning opacity-100' : 'opacity-55',
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
