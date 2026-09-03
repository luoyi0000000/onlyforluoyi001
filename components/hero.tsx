'use client'

import { ChevronDown, Sparkles, X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { ShortcutHint } from '@/components/ui/shortcut-hint'
import { storageKeys } from '@/config/site'
import { useApplePlatform } from '@/hooks/use-hotkeys'
import { removeKey, writeString } from '@/lib/storage'
import { cn } from '@/lib/utils'

/**
 * Dismissible intro panel — the one wide slab the page opens with.
 *
 * Both states are in the HTML and CSS picks one via `data-hero` on <html>,
 * which the pre-paint script in `PreferenceScript` sets from localStorage. That
 * is what keeps a dismissed hero from flashing into view for one frame before
 * hydration — a `useEffect` would run after the first paint, and there is no
 * useLayoutEffect on the server side of a prerender.
 *
 * Because CSS owns the visibility, this component holds no state at all: the
 * two buttons flip the attribute and write the preference. With JavaScript off
 * the attribute is never set, so the panel simply stays open.
 *
 * The `<h1>` exists in both states and only one of them is ever displayed, so
 * the page keeps exactly one level-1 heading either way.
 *
 * Layout note: wide screens use an asymmetric copy/actions grid so the intro is
 * faster to scan and wastes less vertical space; narrow screens stack the same
 * content in reading order. The decoration is a 1px gradient rim on the top
 * edge (`.slab-edge`) and a gradient fill on the headline. There is deliberately
 * no glow behind the panel, because glass is translucent and a bloom back there
 * would show through and put body copy on a gradient.
 */
export interface HeroProps {
  /** Big headline, shown while the panel is open. */
  title: string
  subtitle: string
  /** Short line above the headline. Omit to render no eyebrow. */
  eyebrow?: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
  /** Trailing half of the "⌘K to search" line. Omit to render no hint. */
  hint?: string
  /** Compact headline for the collapsed strip. Usually the site name. */
  collapsedTitle: string
  collapsedSubtitle: string
  dismissLabel: string
  restoreLabel: string
  /** When false the panel is permanent and neither button is rendered. */
  dismissible: boolean
  /** Optional extension point, rendered under the copy. */
  slot?: ReactNode
  className?: string
}

/**
 * The copy arrives one block at a time. Same step as the card grid so the whole
 * first screen reads as a single cascade rather than two competing ones.
 */
const STEP = 70

function delay(index: number) {
  return { animationDelay: `${index * STEP}ms` }
}

export function Hero({
  title,
  subtitle,
  eyebrow,
  primary,
  secondary,
  hint,
  collapsedTitle,
  collapsedSubtitle,
  dismissLabel,
  restoreLabel,
  dismissible,
  slot,
  className,
}: HeroProps) {
  const restoreRef = useRef<HTMLButtonElement>(null)
  const dismissRef = useRef<HTMLButtonElement>(null)
  const apple = useApplePlatform()

  function setDismissed(next: boolean) {
    const root = document.documentElement
    if (next) {
      root.setAttribute('data-hero', 'dismissed')
      writeString(storageKeys.heroDismissed, '1')
      // The button that was just clicked is now display:none, which drops focus
      // to <body>. Hand it to the control that took its place.
      restoreRef.current?.focus()
    } else {
      root.removeAttribute('data-hero')
      removeKey(storageKeys.heroDismissed)
      dismissRef.current?.focus()
    }
  }

  return (
    <div className={className}>
      <GlassCard data-hero-panel="" pad="lg" className="overflow-hidden rounded-xl">
        <span aria-hidden="true" className="slab-edge" />

        <div className="grid gap-6 py-1 sm:py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12 lg:py-5">
          <div className="flex min-w-0 flex-col items-start gap-4 text-left">
            {eyebrow ? (
              <p
                style={delay(0)}
                className={cn(
                  'rise-in inline-flex items-center gap-1.5 rounded-full border border-border',
                  'bg-inset px-2.5 py-1 text-2xs font-medium text-muted-foreground',
                )}
              >
                <Sparkles aria-hidden="true" className="size-4 shrink-0 text-primary" />
                {eyebrow}
              </p>
            ) : null}

            <h1
              style={delay(1)}
              className="rise-in text-gradient max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl"
            >
              {title}
            </h1>

            <p
              style={delay(2)}
              className="rise-in measure text-xs leading-relaxed text-muted-foreground sm:text-base"
            >
              {subtitle}
            </p>

            {slot}
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end lg:pb-1">
            <div
              style={delay(3)}
              className="rise-in flex flex-wrap justify-start gap-2 lg:justify-end"
            >
              <a href={primary.href} className={buttonVariants({ variant: 'primary', size: 'md' })}>
                {primary.label}
              </a>
              <a
                href={secondary.href}
                className={buttonVariants({ variant: 'outline', size: 'md' })}
              >
                {secondary.label}
              </a>
            </div>

            {hint ? (
              <p
                style={delay(4)}
                className="rise-in flex flex-wrap items-center gap-1.5 text-2xs text-muted-foreground"
              >
                <ShortcutHint keys={['mod', 'K']} apple={apple} />
                <span>{hint}</span>
              </p>
            ) : null}
          </div>
        </div>

        {dismissible ? (
          <button
            ref={dismissRef}
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={dismissLabel}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              // Quiet until asked for: a close button is not what the page is
              // about, and at full strength it pulls the eye off the headline.
              'absolute top-2 right-2 opacity-50 hover:opacity-100 focus-visible:opacity-100',
            )}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </GlassCard>

      {dismissible ? (
        <GlassCard
          data-hero-restore=""
          surface="solid"
          pad="sm"
          className="flex-wrap items-center gap-x-3 gap-y-1"
        >
          <h1 className="text-base font-semibold text-foreground">{collapsedTitle}</h1>
          <p className="text-2xs text-muted-foreground">{collapsedSubtitle}</p>
          <button
            ref={restoreRef}
            type="button"
            onClick={() => setDismissed(false)}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'ml-auto')}
          >
            <ChevronDown aria-hidden="true" className="size-4" />
            {restoreLabel}
          </button>
        </GlassCard>
      ) : null}
    </div>
  )
}
