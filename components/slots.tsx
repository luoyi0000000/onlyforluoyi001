import type { ReactNode } from 'react'

import type { Locale } from '@/types/i18n'

/**
 * Optional JSX extension points.
 *
 * Each of these returns `null`, so an untouched install renders no extra DOM at
 * all — no empty wrapper, no stray gap in a flex column. To use one, replace the
 * body with your own markup; the call sites in `app/[locale]/page.tsx` and the
 * layout already pass the current locale.
 *
 * They exist as components rather than config fields because JSX is not
 * serializable: a React element cannot live in `config/site.ts` and still cross
 * the server/client boundary intact.
 */
export interface SlotProps {
  locale: Locale
}

/** Rendered inside the hero panel, between the copy and the call-to-action row. */
export function HeroSlot(_props: SlotProps): ReactNode {
  return null
}

/**
 * Fills the first optional band under the hero. Empty bands are hidden by
 * default; use `siteConfig.home.emptySlots.top` to expose an authoring frame.
 */
export function HomeTopSlot(_props: SlotProps): ReactNode {
  return null
}

/**
 * Fills the second optional band, between `HomeTopSlot` and the tool panel.
 * Its empty presentation is controlled independently by `emptySlots.middle`.
 */
export function HomeMidSlot(_props: SlotProps): ReactNode {
  return null
}

/** Rendered at the bottom of the home page, below the tool panel. */
export function HomeSlot(_props: SlotProps): ReactNode {
  return null
}

/** Rendered in the footer, above the privacy statement. */
export function FooterSlot(_props: SlotProps): ReactNode {
  return null
}
