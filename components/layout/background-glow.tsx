/**
 * Fixed decorative gradient field. Three large radial lobes, pure CSS, no
 * raster asset anywhere. `fixed` keeps it from jittering while the page
 * scrolls, and it is hidden from assistive tech entirely.
 *
 * All geometry, blur radii and alpha caps live in `globals.css` next to the
 * tokens they depend on, so this component stays a stable three-div shell.
 */
export function BackgroundGlow() {
  return (
    <div className="glow-layer" aria-hidden="true">
      <div className="glow-lobe glow-lobe--a" />
      <div className="glow-lobe glow-lobe--b" />
      <div className="glow-lobe glow-lobe--c" />
    </div>
  )
}
