import { ArrowUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { GlassCard } from '@/components/ui/glass-card'
import { siteConfig } from '@/config/site'
import { createTranslator, pick } from '@/lib/i18n'
import { cn, isExternalHref, localePath } from '@/lib/utils'
import type { Locale } from '@/types/i18n'

const linkClass = cn(
  'inline-flex items-center gap-1.5 rounded-sm px-1 py-0.5 text-2xs',
  'text-muted-foreground underline decoration-border underline-offset-4',
  'transition-colors duration-200 ease-glide hover:text-foreground hover:decoration-current',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
)

/**
 * `slot` is an optional extension point. Pass nothing and no extra DOM is
 * emitted at all.
 */
export function Footer({ locale, slot }: { locale: Locale; slot?: ReactNode }) {
  const t = createTranslator(locale)

  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pt-section safe-x pb-8 safe-b sm:px-6">
      <GlassCard pad="lg" className="flex flex-col gap-5">
        {slot}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
          <nav
            aria-label={t('a11y.footerLandmark')}
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            {siteConfig.footer.links.map((link) => {
              const label = pick(link.label, locale)
              const external = link.external === true || isExternalHref(link.href)
              if (external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {label}
                    <ExternalLink aria-hidden="true" className="size-3" />
                    <span className="sr-only">{t('a11y.externalLink')}</span>
                  </a>
                )
              }
              return (
                <Link key={link.href} href={localePath(locale, link.href)} className={linkClass}>
                  {label}
                </Link>
              )
            })}
          </nav>

          <a href="#top" className={cn(linkClass, 'ml-auto')}>
            <ArrowUp aria-hidden="true" className="size-3" />
            {t('footer.backToTop')}
          </a>
        </div>
      </GlassCard>
    </footer>
  )
}
