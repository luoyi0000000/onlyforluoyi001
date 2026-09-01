import { Database, Globe, SearchCheck, ShieldCheck, Wrench } from 'lucide-react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { GlassCard } from '@/components/ui/glass-card'
import { storageKeys } from '@/config/site'
import { createTranslator, getDictionary, type Translator } from '@/lib/i18n'
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
  return { title: dict.about.title, description: dict.about.privacyBody }
}

function Article({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <GlassCard as="section" pad="lg" className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span aria-hidden="true" className="text-primary">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </GlassCard>
  )
}

/**
 * The stored keys are listed with their real localStorage names rather than a
 * prose summary, so the claim on this page is verifiable against DevTools
 * line by line.
 */
function StorageList({ t }: { t: Translator }) {
  const rows: ReadonlyArray<{ key: string; label: string }> = [
    { key: storageKeys.theme, label: t('about.storageTheme') },
    { key: storageKeys.locale, label: t('about.storageLocale') },
    { key: `${storageKeys.density} / ${storageKeys.accent}`, label: t('about.storagePrefs') },
    { key: storageKeys.favorites, label: t('about.storageFavorites') },
    { key: storageKeys.recent, label: t('about.storageRecent') },
  ]
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.key} className="flex flex-col gap-1 rounded-md glass-inset px-3 py-2">
          <code className="font-mono text-2xs break-all text-foreground">{row.key}</code>
          <span className="text-2xs text-muted-foreground">{row.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale)
  const t = createTranslator(locale)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-grid px-4 py-section safe-x sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t('about.title')}</h1>
        <p className="measure text-base text-muted-foreground">{t('about.lead')}</p>
      </header>

      <Article icon={<Wrench className="size-5" />} title={t('about.whatTitle')}>
        <p className="measure text-xs text-muted-foreground">{t('about.what')}</p>
      </Article>

      <Article icon={<ShieldCheck className="size-5" />} title={t('about.privacyTitle')}>
        <p className="measure text-xs text-muted-foreground">{t('about.privacyBody')}</p>
      </Article>

      <Article icon={<Database className="size-5" />} title={t('about.storageTitle')}>
        <StorageList t={t} />
        <p className="measure text-2xs text-muted-foreground">{t('about.storageNote')}</p>
      </Article>

      <Article icon={<Globe className="size-5" />} title={t('about.networkTitle')}>
        <p className="measure text-xs text-muted-foreground">{t('about.networkBody')}</p>
      </Article>

      <Article icon={<SearchCheck className="size-5" />} title={t('about.verifyTitle')}>
        <p className="measure text-xs text-muted-foreground">{t('about.verifyBody')}</p>
      </Article>
    </div>
  )
}
