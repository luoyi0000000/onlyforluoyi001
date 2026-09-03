'use client'

import { useEffect, useState } from 'react'

import { AppearanceMenu } from '@/components/layout/appearance-menu'
import { Brand } from '@/components/layout/brand'
import { LocaleToggle } from '@/components/locale-toggle'
import { SearchTrigger } from '@/components/search-trigger'
import { siteConfig } from '@/config/site'
import { createTranslator } from '@/lib/i18n'
import { localePath } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { localeMeta, type Locale } from '@/types/i18n'

/**
 * Fixed responsive header. The outer shell stays out of the page flow and the
 * inner navigation contracts after the user scrolls, matching the reference
 * navigation pattern without depending on CSS scroll timelines or nested blur
 * layers. That keeps the header above animated content in every browser.
 *
 * Four things live here — who this is, how to search it, where appearance is
 * configured, and what language it is in. The appearance disclosure keeps the
 * theme, accent and density controls together, so the bar stays a compact header
 * rather than becoming a preferences dialog stuck to the top of the page.
 *
 * Labels are resolved here and handed down as plain strings. A `t()` function
 * cannot cross into a client component — React has no way to serialize it — so
 * translation always happens on the server side of the boundary.
 *
 * `flex-wrap` stays as the safety net: at 320px the cluster can still be wider
 * than the viewport, and wrapping to a second line is the correct failure mode.
 * Nothing is ever hidden.
 *
 * Blur budget: this bar is one blurred layer and the panels underneath are the
 * second. Nothing inside the bar may use `.glass` again — which is why the
 * appearance panel is opaque, and why the bar's own sheen, rim and tint are
 * plain fills rather than more backdrop filters.
 */
export function Header({ locale }: { locale: Locale }) {
  const t = createTranslator(locale)
  const { enableCommandPalette } = siteConfig.features
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header id="top" className="pointer-events-none fixed inset-x-0 top-0 z-40 safe-x">
      <div
        className={cn(
          'pointer-events-auto mx-auto transition-[max-width,padding] duration-300 ease-glide',
          scrolled ? 'max-w-4xl px-3 pt-3' : 'max-w-6xl px-4 pt-2 sm:px-6 sm:pt-3',
        )}
      >
        <div
          className={cn(
            'flex flex-wrap items-center gap-x-3 gap-y-2 transition-[min-height,padding,background-color,box-shadow,border-radius] duration-300 ease-glide',
            scrolled
              ? 'min-h-12 rounded-2xl border border-border bg-card px-3 py-1.5 shadow-e2 sm:px-4'
              : 'rounded-xl glass px-3 py-2 sm:px-4 sm:py-2.5',
          )}
        >
          <Brand locale={locale} />

          <div className="ml-auto flex items-center gap-2">
            {enableCommandPalette ? (
              <SearchTrigger
                label={t('actions.openCommandPalette')}
                placeholder={t('actions.search')}
                // With JavaScript off this lands on the list of everything instead
                // of being a control that does nothing.
                href={`${localePath(locale)}#all-tools`}
                // A square icon button until there is room for a field: below
                // `sm` the placeholder and the ⌘K hint are both hidden, so a
                // 224px-wide box would be an empty rectangle with one glyph in it.
                className="size-9 justify-center px-0 sm:w-auto sm:min-w-56 sm:justify-start sm:px-2.5 coarse:size-11"
              />
            ) : null}

            <AppearanceMenu locale={locale} />

            <LocaleToggle
              labels={{
                group: t('locale.label'),
                // Written out per language rather than mapped, so adding a locale
                // is a compile error here instead of a silent missing label.
                switchTo: {
                  zh: t('locale.switchTo', { language: localeMeta.zh.label }),
                  en: t('locale.switchTo', { language: localeMeta.en.label }),
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
