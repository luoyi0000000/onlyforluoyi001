# Toolbox Frontend Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the toolbox home page clearer, faster to scan, and easier to customize without changing its static, private, bilingual architecture.

**Architecture:** Keep the existing config-driven Next.js structure. Add one tested pure home-filter read model, one focused client discovery component, and small presentation changes to existing hero, shell, card, and token files.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, Tailwind CSS 4, node:test, pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-03-toolbox-frontend-refresh-design.md`

## Global Constraints

- Preserve `output: 'export'` and all static route generation.
- Add no runtime dependency and no external request.
- Keep Chinese and English dictionaries structurally identical.
- Keep all existing user preferences and localStorage keys compatible.
- Filled JSX slots render regardless of their empty-placeholder setting.
- Use tests for new filtering behavior before production implementation.

---

### Task 1: Tested home catalogue filtering

**Files:**

- Create: `tests/home-catalogue.test.ts`
- Create: `lib/home-catalogue.ts`

**Interfaces:**

- Consumes: `searchTools(tools, query)` and `filterTools(tools, options)` from `lib/search.ts`.
- Produces: `selectHomeTools(tools, { query, categoryId }): ToolItem[]`.

- [ ] Write tests proving whitespace returns all tools, bilingual/pinyin search works, category filtering works, and category plus query compose.
- [ ] Run `pnpm test tests/home-catalogue.test.ts` and confirm failure because the module does not exist.
- [ ] Implement `selectHomeTools` by exact filtering first and ranked search second.
- [ ] Re-run the focused test and all Node tests.

### Task 2: Configurable custom-slot visibility

**Files:**

- Modify: `config/site.ts`
- Modify: `components/home-shell.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**

- Consumes: `siteConfig.home.emptySlots.top` and `siteConfig.home.emptySlots.middle`.
- Produces: `EmptySlotPresentation = 'hidden' | 'compact' | 'full'` and optional rendered slot panels.

- [ ] Add typed home configuration with inline-search/category-navigation flags and empty-slot presentation values.
- [ ] Pass settings from the server page into `HomeShell`.
- [ ] Render filled slots unconditionally; hide empty slots by default; retain compact and full editing placeholders.
- [ ] Run typecheck after the interface change.

### Task 3: Inline discovery bar

**Files:**

- Create: `components/home-discovery.tsx`
- Modify: `components/home-shell.tsx`

**Interfaces:**

- Consumes: current query/category, localized labels, and ordered categories.
- Produces: query/category change callbacks and a clear action.

- [ ] Reuse the matching bilingual labels already present for catalogue search, all categories, and reset.
- [ ] Build a labelled search field with a clear button, live result count, and horizontally scrollable category controls.
- [ ] Filter the catalogue with `selectHomeTools`, regroup the result, and show the existing empty state when nothing matches.
- [ ] Preserve complete prerendered content when JavaScript is unavailable by rendering the initial unfiltered groups.
- [ ] Run focused tests and typecheck.

### Task 4: Compact hero and catalogue hierarchy

**Files:**

- Modify: `components/hero.tsx`
- Modify: `components/category-section.tsx`
- Modify: `components/tool-card.tsx`
- Modify: `app/globals.css`

**Interfaces:**

- Consumes: existing props and design tokens only.
- Produces: the same public component interfaces with refreshed layout and states.

- [ ] Recompose the hero into a compact wide-screen grid using existing content.
- [ ] Move card identity into a tighter icon/title row and make status placement consistent.
- [ ] Remove card sheen/shimmer elements and CSS; retain border, lift, active, and focus feedback.
- [ ] Reduce glow/noise/drift intensity without changing semantic color tokens or contrast-critical foregrounds.
- [ ] Run format check and typecheck.

### Task 5: Customization documentation

**Files:**

- Create: `CUSTOMIZATION.md`
- Modify: `README.md`

**Interfaces:**

- Consumes: the final config and slot APIs.
- Produces: a single owner-facing map for brand, home controls, tools, slots, colors, and CSS escape hatches.

- [ ] Document each safe customization surface with exact file paths and examples.
- [ ] Link the guide from README and update the description of empty slots and inline search.

### Task 6: Full verification and remote handoff

**Files:**

- Verify all changed files.

- [ ] Run `pnpm run check`.
- [ ] Run `pnpm run build`.
- [ ] Run `pnpm run audit:external`.
- [ ] Inspect `git diff --check` and the complete diff.
- [ ] Commit the verified changes locally.
- [ ] Upload only after confirming remote write access; verify the remote commit SHA.
- [ ] After verified upload, move the exact local repository and task-created temporary artifacts to the operating-system Trash as requested.
