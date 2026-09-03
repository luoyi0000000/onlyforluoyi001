import type { ToolCategory, ToolItem } from '@/types/tool'

/**
 * ============================================================================
 * THE ONLY FILE YOU NEED TO EDIT TO ADD ONE OF YOUR PAGES
 * ============================================================================
 *
 * This site is a launcher for pages you built for yourself — notes, a todo
 * board, a log, whatever you keep reopening. It is not a collection of general
 * purpose utilities, and it does not care what a page does.
 *
 * Adding an entry = appending one object to `tools` below. No component
 * changes, no route changes, no imports. The card, the group heading, the
 * category count, the command palette, the search index and the page at
 * `/<locale>/t/<id>/` all pick it up automatically.
 *
 * Field guide
 * -----------
 *   id          Unique, URL-safe. Becomes the page's path segment and the
 *               localStorage key for favourites/recents. Renaming it orphans a
 *               visitor's saved data, so pick it once.
 *   name/desc   `{ zh, en }`. Keep `desc` to roughly 40 characters: the card
 *               clamps it to two lines.
 *   categoryId  Must match a `categories[].id` below, or the build fails.
 *   icon        A name registered in `lib/icons.ts`. Unknown names fall back to
 *               a wrench and are reported at build time.
 *   kind        'internal' -> renders inside this site at /<locale>/t/<id>/
 *               'link'     -> the card opens an external URL in a new tab. The
 *                             page at /<locale>/t/<id>/ is still generated as a
 *                             permalink and says where the entry leads, so
 *                             flipping `kind` later does not change any URL.
 *   href        Required for 'link', forbidden for 'internal'.
 *   route       Optional override for 'internal', relative to the locale root.
 *               Omit it and the generated page shell is used. If you set it,
 *               you are responsible for creating that page.
 *   tags        Free-form, searchable, and shown on the tool detail page.
 *   accent      Icon-tile gradient. One of `accentNames` in `types/tool.ts`.
 *   badge       'new' | 'beta' | 'wip'
 *   pinned      Optional signal exposed through `lib/tools.ts` for a custom
 *               pinned surface. The built-in home catalogue does not reorder.
 *   enabled     Defaults to true. `false` hides it everywhere without deleting.
 *   pinyin      Optional pinyin initials so ⌘K matches "wdbj" against
 *               "我的笔记". Purely additive.
 *   demo        Marks seed data. Every entry below sets it, which is what makes
 *               the "示例 / DEMO" badge appear. DELETE THESE TWELVE ENTRIES
 *               (or flip `demo` off) once your own pages are registered.
 */

/* Keep the launcher focused on pages you actually use. Add another category
   only when it has a real page to put in it. */
export const categories: ToolCategory[] = [
  { id: 'daily', name: { zh: '是好东西哦', en: 'Good stuff' }, icon: 'Zap', order: 1 },
]

/* ---------------------------------------------------------------------------
   Personal links. The optional `iconSrc` points at a same-origin image under
   `public/`; `icon` remains a safe fallback for text-only or failed image
   rendering.
   --------------------------------------------------------------------------- */
export const tools: ToolItem[] = [
  {
    id: 'convert-node',
    name: { zh: '转换节点', en: 'Convert Nodes' },
    desc: { zh: '节点都在这哦', en: 'All the nodes are here' },
    categoryId: 'daily',
    icon: 'ArrowLeftRight',
    iconSrc: '/images/p4.png',
    kind: 'link',
    href: 'https://convert.onlyforluoyi001.com/dashboard',
    tags: ['convert', 'nodes'],
    accent: 'indigo',
    pinned: true,
  },
  {
    id: 'probe',
    name: { zh: '探针', en: 'Probe' },
    desc: { zh: '看看机机还活着吗', en: 'Check whether the machines are alive' },
    categoryId: 'daily',
    icon: 'ShieldCheck',
    iconSrc: '/images/p3.png',
    kind: 'link',
    href: 'https://monitor.onlyforluoyi001.com/',
    tags: ['monitor', 'status'],
    accent: 'violet',
    pinned: true,
  },
]
