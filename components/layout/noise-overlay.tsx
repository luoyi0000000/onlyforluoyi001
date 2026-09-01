/**
 * Film grain that kills gradient banding. The texture is an inline
 * feTurbulence SVG data URI declared in `globals.css`, so it adds no network
 * request and no image decode of a large PNG.
 */
export function NoiseOverlay() {
  return <div className="noise-layer" aria-hidden="true" />
}
