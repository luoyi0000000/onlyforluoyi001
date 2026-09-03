import { filterTools, searchTools } from './search.ts'
import type { ToolItem } from '../types/tool.ts'

export interface HomeToolFilters {
  query: string
  categoryId: string | null
}

/**
 * The home catalogue's one read model: exact category selection narrows the
 * candidates first, then the existing bilingual fuzzy search ranks them.
 */
export function selectHomeTools(
  tools: readonly ToolItem[],
  { query, categoryId }: HomeToolFilters,
): ToolItem[] {
  return searchTools(filterTools(tools, { categoryId }), query)
}
