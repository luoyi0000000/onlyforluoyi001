import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '../globals.css'

import { BackgroundGlow } from '@/components/layout/background-glow'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { NoiseOverlay } from '@/components/layout/noise-overlay'
import { PaletteHost } from '@/components/palette-host'
import { PreferenceScript } from '@/components/preference-script'
import { SkipLink } from '@/components/skip-link'
import { FooterSlot } from '@/components/slots'
import { ThemeProvider } from '@/components/theme-provider'
import { siteConfig } from '@/config/site'
import { createTranslator, getDictionary, pick } from '@/lib/i18n'
import { isLocale, localeMeta, locales, type Locale } from '@/types/i18n'

/**
 * This is the root layout, even though it sits inside a dynamic segment. That is
 * deliberate: `<html lang>` has to be correct in the prerendered HTML for both
 * language builds, which is only possible if the element that renders <html>
 * knows the locale. A layout at `app/layout.tsx` would have to guess.
 */

interface LocaleParams {
  locale: string
}

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }))
}

/** Narrow the route param once, loudly, at build time. */
function requireLocale(raw: string): Locale {
  if (!isLocale(raw)) {
    throw new Error(
      `[i18n] Route segment "${raw}" is not a supported locale. Expected one of: ${locales.join(', ')}.`,
    )
  }
  return raw
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets the page paint into the notch area; `safe-x` / `safe-b` add the padding back.
  viewportFit: 'cover',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090a0f' },
    { media: '(prefers-color-scheme: light)', color: '#f6f7fa' },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>
}): Promise<Metadata> {
  const locale = requireLocale((await params).locale)
  const dict = getDictionary(locale)

  return {
    title: { default: dict.meta.title, template: dict.meta.titleTemplate },
    description: dict.meta.description,
    applicationName: pick(siteConfig.name, locale),
    icons: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    alternates: {
      canonical: `/${locale}/`,
      languages: Object.fromEntries(
        locales.map((code) => [localeMeta[code].htmlLang, `/${code}/`]),
      ),
    },
    // Nothing here is generated per-request, so nothing needs a referrer either.
    referrer: 'no-referrer',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<LocaleParams>
}) {
  const locale = requireLocale((await params).locale)
  const t = createTranslator(locale)

  return (
    <html
      lang={localeMeta[locale].htmlLang}
      data-accent={siteConfig.defaultAccent}
      data-density="comfortable"
      // next-themes writes `class` on this element before React hydrates.
      suppressHydrationWarning
    >
      <body>
        {/* Same origin, but CSS font fetches are always CORS-anonymous, so the
            preload has to be too or the browser downloads the file twice. */}
        <link
          rel="preload"
          href="/fonts/inter-latin-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <PreferenceScript />
        <ThemeProvider>
          <SkipLink label={t('a11y.skipToContent')} />
          <BackgroundGlow />
          <NoiseOverlay />
          <div className="flex min-h-dvh flex-col">
            <Header locale={locale} />
            {/* `relative z-0` guards the sticky header. The category panels run a
                scroll-driven `transform` animation, which promotes each of them to
                its own compositor layer, and a promoted layer is exactly the kind
                of thing that escapes above a `backdrop-filter` bar in a browser
                with a compositing bug. An explicit z-index makes this a stacking
                context at level 0, which no descendant can climb out of, so the
                `z-40` header is above the whole page by construction rather than
                by the compositor agreeing with us. Every overlay that must outrank
                the header (drawer, palette, shortcuts, skip link) is portaled to
                `body` or mounted outside `<main>`, so nothing is trapped under it. */}
            <main id="main" className="relative z-0 flex-1">
              {children}
            </main>
            <Footer locale={locale} slot={<FooterSlot locale={locale} />} />
          </div>

          {/* Mounted once for the whole site, outside <main>, so ⌘K and ? work on
              every page. It is two booleans until an overlay is asked for; the
              palette chunk is fetched only then. */}
          <PaletteHost
            locale={locale}
            enablePalette={siteConfig.features.enableCommandPalette}
            labels={{
              palette: {
                title: t('palette.title'),
                placeholder: t('palette.placeholder'),
                empty: t('palette.empty'),
                groupRecent: t('sections.recent'),
                groupTools: t('palette.groupTools'),
                groupCategories: t('palette.groupCategories'),
                groupActions: t('palette.groupActions'),
                groupAccents: t('palette.groupAccents'),
                toggleTheme: t('palette.actionToggleTheme'),
                toggleLocale: t('palette.actionToggleLocale'),
                toggleDensity: t('palette.actionToggleDensity'),
                clearRecent: t('palette.actionClearRecent'),
                openAbout: t('palette.actionOpenAbout'),
                showHelp: t('palette.actionShowHelp'),
                accentAction: t('palette.actionAccent'),
                // Written out per ramp rather than mapped, so adding a ramp is a
                // compile error here instead of a missing label at runtime.
                accents: {
                  indigo: t('accent.indigo'),
                  violet: t('accent.violet'),
                  cyan: t('accent.cyan'),
                  emerald: t('accent.emerald'),
                },
                themes: { light: t('theme.light'), dark: t('theme.dark') },
                densities: {
                  comfortable: t('density.comfortable'),
                  compact: t('density.compact'),
                },
                countLabel: t('sidebar.toolCount'),
                demoBadge: t('badge.demo'),
                externalHint: t('card.externalHint'),
                hintNavigate: t('palette.hintNavigate'),
                hintOpen: t('palette.hintOpen'),
                hintNewTab: t('palette.hintNewTab'),
                hintClose: t('palette.hintClose'),
              },
              shortcuts: {
                title: t('shortcuts.title'),
                desc: t('shortcuts.desc'),
                close: t('actions.close'),
                openPalette: t('shortcuts.openPalette'),
                focusSearch: t('shortcuts.focusSearch'),
                showHelp: t('shortcuts.showHelp'),
                closeOverlay: t('shortcuts.closeOverlay'),
                openInNewTab: t('shortcuts.openInNewTab'),
                moveInGrid: t('shortcuts.moveInGrid'),
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
