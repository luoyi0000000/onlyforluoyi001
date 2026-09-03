import type { Metadata } from 'next'

import { Hero } from '@/components/hero'
import { HomeShell, type HomeShellLabels } from '@/components/home-shell'
import { HeroSlot, HomeMidSlot, HomeSlot, HomeTopSlot } from '@/components/slots'
import { siteConfig } from '@/config/site'
import { createTranslator, getDictionary, pick } from '@/lib/i18n'
import { assertValidToolConfig } from '@/lib/validate-config'
import { isExternalHref, localePath } from '@/lib/utils'
import { isLocale, locales, type Locale } from '@/types/i18n'

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }))
}

function requireLocale(raw: string): Locale {
  if (!isLocale(raw)) throw new Error(`[i18n] Unsupported locale segment "${raw}".`)
  return raw
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const dict = getDictionary(requireLocale((await params).locale))
  return { description: dict.meta.description }
}

/**
 * A config href may be an in-page anchor (`#all-tools`), an absolute URL, or a
 * site-relative path (`about`). Only the last one needs the locale prefix.
 */
function resolveHref(locale: Locale, href: string): string {
  if (href.startsWith('#') || isExternalHref(href)) return href
  return localePath(locale, href)
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale)
  const t = createTranslator(locale)

  // Runs at build time, in a server component, so a broken registry fails
  // `pnpm build` instead of shipping a blank grid to a visitor.
  assertValidToolConfig()

  const { hero, features } = siteConfig

  const labels: HomeShellLabels = {
    card: {
      open: t('card.open'),
      externalHint: t('card.externalHint'),
      demoHint: t('card.demoHint'),
      pinOn: t('card.pinOn'),
      pinOff: t('card.pinOff'),
      badges: { new: t('badge.new'), beta: t('badge.beta'), wip: t('badge.wip') },
      demoBadge: t('badge.demo'),
    },
    discovery: {
      search: t('actions.search'),
      placeholder: t('actions.searchPlaceholder'),
      clearSearch: t('search.clear'),
      categories: t('nav.categories'),
      allCategories: t('sections.all'),
      clearFilters: t('empty.clearFilters'),
      resultCount: t('search.resultCount'),
      resultCountFiltered: t('search.resultCountFiltered'),
    },
    countLabel: t('sidebar.toolCount'),
    emptyTitle: t('empty.noToolsTitle'),
    emptyDesc: t('empty.noToolsDesc'),
    noResultsTitle: t('empty.noResultsTitle'),
    noResultsDesc: t('empty.noResultsDesc'),
    clearFilters: t('empty.clearFilters'),
    slotTitle: t('slot.title'),
    slotDesc: t('slot.desc'),
  }

  return (
    // `max-w-6xl` rather than `7xl`: with the sidebar gone the page is a single
    // centred column, and 1152px is where four cards still fill a row without
    // the copy above them stretching into a banner.
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-section px-4 py-section safe-x sm:px-6">
      {features.showHero ? (
        <Hero
          title={pick(hero.title, locale)}
          subtitle={pick(hero.subtitle, locale)}
          eyebrow={pick(siteConfig.slogan, locale)}
          primary={{
            label: pick(hero.primaryCta.label, locale),
            href: resolveHref(locale, hero.primaryCta.href),
          }}
          secondary={{
            label: pick(hero.secondaryCta.label, locale),
            href: resolveHref(locale, hero.secondaryCta.href),
          }}
          hint={t('hero.hint')}
          collapsedTitle={pick(siteConfig.name, locale)}
          collapsedSubtitle={pick(siteConfig.slogan, locale)}
          dismissLabel={t('hero.dismiss')}
          restoreLabel={t('hero.restore')}
          dismissible={hero.dismissible}
          slot={<HeroSlot locale={locale} />}
        />
      ) : (
        // The page keeps a level-1 heading even with the hero switched off.
        <h1 className="sr-only">{pick(siteConfig.name, locale)}</h1>
      )}

      <HomeShell
        locale={locale}
        labels={labels}
        settings={siteConfig.home}
        topSlot={<HomeTopSlot locale={locale} />}
        midSlot={<HomeMidSlot locale={locale} />}
        slot={<HomeSlot locale={locale} />}
      />
    </div>
  )
}
