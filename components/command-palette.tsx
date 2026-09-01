'use client'

import { Command } from 'cmdk'
import {
  ArrowUpRight,
  Check,
  Gauge,
  Info,
  Keyboard,
  Languages,
  Moon,
  Search,
  Sun,
  Trash2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { Badge } from '@/components/ui/badge'
import { ShortcutHint } from '@/components/ui/shortcut-hint'
import { useApplePlatform } from '@/hooks/use-hotkeys'
import { useLocale } from '@/hooks/use-locale'
import { useAccent, useDensity, type Density } from '@/hooks/use-preference'
import { useRecent } from '@/hooks/use-recent'
import { resolveIcon } from '@/lib/icons'
import { buildSearchIndex, searchIndex } from '@/lib/search'
import {
  categoryCounts,
  enabledTools,
  getCategory,
  getTool,
  orderedCategories,
  toolTarget,
} from '@/lib/tools'
import { cn, fill, localePath } from '@/lib/utils'
import { localeMeta, locales, type Locale } from '@/types/i18n'
import { themeAccents, type ThemeAccent, type ToolItem } from '@/types/tool'

/**
 * The command palette: one keystroke to every tool, category and preference.
 *
 * It is the only place in the project that loads `cmdk`, and it is loaded through
 * `next/dynamic` from `PaletteHost` — see that file for why. cmdk is used for
 * exactly what it is good at (listbox semantics, `aria-activedescendant`,
 * keyboard traversal, the Radix dialog underneath) and explicitly *not* for
 * filtering: `shouldFilter={false}` hands ranking to `lib/search.ts`, which
 * scores both languages, the tags and the optional pinyin initials with field
 * weights. cmdk's own matcher knows none of that.
 */
export interface CommandPaletteLabels {
  title: string
  placeholder: string
  empty: string
  groupRecent: string
  groupTools: string
  groupCategories: string
  groupActions: string
  groupAccents: string
  toggleTheme: string
  toggleLocale: string
  toggleDensity: string
  clearRecent: string
  openAbout: string
  showHelp: string
  /** Template, "Accent: {name}". */
  accentAction: string
  /** Keyed by ramp, so adding a ramp is a compile error here. */
  accents: Record<ThemeAccent, string>
  themes: { light: string; dark: string }
  densities: Record<Density, string>
  /** Template, "{count} tools" — the trailing count on a category row. */
  countLabel: string
  demoBadge: string
  externalHint: string
  hintNavigate: string
  hintOpen: string
  hintNewTab: string
  hintClose: string
}

/**
 * Rows are built as data and rendered afterwards, because the list is needed
 * twice: once for the DOM, and once so ⌘Enter and the initial highlight know
 * what they are pointing at without reading the DOM back.
 */
interface PaletteRow {
  /** Unique, lowercase, no whitespace — cmdk compares these strings verbatim. */
  value: string
  label: string
  /** 16px leading glyph. */
  leading: ReactNode
  /** Right-aligned muted text: a category name, a count, the next value. */
  meta?: string
  /** Match targets beyond `label`, so an English query finds a Chinese action. */
  keywords?: readonly string[]
  demo?: boolean
  external?: boolean
  /** ⌘Enter target. Rows without one ignore the modifier. */
  newTabHref?: string
  activate: (newTab: boolean) => void
}

/** The registry is static, so the index and the counts are built once. */
const searchEntries = buildSearchIndex(enabledTools)
const counts = categoryCounts()

/** Enough to answer any query; the grid is the place to browse everything. */
const MAX_TOOL_ROWS = 12
const MAX_RECENT_ROWS = 4

/**
 * Swatch classes as a fixed map, not a template string: Tailwind only emits the
 * classes it can literally see. Same map as `AccentToggle`, same reason.
 */
const swatchClass: Record<ThemeAccent, string> = {
  indigo: 'bg-swatch-indigo',
  violet: 'bg-swatch-violet',
  cyan: 'bg-swatch-cyan',
  emerald: 'bg-swatch-emerald',
}

const itemClass = cn(
  'flex items-center gap-2.5 rounded-md px-2 py-2 text-xs text-foreground/90',
  'cursor-pointer outline-none select-none',
  'transition-[background-color,color] duration-150 ease-glide',
  // Focus stays in the input (this is a combobox), so the highlight *is* the
  // focus indicator: it carries a border as well as a tint, never colour alone.
  'data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/15',
  'border border-transparent data-[selected=true]:text-foreground',
  'coarse:py-3',
)

const groupClass = cn(
  'mb-1 last:mb-0',
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-1.5 [&_[cmdk-group-heading]]:pb-1',
  '[&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium',
  '[&_[cmdk-group-heading]]:text-muted-foreground',
)

/** Case-insensitive substring match. The query is already lowercased. */
function hit(query: string, haystacks: readonly string[]): boolean {
  if (query === '') return true
  return haystacks.some((text) => text.toLocaleLowerCase().includes(query))
}

export interface CommandPaletteProps {
  locale: Locale
  labels: CommandPaletteLabels
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Opens the shortcut sheet. Owned by the host so the two overlays stay exclusive. */
  onShowHelp: () => void
}

export function CommandPalette({
  locale,
  labels,
  open,
  onOpenChange,
  onShowHelp,
}: CommandPaletteProps) {
  const router = useRouter()
  const apple = useApplePlatform()
  const { resolvedTheme, setTheme } = useTheme()
  const { value: density, setValue: setDensity } = useDensity()
  const { value: accent, setValue: setAccent } = useAccent()
  const { pathWithLocale, remember } = useLocale()
  const { recent, push: pushRecent, clear: clearRecent } = useRecent()

  const [rawQuery, setRawQuery] = useState('')
  const [value, setValue] = useState('')

  // Cleared on close, not on open: a palette that reopens holding the previous
  // search is a palette you have to clear before you can use it, and doing it on
  // the way out means the panel never flashes the stale query.
  useEffect(() => {
    if (!open) setRawQuery('')
  }, [open])

  const query = rawQuery.trim().toLocaleLowerCase()
  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const openHref = useCallback(
    (href: string, newTab: boolean) => {
      if (newTab) {
        // `noopener` is what stops the opened document getting a handle on this
        // one; `noreferrer` keeps the URL out of its Referer header.
        window.open(href, '_blank', 'noopener,noreferrer')
        return
      }
      router.push(href)
    },
    [router],
  )

  const toolRow = useCallback(
    (tool: ToolItem, rowValue: string): PaletteRow => {
      const target = toolTarget(tool, locale)
      const Icon = resolveIcon(tool.icon)
      const category = getCategory(tool.categoryId)

      return {
        value: rowValue,
        label: tool.name[locale],
        leading: <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />,
        meta: category?.name[locale],
        demo: tool.demo === true,
        external: target.external,
        newTabHref: target.href,
        activate: (newTab) => {
          // Recorded here rather than on the destination page, so external links
          // land in the history too — they navigate away and never report back.
          pushRecent(tool.id)
          openHref(target.href, newTab || target.external)
          close()
        },
      }
    },
    [locale, openHref, pushRecent, close],
  )

  const recentRows = useMemo<PaletteRow[]>(() => {
    // Only with an empty query: once you are searching, the ranked list below is
    // the better answer and a duplicate row above it is just noise.
    if (query !== '') return []
    return recent
      .slice(0, MAX_RECENT_ROWS)
      .map((id) => getTool(id))
      .filter((tool): tool is ToolItem => tool !== undefined)
      .map((tool) => toolRow(tool, `recent:${tool.id}`))
  }, [query, recent, toolRow])

  const toolRows = useMemo<PaletteRow[]>(
    () =>
      searchIndex(searchEntries, query)
        .slice(0, MAX_TOOL_ROWS)
        .map((result) => toolRow(result.tool, `tool:${result.tool.id}`)),
    [query, toolRow],
  )

  const categoryRows = useMemo<PaletteRow[]>(
    () =>
      orderedCategories
        .filter((category) => hit(query, [category.name.zh, category.name.en, category.id]))
        .map((category) => {
          const Icon = resolveIcon(category.icon)
          const href = `${localePath(locale)}#cat-${category.id}`

          return {
            value: `cat:${category.id}`,
            label: category.name[locale],
            leading: <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />,
            meta: fill(labels.countLabel, { count: counts[category.id] ?? 0 }),
            newTabHref: href,
            activate: (newTab: boolean) => {
              if (newTab) {
                window.open(href, '_blank', 'noopener,noreferrer')
                close()
                return
              }
              // `assign` rather than `router.push`, because the same call has to
              // cover two cases: already on the home page, where this is a
              // same-document jump to the section, and on a tool page, where the
              // document has to load before the anchor can resolve.
              window.location.assign(href)
            },
          }
        }),
    [query, locale, labels.countLabel, close],
  )

  const dark = resolvedTheme === 'dark'
  const nextLocale = locales.find((candidate) => candidate !== locale) ?? locale
  const nextDensity: Density = density === 'comfortable' ? 'compact' : 'comfortable'
  const aboutHref = localePath(locale, 'about')

  const actionRows = useMemo<PaletteRow[]>(() => {
    // The keyword lists are synonyms, never rendered, and deliberately bilingual:
    // the visible label is already in the active language, so what these add is
    // the *other* language plus the words people actually type ("dark", "i18n").
    const rows: PaletteRow[] = [
      {
        value: 'act:theme',
        label: labels.toggleTheme,
        leading: dark ? (
          <Sun aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Moon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        ),
        meta: dark ? labels.themes.light : labels.themes.dark,
        keywords: ['theme', 'dark', 'light', '主题', '暗色', '亮色'],
        activate: () => {
          setTheme(dark ? 'light' : 'dark')
          close()
        },
      },
      {
        value: 'act:locale',
        label: labels.toggleLocale,
        leading: <Languages aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />,
        meta: localeMeta[nextLocale].label,
        keywords: ['language', 'locale', 'i18n', '语言', '中文', 'english'],
        activate: () => {
          remember(nextLocale)
          // A hard load on purpose: the other language is a different static
          // document, and `<html lang>` plus the per-script typography have to be
          // right from the first paint rather than patched in after it.
          window.location.assign(pathWithLocale(nextLocale))
        },
      },
      {
        value: 'act:density',
        label: labels.toggleDensity,
        leading: <Gauge aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />,
        meta: labels.densities[nextDensity],
        keywords: ['density', 'compact', 'comfortable', 'spacing', '密度', '紧凑', '舒适'],
        activate: () => {
          setDensity(nextDensity)
          close()
        },
      },
      {
        value: 'act:help',
        label: labels.showHelp,
        leading: <Keyboard aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />,
        meta: '?',
        keywords: ['help', 'shortcut', 'keyboard', '快捷键', '帮助', '键盘'],
        activate: () => {
          close()
          onShowHelp()
        },
      },
      {
        value: 'act:about',
        label: labels.openAbout,
        leading: <Info aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />,
        keywords: ['about', 'privacy', '关于', '隐私'],
        newTabHref: aboutHref,
        activate: (newTab: boolean) => {
          openHref(aboutHref, newTab)
          close()
        },
      },
    ]

    // Offered only when there is something to clear: a dead row is worse than no
    // row, and this one destroys data.
    if (recent.length > 0) {
      rows.push({
        value: 'act:clear-recent',
        label: labels.clearRecent,
        leading: <Trash2 aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />,
        keywords: ['clear', 'recent', 'history', '清空', '最近', '记录'],
        activate: () => {
          clearRecent()
          close()
        },
      })
    }

    return rows.filter((row) => hit(query, [row.label, ...(row.keywords ?? [])]))
  }, [
    query,
    labels,
    dark,
    nextLocale,
    nextDensity,
    aboutHref,
    recent.length,
    setTheme,
    setDensity,
    remember,
    pathWithLocale,
    openHref,
    clearRecent,
    onShowHelp,
    close,
  ])

  const accentRows = useMemo<PaletteRow[]>(
    () =>
      themeAccents
        .map((name) => ({
          value: `accent:${name}`,
          label: fill(labels.accentAction, { name: labels.accents[name] }),
          leading: (
            <span
              aria-hidden="true"
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full',
                swatchClass[name],
              )}
            >
              {name === accent ? (
                <Check className="size-3 text-background" strokeWidth={3} />
              ) : null}
            </span>
          ),
          keywords: ['accent', 'color', 'colour', name, '强调色', '主题色'],
          activate: () => {
            setAccent(name)
            close()
          },
        }))
        .filter((row) => hit(query, [row.label, ...row.keywords])),
    [query, labels.accentAction, labels.accents, accent, setAccent, close],
  )

  const groups = useMemo(
    () =>
      [
        { id: 'recent', heading: labels.groupRecent, rows: recentRows },
        { id: 'tools', heading: labels.groupTools, rows: toolRows },
        { id: 'categories', heading: labels.groupCategories, rows: categoryRows },
        { id: 'actions', heading: labels.groupActions, rows: actionRows },
        { id: 'accents', heading: labels.groupAccents, rows: accentRows },
      ].filter((group) => group.rows.length > 0),
    [labels, recentRows, toolRows, categoryRows, actionRows, accentRows],
  )

  const rows = useMemo(() => groups.flatMap((group) => group.rows), [groups])
  const byValue = useMemo(() => new Map(rows.map((row) => [row.value, row])), [rows])

  // With filtering disabled, cmdk has no idea the list changed underneath it, so
  // the highlight is re-pointed here: keep it where it is if that row survived,
  // otherwise move to the top of the new list.
  useEffect(() => {
    setValue((current) => (byValue.has(current) ? current : (rows[0]?.value ?? '')))
  }, [byValue, rows])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter') return
    if (!(event.metaKey || event.ctrlKey)) return

    const row = byValue.get(value)
    if (row?.newTabHref === undefined) return

    // cmdk checks `defaultPrevented` before running its own Enter handling, so
    // claiming the event here is the documented way to take it over.
    event.preventDefault()
    row.activate(true)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label={labels.title}
      // Ranking belongs to `lib/search.ts` — see the note at the top of the file.
      shouldFilter={false}
      // cmdk's vim bindings put "move up" on Ctrl+K, which is this palette's own
      // open shortcut. Leaving them on would make the toggle jump the highlight.
      vimBindings={false}
      loop
      value={value}
      onValueChange={setValue}
      onKeyDown={onKeyDown}
      // A flat tint, not a blurred scrim: the panel below is `.glass` and so is
      // the sticky header behind it, which is already the two-layer budget.
      // 92% rather than 80%: the palette floats over whatever the page was
      // showing, so the page's own headline can end up directly behind a result
      // row. The blur normally smears it, but the blur is exactly the thing that
      // disappears under `prefers-reduced-transparency` and on browsers that
      // cannot composite a backdrop filter — at which point an 80% tint still
      // leaves legible text behind legible text. 92% keeps the frosted look and
      // removes that failure mode.
      overlayClassName="fixed inset-0 z-50 bg-background/92"
      contentClassName={cn(
        'fixed top-[8vh] left-1/2 z-50 -translate-x-1/2',
        'w-[min(38rem,calc(100vw-2rem))] overflow-hidden rounded-lg glass p-0 outline-none',
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <Command.Input
          value={rawQuery}
          onValueChange={setRawQuery}
          placeholder={labels.placeholder}
          className={cn(
            'h-12 w-full bg-transparent text-xs text-foreground outline-none',
            'placeholder:text-muted-foreground',
          )}
        />
      </div>

      <Command.List
        label={labels.title}
        className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain p-2"
      >
        {/* Not `Command.Empty`: that component keys off cmdk's own filter count,
            which stays at zero when filtering is disabled and would show this
            message permanently. Our row list already knows the answer. */}
        {rows.length === 0 ? (
          <p className="px-2 py-8 text-center text-2xs text-muted-foreground">{labels.empty}</p>
        ) : null}

        {groups.map((group) => (
          <Command.Group key={group.id} heading={group.heading} className={groupClass}>
            {group.rows.map((row) => (
              <Command.Item
                key={row.value}
                value={row.value}
                onSelect={() => row.activate(false)}
                className={itemClass}
              >
                {row.leading}
                <span className="min-w-0 flex-1 truncate">{row.label}</span>

                {row.demo ? <Badge tone="demo">{labels.demoBadge}</Badge> : null}

                {row.external ? (
                  <>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="sr-only">{labels.externalHint}</span>
                  </>
                ) : null}

                {row.meta !== undefined ? (
                  <span className="max-w-[8rem] shrink-0 truncate text-2xs text-muted-foreground">
                    {row.meta}
                  </span>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>

      {/* The hint bar is decorative on touch, where there is no keyboard to hint
          at — but it costs one row and it is how people learn ⌘Enter exists. */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-3 py-2',
          'text-2xs text-muted-foreground',
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <ShortcutHint keys={['up', 'down']} apple={apple} />
          {labels.hintNavigate}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShortcutHint keys={['enter']} apple={apple} />
          {labels.hintOpen}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <ShortcutHint keys={['mod', 'enter']} apple={apple} />
          {labels.hintNewTab}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <ShortcutHint keys={['esc']} apple={apple} />
          {labels.hintClose}
        </span>
      </div>
    </Command.Dialog>
  )
}
