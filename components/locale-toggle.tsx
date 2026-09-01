'use client'

import Link from 'next/link'

import { useLocale } from '@/hooks/use-locale'
import { cn } from '@/lib/utils'
import { localeMeta, locales, type Locale } from '@/types/i18n'

export interface LocaleToggleLabels {
  group: string
  /** Pre-interpolated "switch to X" text, one per target language. */
  switchTo: Record<Locale, string>
}

/**
 * Real links, not buttons: the two languages are two separate static exports, so
 * switching is a navigation. That is also why it keeps working with JavaScript
 * disabled — the anchors are in the prerendered HTML with correct hrefs.
 *
 * The click handler is an enhancement only: it remembers the choice so the
 * language-detecting entry page at `/` honours it next time.
 */
export function LocaleToggle({ labels }: { labels: LocaleToggleLabels }) {
  const { locale, pathWithLocale, remember } = useLocale()

  return (
    <div
      role="group"
      aria-label={labels.group}
      className="inline-flex items-center gap-0.5 rounded-md glass-inset p-0.5"
    >
      {locales.map((candidate) => {
        const meta = localeMeta[candidate]
        const active = candidate === locale
        return (
          <Link
            key={candidate}
            href={pathWithLocale(candidate)}
            hrefLang={meta.htmlLang}
            lang={meta.htmlLang}
            aria-current={active ? 'true' : undefined}
            aria-label={active ? meta.label : labels.switchTo[candidate]}
            title={meta.label}
            onClick={() => remember(candidate)}
            className={cn(
              'inline-flex items-center justify-center rounded-sm px-2.5',
              'h-8 text-2xs font-medium whitespace-nowrap coarse:h-11 coarse:px-4',
              'transition-[background-color,color] duration-200 ease-glide',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
              active
                ? 'bg-primary text-primary-foreground shadow-e1'
                : 'text-muted-foreground hover:bg-foreground/8 hover:text-foreground',
            )}
          >
            {meta.shortLabel}
          </Link>
        )
      })}
    </div>
  )
}
