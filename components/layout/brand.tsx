import { LayoutGrid } from 'lucide-react'
import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { pick } from '@/lib/i18n'
import { cn, localePath } from '@/lib/utils'
import type { Locale } from '@/types/i18n'

/**
 * Home link plus the logo slot. Dropping in a real logo is a one-line change in
 * `config/site.ts` (`brand.logoSrc`); until then a generated gradient tile with
 * the grid glyph stands in, so nothing looks unfinished.
 */
export function Brand({ locale, className }: { locale: Locale; className?: string }) {
  const name = pick(siteConfig.name, locale)
  const { logoSrc, logoAlt } = siteConfig.brand

  return (
    <Link
      href={localePath(locale)}
      className={cn(
        'group flex items-center gap-2.5 rounded-md',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
    >
      {logoSrc === null ? (
        <span
          aria-hidden="true"
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-sm',
            // `brand-gradient`, not `from-primary to-accent`: `--accent` is a
            // near-white tint in light mode and a near-black one in dark, so the
            // glyph on top used to disappear into one end of the gradient in
            // each theme. The token pair behind this utility follows the accent
            // preset but is identical in both themes, and is lightness-capped so
            // the white glyph keeps 3:1 against every stop.
            'brand-gradient shadow-e1',
            'transition-transform duration-200 ease-glide group-hover:scale-105',
          )}
        >
          <LayoutGrid className="size-4" />
        </span>
      ) : (
        // A static export serves `public/` verbatim and `images.unoptimized` is
        // on, so next/image would only add client JS for no benefit here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt={pick(logoAlt, locale)}
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-sm"
        />
      )}
      <span className="text-xs font-semibold tracking-tight text-foreground">{name}</span>
    </Link>
  )
}
