import { Compass, House } from 'lucide-react'
import Link from 'next/link'

import { GlassCard } from '@/components/ui/glass-card'
import { buttonVariants } from '@/components/ui/button'
import { getDictionary } from '@/lib/i18n'
import { cn, localePath } from '@/lib/utils'
import { localeMeta, locales } from '@/types/i18n'

/**
 * Rendered for `notFound()` calls inside a locale route. Next does not pass
 * route params to `not-found.tsx`, so this page cannot know which language the
 * visitor was reading — it shows both rather than guessing wrong.
 *
 * This is *not* the file Cloudflare serves for unknown paths. A static export
 * only emits `out/404.html` from a root-level `app/not-found.tsx`, which cannot
 * exist here because the root layout lives inside `app/[locale]/`. The file
 * Workers serves is the hand-written, self-contained `public/404.html`.
 */
export default function LocaleNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-grid px-4 py-section safe-x text-center sm:px-6">
      <span
        aria-hidden="true"
        className="bg-gradient-to-br from-primary to-accent bg-clip-text tnum text-6xl font-semibold text-transparent"
      >
        404
      </span>

      {locales.map((locale) => {
        const dict = getDictionary(locale)
        return (
          <GlassCard
            key={locale}
            pad="lg"
            lang={localeMeta[locale].htmlLang}
            className="flex w-full flex-col items-center gap-3"
          >
            <h1 className="text-xl font-semibold text-foreground">{dict.notFound.title}</h1>
            <p className="measure text-xs text-muted-foreground">{dict.notFound.desc}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href={localePath(locale)}
                className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}
              >
                <House aria-hidden="true" className="size-4" />
                {dict.actions.backHome}
              </Link>
              <Link
                href={localePath(locale, 'about')}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <Compass aria-hidden="true" className="size-4" />
                {dict.nav.about}
              </Link>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
