# Toolbox Frontend Refresh Design

## Goal

Turn the existing static toolbox shell into a clearer, more efficient launcher while preserving its privacy, static-export, bilingual, theme, keyboard, and configuration-first contracts.

## Product direction

- **Purpose:** help a visitor find and open a personal tool with minimal scanning or typing.
- **Tone:** calm, precise, and capable.
- **Differentiation:** a local-only, keyboard-friendly launcher whose appearance and content can be changed from a small set of explicit configuration and slot files.

The current visual system remains the anchor: neutral light/dark surfaces, one active accent ramp, restrained glass, self-hosted typography, and short motion. The refresh reduces background movement and decorative card effects so the tools become the strongest visual objects.

## Information architecture

The home page keeps the existing order: header, hero, custom content, tool catalogue, footer. Empty custom slots no longer consume two full panels by default. Filled slots always render; owners can optionally expose compact or full empty placeholders while editing.

The tool catalogue gains an inline discovery bar containing a real search field, a result count, and category controls. Search uses the existing bilingual/tag/pinyin index. Category filtering is exact and composes with search. A clear action restores the complete catalogue.

## Customization contract

`config/site.ts` remains the owner-facing control surface. Its home settings control inline search, category navigation, and the empty presentation of the top and middle slots. `config/tools.ts` remains the only registry for categories and tools. `components/slots.tsx` remains the JSX escape hatch for hero, top, middle, bottom, and footer content.

No new runtime dependency or third-party request is introduced. Owner documentation will explain the configuration paths and provide copy-paste examples.

## Interaction and accessibility

The inline search is a labelled native search input. Category controls expose pressed state and remain horizontally scrollable on narrow screens. Result changes are announced through an existing localized live-region message. Empty results use the existing empty-state component.

Tool cards keep the existing link-plus-favorite separation and arrow-key navigation. The visual refresh removes the sweeping sheen and masked border shimmer while keeping visible hover, active, and focus states. Touch targets remain at least 44px for coarse pointers, and reduced-motion/transparency behavior stays intact.

## Visual treatment

The hero becomes a compact asymmetric composition on wide screens, using the existing copy and actions without adding filler. The catalogue begins closer to the first viewport. Cards use a tighter horizontal identity row, quieter elevation, clearer status placement, and fewer simultaneous effects. Background glow opacity, drift distance, and noise are reduced rather than removed, retaining the product's identity.

## Technical constraints

- Next.js static export remains enabled.
- Node >= 20.9 and pnpm 11.24.0 remain supported; tests continue to require Node >= 22.18.
- No Server Actions, route handlers, middleware, remote font, analytics, or CDN assets.
- Chinese and English dictionary shapes remain compile-time identical.
- Existing theme, locale, density, favorites, recents, command palette, and generated tool routes remain compatible.

## Verification

Run the focused Node tests first, then `pnpm run check`, `pnpm run build`, and `pnpm run audit:external`. Inspect the generated home page at narrow, tablet, and desktop widths when browser control is available. Confirm empty slots are absent by default, search/category combinations return the expected tools, keyboard focus remains visible, and the static export contains no external asset requests.
