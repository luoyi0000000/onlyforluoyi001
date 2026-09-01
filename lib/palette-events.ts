/**
 * A one-event bus between the header and the command palette.
 *
 * The alternative was a context provider wrapping the whole tree, which would
 * turn the layout into a client component and pull every page into the client
 * bundle for the sake of one button. A `CustomEvent` on `window` keeps the header
 * a server component with one small island, and keeps the palette lazily loaded
 * until something actually asks for it.
 */
export const PALETTE_OPEN_EVENT = 'toolbox:palette-open'
export const HELP_OPEN_EVENT = 'toolbox:help-open'

export function openPalette(): void {
  window.dispatchEvent(new CustomEvent(PALETTE_OPEN_EVENT))
}

export function openHelp(): void {
  window.dispatchEvent(new CustomEvent(HELP_OPEN_EVENT))
}

/** Returns the unsubscribe function, so it can be returned straight from an effect. */
export function onWindowEvent(name: string, handler: () => void): () => void {
  window.addEventListener(name, handler)
  return () => window.removeEventListener(name, handler)
}
