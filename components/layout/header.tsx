import { AppearanceMenu } from '@/components/layout/appearance-menu'
import { Brand } from '@/components/layout/brand'
import { LocaleToggle } from '@/components/locale-toggle'
import { SearchTrigger } from '@/components/search-trigger'
import { siteConfig } from '@/config/site'
import { createTranslator } from '@/lib/i18n'
import { localePath } from '@/lib/utils'
import { localeMeta, type Locale } from '@/types/i18n'

/**
 * Sticky glass bar. It is a server component: only the individual switches are
 * client components, so the header itself costs no client JS.
 *
 * The bar floats rather than spanning the viewport: the sticky element itself is
 * transparent and only carries the top inset, and the glass is a rounded slab
 * inside it, aligned to the same `max-w-6xl` column as the panels below. That is
 * the whole point of the treatment — content is visible sliding past above it
 * and along both sides, so the surface reads as a pane of glass over the page
 * instead of a painted strip attached to the top of the window. `.liquid-bar`
 * holds the material (see `globals.css`) and `.bar-tint` is the fill that fades
 * in as the page scrolls under it.
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

  return (
    <header id="top" className="sticky top-0 z-40 pt-2 safe-x sm:pt-3">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="liquid-bar flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl glass px-3 py-2 sm:px-4 sm:py-2.5">
          {/* The scroll-reactive fill. Decorative, and behind everything: it is
              the one part of the material that needs to be an element rather
              than a pseudo-element, because both of those are already spent on
              the sheen and the rim. */}
          <div aria-hidden="true" className="bar-tint" />

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
