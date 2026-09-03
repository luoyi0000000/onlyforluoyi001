import type { EmptySlotPresentation } from '../config/site.ts'

/** Empty slots are optional editing aids; real owner content is never hidden. */
export function shouldRenderHomeSlot(
  hasContent: boolean,
  emptyPresentation: EmptySlotPresentation,
): boolean {
  return hasContent || emptyPresentation !== 'hidden'
}
