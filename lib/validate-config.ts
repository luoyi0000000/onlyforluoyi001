import { categories, tools } from '@/config/tools'
import { isIconName } from '@/lib/icons'
import { accentNames, badgeKinds, type ToolCategory, type ToolItem } from '@/types/tool'
import { locales } from '@/types/i18n'

/**
 * Build-time guard rails for `config/tools.ts`.
 *
 * This module is imported by a server component only, so none of it reaches the
 * browser bundle. A static export prerenders every page during `next build`,
 * which means an error thrown here fails the build — a broken registry can
 * never be deployed.
 *
 * Errors are things that would produce a dead link, a duplicate route or an
 * injection vector. Warnings are things that still render but probably are not
 * what the author meant.
 */

export interface ConfigReport {
  errors: string[]
  warnings: string[]
}

/** Ids become URL path segments and localStorage keys, so keep them boring. */
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/
/** Relative in-site paths only: no scheme, no leading slash, no traversal. */
const ROUTE_PATTERN = /^[a-z0-9][a-z0-9\-/]*$/
const PINYIN_PATTERN = /^[a-z]+$/

/**
 * A config-supplied href ends up in `<a href>`. Allowing an arbitrary string
 * there would let `javascript:` or `data:text/html` into the DOM, which is a
 * script-execution vector even in a purely static site. Only real navigation
 * schemes pass.
 */
const ALLOWED_LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:'])

function describeList(values: readonly string[]): string {
  return values.join(' | ')
}

function checkLocalized(
  value: { zh: string; en: string } | undefined,
  where: string,
  field: string,
  errors: string[],
): void {
  if (!value) {
    errors.push(`${where}: "${field}" is missing.`)
    return
  }
  for (const locale of locales) {
    const text = value[locale]
    if (typeof text !== 'string' || text.trim() === '') {
      errors.push(`${where}: "${field}.${locale}" must be a non-empty string.`)
    }
  }
}

function validateCategories(list: readonly ToolCategory[], report: ConfigReport): Set<string> {
  const seen = new Set<string>()

  if (list.length === 0) {
    report.errors.push(
      'config/tools.ts: "categories" is empty — the grid would have nowhere to go.',
    )
  }

  for (const [index, category] of list.entries()) {
    const where = `config/tools.ts categories[${index}] (id: ${String(category.id)})`

    if (typeof category.id !== 'string' || !ID_PATTERN.test(category.id)) {
      report.errors.push(
        `${where}: id must match ${String(ID_PATTERN)} — lowercase letters, digits and hyphens.`,
      )
    } else if (seen.has(category.id)) {
      report.errors.push(`${where}: duplicate category id "${category.id}".`)
    } else {
      seen.add(category.id)
    }

    checkLocalized(category.name, where, 'name', report.errors)

    if (!Number.isFinite(category.order)) {
      report.errors.push(`${where}: "order" must be a number.`)
    }

    if (!isIconName(category.icon)) {
      report.warnings.push(
        `${where}: icon "${String(category.icon)}" is not registered in lib/icons.ts — falling back to Wrench.`,
      )
    }
  }

  return seen
}

function validateTools(
  list: readonly ToolItem[],
  categoryIds: ReadonlySet<string>,
  report: ConfigReport,
): void {
  const seen = new Set<string>()
  const used = new Set<string>()

  for (const [index, tool] of list.entries()) {
    const where = `config/tools.ts tools[${index}] (id: ${String(tool.id)})`

    if (typeof tool.id !== 'string' || !ID_PATTERN.test(tool.id)) {
      report.errors.push(
        `${where}: id must match ${String(ID_PATTERN)} — it becomes a URL segment.`,
      )
    } else if (seen.has(tool.id)) {
      report.errors.push(
        `${where}: duplicate tool id "${tool.id}". Ids are route segments, so two tools cannot share one.`,
      )
    } else {
      seen.add(tool.id)
    }

    checkLocalized(tool.name, where, 'name', report.errors)
    checkLocalized(tool.desc, where, 'desc', report.errors)

    if (!categoryIds.has(tool.categoryId)) {
      report.errors.push(
        `${where}: categoryId "${String(tool.categoryId)}" does not exist. Known ids: ${describeList([...categoryIds])}.`,
      )
    } else {
      used.add(tool.categoryId)
    }

    if (!isIconName(tool.icon)) {
      report.warnings.push(
        `${where}: icon "${String(tool.icon)}" is not registered in lib/icons.ts — falling back to Wrench.`,
      )
    }

    validateToolTarget(tool, where, report)

    if (tool.accent !== undefined && !accentNames.includes(tool.accent)) {
      report.errors.push(
        `${where}: accent "${String(tool.accent)}" is unknown. Expected: ${describeList(accentNames)}.`,
      )
    }

    if (tool.badge !== undefined && !badgeKinds.includes(tool.badge)) {
      report.errors.push(
        `${where}: badge "${String(tool.badge)}" is unknown. Expected: ${describeList(badgeKinds)}.`,
      )
    }

    if (tool.tags?.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
      report.errors.push(`${where}: "tags" contains an empty value.`)
    }

    if (tool.pinyin !== undefined && !PINYIN_PATTERN.test(tool.pinyin)) {
      report.warnings.push(
        `${where}: "pinyin" should be lowercase letters only (e.g. "jsongshh"); it will still be indexed as-is.`,
      )
    }

    for (const locale of locales) {
      const text = tool.desc?.[locale]
      if (typeof text === 'string' && text.length > 48) {
        report.warnings.push(
          `${where}: desc.${locale} is ${String(text.length)} characters. The card clamps to one line, so it will be cut.`,
        )
      }
    }
  }

  for (const id of categoryIds) {
    if (!used.has(id)) {
      report.warnings.push(
        `config/tools.ts: category "${id}" has no tools. It is hidden from category navigation and the grid.`,
      )
    }
  }
}

/** The kind / href / route contract, including scheme safety for external links. */
function validateToolTarget(tool: ToolItem, where: string, report: ConfigReport): void {
  if (tool.kind === 'link') {
    if (tool.route !== undefined) {
      report.errors.push(`${where}: kind "link" must not set "route" — use "href".`)
    }
    if (typeof tool.href !== 'string' || tool.href.trim() === '') {
      report.errors.push(`${where}: kind "link" requires a non-empty "href".`)
      return
    }

    let parsed: URL
    try {
      parsed = new URL(tool.href)
    } catch {
      report.errors.push(
        `${where}: href "${tool.href}" is not an absolute URL. External links need a full scheme and host.`,
      )
      return
    }
    if (!ALLOWED_LINK_SCHEMES.has(parsed.protocol)) {
      report.errors.push(
        `${where}: href scheme "${parsed.protocol}" is not allowed. Expected ${describeList([...ALLOWED_LINK_SCHEMES])}.`,
      )
    }
    return
  }

  if (tool.kind === 'internal') {
    if (tool.href !== undefined) {
      report.errors.push(
        `${where}: kind "internal" must not set "href". Omit "route" to use the generated tool shell.`,
      )
    }
    if (tool.route === undefined) return

    if (typeof tool.route !== 'string' || !ROUTE_PATTERN.test(tool.route)) {
      report.errors.push(
        `${where}: route "${String(tool.route)}" must be a relative in-site path such as "t/my-tool" — no scheme, no leading slash.`,
      )
    } else if (tool.route.includes('..')) {
      report.errors.push(`${where}: route "${tool.route}" must not contain "..".`)
    }
    return
  }

  report.errors.push(
    `${where}: kind "${String(tool.kind)}" is unknown. Expected "internal" | "link".`,
  )
}

/** Pure form, useful in tests and in the config-health panel. */
export function inspectToolConfig(): ConfigReport {
  const report: ConfigReport = { errors: [], warnings: [] }
  const categoryIds = validateCategories(categories, report)
  validateTools(tools, categoryIds, report)
  return report
}

/**
 * Call this from a server component. Errors abort the build with every problem
 * listed at once, rather than one crash per rebuild.
 */
export function assertValidToolConfig(): ConfigReport {
  const report = inspectToolConfig()

  if (report.errors.length > 0) {
    throw new Error(
      [
        `Invalid tool configuration — ${String(report.errors.length)} problem(s) found in config/tools.ts:`,
        ...report.errors.map((line) => `  • ${line}`),
      ].join('\n'),
    )
  }

  return report
}
