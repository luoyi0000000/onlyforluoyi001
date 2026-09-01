import { SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

import { AccentToggle } from '@/components/accent-toggle'
import { DensityToggle } from '@/components/density-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/config/site'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types/i18n'

/**
 * Theme, accent and density behind one button in the header.
 *
 * Three switch clusters side by side made the bar into a settings panel that
 * happened to have a logo on it. Folding them behind a single disclosure leaves
 * the header with three things — brand, search, language — and gives the
 * appearance controls room to be labelled properly once they are open.
 *
 * It is a native `<details>`, which means: zero client JavaScript, keyboard and
 * screen-reader behaviour for free, and it still works in a static export with
 * scripting disabled. The panel is opaque `bg-popover`, not glass, so it adds no
 * third blurred layer on top of the header and the page behind it.
 *
 * Server component: the toggles inside are the only client code, and their
 * labels are resolved here because `t()` cannot cross the boundary.
 */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

export function AppearanceMenu({ locale }: { locale: Locale }) {
  const t = createTranslator(locale)
  const { enableDensityToggle, enableAccentPicker } = siteConfig.features

  return (
    <details data-menu="" className="group relative">
      <summary
        aria-label={t('appearance.title')}
        title={t('appearance.title')}
        className={cn(
          'inline-flex size-9 cursor-pointer items-center justify-center rounded-md',
          'list-none border border-input glass-inset text-muted-foreground',
          'transition-[background-color,color,border-color] duration-200 ease-glide',
          'hover:border-foreground/30 hover:text-foreground',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'group-open:border-ring group-open:text-foreground',
          'coarse:size-11',
          // Firefox honours `list-style: none`; the WebKit/Blink marker is a
          // pseudo-element and needs its own rule.
          '[&::-webkit-details-marker]:hidden',
        )}
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        <span className="sr-only">{t('appearance.title')}</span>
      </summary>

      <div
        data-menu-panel=""
        className={cn(
          'absolute top-full right-0 z-50 mt-2 flex flex-col gap-3',
          'w-[min(17rem,calc(100vw-2rem))] rounded-lg border border-border',
          'bg-popover p-3 text-popover-foreground shadow-e3',
        )}
      >
        <Field label={t('theme.label')}>
          <ThemeToggle
            labels={{
              group: t('theme.label'),
              light: t('theme.light'),
              dark: t('theme.dark'),
              system: t('theme.system'),
            }}
          />
        </Field>

        {enableAccentPicker ? (
          <Field label={t('accent.label')}>
            <AccentToggle
              labels={{
                group: t('accent.label'),
                accents: {
                  indigo: t('accent.indigo'),
                  violet: t('accent.violet'),
                  cyan: t('accent.cyan'),
                  emerald: t('accent.emerald'),
                },
              }}
            />
          </Field>
        ) : null}

        {enableDensityToggle ? (
          <Field label={t('density.label')}>
            <DensityToggle
              labels={{
                group: t('density.label'),
                comfortable: t('density.comfortable'),
                compact: t('density.compact'),
              }}
            />
          </Field>
        ) : null}
      </div>
    </details>
  )
}
