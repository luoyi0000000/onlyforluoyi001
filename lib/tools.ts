import { categories, tools } from '@/config/tools'
import { localePath } from '@/lib/utils'
import type { Locale } from '@/types/i18n'
import type { CategoryGroup, ToolCategory, ToolItem } from '@/types/tool'

/**
 * Derived read models over `config/tools.ts`. Everything here is computed once
 * at module load from static data, so it is free at runtime and identical on
 * the server and in the browser.
 *
 * Validation deliberately lives in `lib/validate-config.ts` instead of here:
 * this module is imported by client components (search, the palette), and the
 * validator's error strings have no business in the browser bundle.
 */

export function isEnabled(tool: ToolItem): boolean {
  return tool.enabled !== false
}

/** Every tool that should be visible, in config order. */
export const enabledTools: readonly ToolItem[] = tools.filter(isEnabled)

/** Categories sorted by `order`, ties broken by id so the result is stable. */
export const orderedCategories: readonly ToolCategory[] = [...categories].sort(
  (a, b) => a.order - b.order || a.id.localeCompare(b.id),
)

const byId = new Map(enabledTools.map((tool) => [tool.id, tool]))

export function getTool(id: string): ToolItem | undefined {
  return byId.get(id)
}

export function getCategory(id: string): ToolCategory | undefined {
  return orderedCategories.find((category) => category.id === id)
}

/** Categories that actually have tools, each with its tools attached. */
export function groupByCategory(list: readonly ToolItem[] = enabledTools): CategoryGroup[] {
  return orderedCategories
    .map((category) => ({
      category,
      tools: list.filter((tool) => tool.categoryId === category.id),
    }))
    .filter((group) => group.tools.length > 0)
}

/** How many enabled tools each category holds — used by catalogue filter chips. */
export function categoryCounts(list: readonly ToolItem[] = enabledTools): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const category of orderedCategories) counts[category.id] = 0
  for (const tool of list) {
    counts[tool.categoryId] = (counts[tool.categoryId] ?? 0) + 1
  }
  return counts
}

export const pinnedTools: readonly ToolItem[] = enabledTools.filter((tool) => tool.pinned === true)

/** Every distinct tag, alphabetised. Available to custom filter surfaces. */
export const allTags: readonly string[] = [
  ...new Set(enabledTools.flatMap((tool) => tool.tags ?? [])),
].sort((a, b) => a.localeCompare(b))

/**
 * Ids that need a prerendered page under `/[locale]/t/[id]/`.
 *
 * A tool with its own `route` is excluded — it brings its own page. Everything
 * else gets one, including `kind: 'link'` entries: `/t/<id>/` is then a stable
 * in-site permalink for every registered tool, the page says plainly that the
 * target lives elsewhere, and a link entry that later grows a real
 * implementation flips `kind` without its URL changing. Cards still jump
 * straight to the external target, so this costs a click nowhere.
 */
export function shellToolIds(): string[] {
  return enabledTools.filter((tool) => !tool.route).map((tool) => tool.id)
}

export interface ToolTarget {
  href: string
  external: boolean
}

/**
 * Where a card should navigate. External links get `external: true` so the
 * caller can add the new-tab attributes and the visual marker in one place.
 */
export function toolTarget(tool: ToolItem, locale: Locale): ToolTarget {
  if (tool.kind === 'link') {
    // `validateToolTarget` guarantees the href exists and uses a safe scheme.
    return { href: tool.href ?? '#', external: true }
  }
  return { href: localePath(locale, tool.route ?? `t/${tool.id}`), external: false }
}

/** True when any seed entry is still registered — drives the site-wide DEMO notice. */
export const hasDemoTools: boolean = enabledTools.some((tool) => tool.demo === true)

export const toolCount: number = enabledTools.length
