import type { Localized } from './i18n'

export type { Localized }

/** Accent ramps available to a tool's icon tile. */
export const accentNames = ['indigo', 'violet', 'cyan', 'emerald', 'amber', 'rose'] as const
export type AccentName = (typeof accentNames)[number]

/** Site-wide accent presets. A subset of `accentNames`: these four have full
 *  light/dark token ramps in `globals.css`. */
export const themeAccents = ['indigo', 'violet', 'cyan', 'emerald'] as const
export type ThemeAccent = (typeof themeAccents)[number]

export const badgeKinds = ['new', 'beta', 'wip'] as const
export type BadgeKind = (typeof badgeKinds)[number]

/** `link` opens an external URL; `internal` routes to a page inside the site. */
export type ToolKind = 'link' | 'internal'

export interface ToolCategory {
  id: string
  name: Localized
  /** lucide icon name, resolved through `lib/icons.ts` with a safe fallback. */
  icon: string
  order: number
}

export interface ToolItem {
  id: string
  name: Localized
  /** One or two lines. Anything past that is clipped by `line-clamp-2`. */
  desc: Localized
  categoryId: string
  /** lucide icon name, resolved through `lib/icons.ts` with a safe fallback. */
  icon: string
  kind: ToolKind
  /** Required when `kind === 'link'`. */
  href?: string
  /** Required when `kind === 'internal'`. Path relative to the locale root. */
  route?: string
  tags?: string[]
  accent?: AccentName
  badge?: BadgeKind
  pinned?: boolean
  /** Defaults to true. `false` removes the tool from every surface. */
  enabled?: boolean
  /**
   * Optional pinyin initials for Chinese names, so the command palette can
   * match "jsgshh" against "JSON 格式化". Purely additive and zero-dependency:
   * leave it out and search still works on both languages, tags and
   * descriptions. Lowercase, no spaces.
   */
  pinyin?: string
  /** Marks demo seed data so it is impossible to mistake for a real tool. */
  demo?: boolean
}

/** A category plus the enabled tools that belong to it, ready to render. */
export interface CategoryGroup {
  category: ToolCategory
  tools: ToolItem[]
}
