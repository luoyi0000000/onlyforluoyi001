import type { Locale } from '@/types/i18n'
import { locales } from '@/types/i18n'
import type { ToolItem } from '@/types/tool'

/**
 * Ranked fuzzy search over the tool registry. Zero dependencies: the corpus is
 * a few dozen short strings, so a scoring loop beats shipping a search library
 * by an order of magnitude in bundle size.
 *
 * Every tool is indexed in *both* languages plus its tags and optional pinyin
 * initials, so "json" and "格式化" and "jsongshh" all find the same card no
 * matter which language the interface is in.
 *
 * Multi-word queries are AND: every whitespace-separated term has to land
 * somewhere, which is what makes "json 格式" narrower than "json" rather than
 * wider.
 */

/** Field weights. Names dominate; descriptions only break ties. */
const WEIGHTS = {
  name: 3,
  pinyin: 2.5,
  tag: 2,
  desc: 1,
} as const

interface IndexedField {
  text: string
  weight: number
}

export interface SearchEntry {
  tool: ToolItem
  fields: IndexedField[]
}

function normalize(value: string): string {
  return value.toLocaleLowerCase().trim()
}

export function buildSearchIndex(tools: readonly ToolItem[]): SearchEntry[] {
  return tools.map((tool) => {
    const fields: IndexedField[] = []

    for (const locale of locales) {
      fields.push({ text: normalize(tool.name[locale]), weight: WEIGHTS.name })
      fields.push({ text: normalize(tool.desc[locale]), weight: WEIGHTS.desc })
    }
    for (const tag of tool.tags ?? []) {
      fields.push({ text: normalize(tag), weight: WEIGHTS.tag })
    }
    if (tool.pinyin) {
      fields.push({ text: normalize(tool.pinyin), weight: WEIGHTS.pinyin })
    }

    return { tool, fields }
  })
}

/**
 * Subsequence score in [0, 1). Rewards matches that start early and stay
 * contiguous, so "jf" ranks "JSON Formatter" above "Justify Footer".
 */
function subsequenceScore(term: string, text: string): number {
  let cursor = 0
  let run = 0
  let bestRun = 0
  let firstHit = -1

  for (const char of term) {
    const found = text.indexOf(char, cursor)
    if (found === -1) return 0
    if (firstHit === -1) firstHit = found
    run = found === cursor ? run + 1 : 1
    bestRun = Math.max(bestRun, run)
    cursor = found + 1
  }

  const contiguity = bestRun / term.length
  const earliness = 1 / (1 + firstHit)
  return 0.35 + 0.4 * contiguity + 0.25 * earliness
}

/** Best score for one term against one field, 0 when it does not match. */
function scoreTerm(term: string, field: IndexedField): number {
  if (term === '') return 0
  const { text, weight } = field
  if (text === '') return 0

  if (text === term) return 4 * weight
  if (text.startsWith(term)) return 3 * weight

  const at = text.indexOf(term)
  if (at !== -1) {
    // A match on a word boundary reads as intentional; mid-word is weaker.
    const boundary = at === 0 || /[\s\-_/]/.test(text.charAt(at - 1))
    return (boundary ? 2.2 : 1.6) * weight
  }

  const fuzzy = subsequenceScore(term, text)
  return fuzzy === 0 ? 0 : fuzzy * weight
}

export interface SearchResult {
  tool: ToolItem
  score: number
}

/**
 * Ranked results. An empty or whitespace-only query returns everything in
 * registry order, which is what the unfiltered grid wants.
 */
export function searchIndex(index: readonly SearchEntry[], rawQuery: string): SearchResult[] {
  const query = normalize(rawQuery)
  if (query === '') return index.map((entry) => ({ tool: entry.tool, score: 0 }))

  const terms = query.split(/\s+/).filter((term) => term !== '')
  const results: SearchResult[] = []

  for (const entry of index) {
    let total = 0
    let allTermsMatched = true

    for (const term of terms) {
      let best = 0
      for (const field of entry.fields) {
        const score = scoreTerm(term, field)
        if (score > best) best = score
      }
      if (best === 0) {
        allTermsMatched = false
        break
      }
      total += best
    }

    if (allTermsMatched) results.push({ tool: entry.tool, score: total })
  }

  // Stable within a score band: registry order is meaningful, so ties keep it.
  return results.sort((a, b) => b.score - a.score)
}

/** Convenience wrapper for one-off searches over a small list. */
export function searchTools(tools: readonly ToolItem[], query: string): ToolItem[] {
  return searchIndex(buildSearchIndex(tools), query).map((result) => result.tool)
}

/**
 * Filters that are not fuzzy: an explicit category and an explicit tag set are
 * exact predicates, applied before scoring so the ranking only ever sees
 * candidates the visitor actually asked for.
 */
export interface FilterOptions {
  categoryId?: string | null
  /** A tool must carry every selected tag. */
  tags?: readonly string[]
}

export function filterTools(
  tools: readonly ToolItem[],
  { categoryId, tags }: FilterOptions,
): ToolItem[] {
  return tools.filter((tool) => {
    if (categoryId && tool.categoryId !== categoryId) return false
    if (tags && tags.length > 0) {
      const own = tool.tags ?? []
      if (!tags.every((tag) => own.includes(tag))) return false
    }
    return true
  })
}

/** Localised name, for callers that only have the tool and the locale. */
export function toolName(tool: ToolItem, locale: Locale): string {
  return tool.name[locale]
}
