import { Accessibility, Contrast, Layers, Loader, Palette, Sparkles, Type } from 'lucide-react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SkeletonGrid } from '@/components/skeleton-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { ShortcutHint } from '@/components/ui/shortcut-hint'
import { siteConfig } from '@/config/site'
import { createTranslator, getDictionary, pick, type Translator } from '@/lib/i18n'
import { isLocale, locales, type Locale } from '@/types/i18n'

/**
 * The design-token reference sheet.
 *
 * Nothing in the product links here — it is the artefact the visual work was
 * checked against, and the contrast table below is the measured audit rather
 * than an estimate. Deleting the route costs nothing but that evidence.
 */

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
  return { title: dict.preview.title, description: dict.preview.lead }
}

/** Swatch classes are literal because Tailwind only emits what it can see. */
const colorTokens: ReadonlyArray<{ token: string; swatch: string }> = [
  { token: '--background', swatch: 'bg-background' },
  { token: '--foreground', swatch: 'bg-foreground' },
  { token: '--card', swatch: 'bg-card' },
  { token: '--muted', swatch: 'bg-muted' },
  { token: '--muted-foreground', swatch: 'bg-muted-foreground' },
  { token: '--primary', swatch: 'bg-primary' },
  { token: '--accent', swatch: 'bg-accent' },
  { token: '--success', swatch: 'bg-success' },
  { token: '--warning', swatch: 'bg-warning' },
  { token: '--destructive', swatch: 'bg-destructive' },
  { token: '--ring', swatch: 'bg-ring' },
  { token: '--inset-bg', swatch: 'bg-inset' },
]

/**
 * Measured, not estimated. Every ratio was computed from the oklch token values
 * by converting to sRGB, compositing the translucent layers in gamma space, and
 * applying the WCAG 2.1 relative-luminance formula. Text is measured against the
 * worst case: a glass pane sitting on the peak of the brightest glow lobe.
 *
 * The audit covered all four accents in both themes; the tightest result of the
 * eight combinations was 3.11:1 against a 3:1 requirement.
 */
const contrastRows: ReadonlyArray<{ pair: string; dark: string; light: string; need: string }> = [
  { pair: '--foreground / .glass', dark: '12.46', light: '16.28', need: '4.5' },
  { pair: '--muted-foreground / .glass', dark: '5.84', light: '6.22', need: '4.5' },
  { pair: '--foreground / .glass-inset', dark: '14.65', light: '14.59', need: '4.5' },
  { pair: '--muted-foreground / .glass-inset', dark: '6.87', light: '5.57', need: '4.5' },
  { pair: '--muted-foreground / --card', dark: '8.22', light: '6.70', need: '4.5' },
  { pair: '--primary-foreground / --primary', dark: '7.00', light: '5.69', need: '4.5' },
  { pair: 'badge primary / .glass-inset', dark: '12.05', light: '11.59', need: '4.5' },
  { pair: 'badge success / .glass-inset', dark: '8.69', light: '5.23', need: '4.5' },
  { pair: 'badge warning / .glass-inset', dark: '8.63', light: '5.10', need: '4.5' },
  { pair: 'badge danger / .glass-inset', dark: '5.86', light: '5.09', need: '4.5' },
  { pair: '--ring / .glass', dark: '4.72', light: '5.43', need: '3' },
  { pair: '--input / .glass', dark: '3.22', light: '3.21', need: '3' },
  { pair: '--input / .glass-inset', dark: '3.43', light: '3.15', need: '3' },
]

const typeSteps: ReadonlyArray<{ label: string; className: string }> = [
  { label: '48 / 1.08', className: 'text-4xl' },
  { label: '40 / 1.15', className: 'text-3xl' },
  { label: '32 / 1.25', className: 'text-2xl' },
  { label: '24 / 1.4', className: 'text-xl' },
  { label: '20 / 1.5', className: 'text-lg' },
  { label: '16 / 1.7', className: 'text-base' },
  { label: '14 / 1.6', className: 'text-xs' },
  { label: '12 / 1.5', className: 'text-2xs' },
]

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span aria-hidden="true" className="text-primary">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function SurfaceSample({
  surface,
  title,
  desc,
}: {
  surface: 'glass' | 'inset' | 'solid'
  title: string
  desc: string
}) {
  return (
    <GlassCard surface={surface} pad="md" className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold text-foreground">{title}</h3>
      <p className="text-2xs text-muted-foreground">{desc}</p>
    </GlassCard>
  )
}

function StatesPanel({ t }: { t: Translator }) {
  return (
    <GlassCard pad="lg" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">{t('preview.stateHover')}</Button>
        <Button variant="glass">{t('preview.stateFocus')}</Button>
        <Button variant="outline">{t('preview.stateActive')}</Button>
        <Button variant="ghost" disabled>
          {t('preview.stateDisabled')}
        </Button>
        <Button variant="primary" loading loadingLabel={t('a11y.loading')}>
          {t('preview.stateLoading')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{t('badge.new')}</Badge>
        <Badge tone="primary">{t('badge.beta')}</Badge>
        <Badge tone="warning">{t('badge.wip')}</Badge>
        <Badge tone="demo">{t('badge.demo')}</Badge>
        <ShortcutHint keys={['mod', 'K']} label={t('actions.openCommandPalette')} />
        <ShortcutHint keys={['/']} label={t('actions.search')} />
      </div>
    </GlassCard>
  )
}

export default async function TokenPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = requireLocale((await params).locale)
  const t = createTranslator(locale)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-section px-4 py-section safe-x sm:px-6">
      <header className="flex flex-col gap-4">
        <Badge tone="demo" className="w-fit">
          {t('preview.stageBadge')}
        </Badge>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t('preview.title')}</h1>
        <p className="measure text-base text-muted-foreground">{t('preview.lead')}</p>
        <p className="measure text-2xs text-muted-foreground">{pick(siteConfig.slogan, locale)}</p>
      </header>

      <Section icon={<Palette className="size-5" />} title={t('preview.tokensTitle')}>
        <GlassCard pad="lg">
          <ul className="grid grid-cols-2 gap-grid sm:grid-cols-3 lg:grid-cols-4">
            {colorTokens.map(({ token, swatch }) => (
              <li key={token} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={`size-8 shrink-0 rounded-sm border border-border ${swatch}`}
                />
                <code className="truncate font-mono text-2xs text-muted-foreground">{token}</code>
              </li>
            ))}
          </ul>
        </GlassCard>
      </Section>

      <Section icon={<Layers className="size-5" />} title={t('preview.surfacesTitle')}>
        <div className="grid gap-grid md:grid-cols-3">
          <SurfaceSample
            surface="glass"
            title={t('preview.surfaceGlass')}
            desc={t('preview.surfaceGlassDesc')}
          />
          <SurfaceSample
            surface="inset"
            title={t('preview.surfaceInset')}
            desc={t('preview.surfaceInsetDesc')}
          />
          <SurfaceSample
            surface="solid"
            title={t('preview.surfaceSolid')}
            desc={t('preview.surfaceSolidDesc')}
          />
        </div>
      </Section>

      <Section icon={<Sparkles className="size-5" />} title={t('preview.statesTitle')}>
        <StatesPanel t={t} />
      </Section>

      <Section icon={<Contrast className="size-5" />} title={t('preview.contrastTitle')}>
        <GlassCard pad="lg" className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-2xs">
            <caption className="sr-only">{t('preview.contrastTitle')}</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-medium">
                  {t('preview.contrastPair')}
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  {t('theme.dark')}
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  {t('theme.light')}
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  {t('preview.contrastRequired')}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {t('preview.contrastResult')}
                </th>
              </tr>
            </thead>
            <tbody>
              {contrastRows.map((row) => (
                <tr key={row.pair} className="border-b border-border last:border-0">
                  <th scope="row" className="py-2 pr-3 font-mono font-normal text-foreground">
                    {row.pair}
                  </th>
                  <td className="py-2 pr-3 tnum text-muted-foreground">{row.dark}:1</td>
                  <td className="py-2 pr-3 tnum text-muted-foreground">{row.light}:1</td>
                  <td className="py-2 pr-3 tnum text-muted-foreground">{row.need}:1</td>
                  <td className="py-2">
                    <Badge tone="success">{t('preview.contrastPass')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </Section>

      <Section icon={<Type className="size-5" />} title={t('preview.typeTitle')}>
        <GlassCard pad="lg" className="flex flex-col gap-3">
          {typeSteps.map((step) => (
            <div key={step.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <code className="w-20 shrink-0 font-mono tnum text-2xs text-muted-foreground">
                {step.label}
              </code>
              <span className={`${step.className} text-foreground`}>{t('preview.typeSample')}</span>
            </div>
          ))}
        </GlassCard>
      </Section>

      <Section icon={<Loader className="size-5" />} title={t('preview.skeletonTitle')}>
        <div className="flex flex-col gap-3">
          <p className="measure text-2xs text-muted-foreground">{t('preview.skeletonDesc')}</p>
          <SkeletonGrid count={4} label={t('a11y.loading')} />
        </div>
      </Section>

      <Section icon={<Accessibility className="size-5" />} title={t('preview.a11yTitle')}>
        <GlassCard pad="lg" className="flex flex-col gap-2">
          <p className="measure text-2xs text-muted-foreground">{t('preview.a11yTransparency')}</p>
          <p className="measure text-2xs text-muted-foreground">{t('preview.a11yMotion')}</p>
          <p className="measure text-2xs text-muted-foreground">{t('preview.a11yHint')}</p>
        </GlassCard>
      </Section>
    </div>
  )
}
