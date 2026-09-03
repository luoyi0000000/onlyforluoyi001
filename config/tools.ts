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

/* Four everyday groups rather than technical ones: you are sorting your own
   pages by when you reach for them, not by what they are built out of. Rename
   them freely — the ids are what filters and anchors use, the names are
   just labels. */
export const categories: ToolCategory[] = [
  { id: 'daily', name: { zh: '常用', en: 'Everyday' }, icon: 'Zap', order: 1 },
  { id: 'work', name: { zh: '工作', en: 'Work' }, icon: 'Briefcase', order: 2 },
  { id: 'life', name: { zh: '生活', en: 'Life' }, icon: 'House', order: 3 },
  { id: 'lab', name: { zh: '实验', en: 'Lab' }, icon: 'FlaskConical', order: 4 },
]

/* ---------------------------------------------------------------------------
   DEMO SEED DATA — 12 placeholder entries.

   None of these lead anywhere yet. Each one opens the page shell, which shows
   an explicit "此处放置工具 UI / Tool UI goes here" slot. They exist so the
   site looks and behaves like a finished product before your own pages land,
   and every one of them carries `demo: true` so it is impossible to mistake a
   placeholder for something that works.

   `tags` are printed verbatim on the detail page, so these use language-neutral
   keywords. The registry accepts anything — putting Chinese words here works
   and makes them searchable — but a Chinese chip on an English card reads as a
   bug, so the search index leans on the bilingual `name`/`desc`/`pinyin`
   instead.
   --------------------------------------------------------------------------- */
export const tools: ToolItem[] = [
  {
    id: 'my-notes',
    name: { zh: '我的笔记', en: 'My Notes' },
    desc: { zh: '随手记的那一页', en: 'Where the loose notes go' },
    categoryId: 'daily',
    icon: 'NotebookPen',
    kind: 'internal',
    tags: ['notes', 'write'],
    accent: 'indigo',
    pinned: true,
    pinyin: 'wdbj',
    demo: true,
  },
  {
    id: 'today-todo',
    name: { zh: '每日待办', en: 'Daily Todo' },
    desc: { zh: '今天要做的几件事', en: "Today's short list" },
    categoryId: 'daily',
    icon: 'ListTodo',
    kind: 'internal',
    tags: ['todo', 'plan'],
    accent: 'violet',
    pinned: true,
    pinyin: 'mrdb',
    demo: true,
  },
  {
    id: 'bookmarks',
    name: { zh: '常去的站', en: 'Bookmarks' },
    desc: { zh: '反复打开的那几个地址', en: 'The few sites I keep reopening' },
    categoryId: 'daily',
    icon: 'Bookmark',
    kind: 'internal',
    tags: ['links', 'bookmark'],
    accent: 'cyan',
    pinyin: 'cqdz',
    demo: true,
  },
  {
    id: 'weather',
    name: { zh: '天气看板', en: 'Weather Board' },
    desc: { zh: '出门前看一眼', en: 'A glance before heading out' },
    categoryId: 'daily',
    icon: 'Cloud',
    kind: 'internal',
    tags: ['weather', 'dashboard'],
    accent: 'cyan',
    badge: 'wip',
    pinyin: 'tqkb',
    demo: true,
  },
  {
    id: 'project-board',
    name: { zh: '项目看板', en: 'Project Board' },
    desc: { zh: '手上几件事的进度', en: 'What is in flight right now' },
    categoryId: 'work',
    icon: 'Kanban',
    kind: 'internal',
    tags: ['kanban', 'work'],
    accent: 'indigo',
    badge: 'new',
    pinyin: 'xmkb',
    demo: true,
  },
  {
    id: 'snippets',
    name: { zh: '代码片段', en: 'Snippets' },
    desc: { zh: '老是记不住的那几段', en: 'The lines I keep forgetting' },
    categoryId: 'work',
    icon: 'SquareCode',
    kind: 'internal',
    tags: ['code', 'snippet'],
    accent: 'violet',
    pinyin: 'dmpd',
    demo: true,
  },
  {
    id: 'meeting-notes',
    name: { zh: '会议记录', en: 'Meeting Notes' },
    desc: { zh: '会上记下来的东西', en: 'Notes taken in the room' },
    categoryId: 'work',
    icon: 'ClipboardList',
    kind: 'internal',
    tags: ['meeting', 'notes'],
    accent: 'emerald',
    pinyin: 'hyjl',
    demo: true,
  },
  {
    id: 'expenses',
    name: { zh: '记账本', en: 'Expenses' },
    desc: { zh: '这个月花到哪去了', en: 'Where the month went' },
    categoryId: 'life',
    icon: 'PiggyBank',
    kind: 'internal',
    tags: ['money', 'budget'],
    accent: 'amber',
    pinyin: 'jzb',
    demo: true,
  },
  {
    id: 'watchlist',
    name: { zh: '想看的片', en: 'Watchlist' },
    desc: { zh: '存着还没看的那些', en: 'Films still waiting their turn' },
    categoryId: 'life',
    icon: 'Film',
    kind: 'internal',
    tags: ['movies', 'list'],
    accent: 'rose',
    pinyin: 'xkdp',
    demo: true,
  },
  {
    id: 'gym-log',
    name: { zh: '运动记录', en: 'Workout Log' },
    desc: { zh: '这周动了几次', en: 'Sessions logged this week' },
    categoryId: 'life',
    icon: 'Dumbbell',
    kind: 'internal',
    tags: ['fitness', 'log'],
    accent: 'emerald',
    pinyin: 'ydjl',
    demo: true,
  },
  {
    id: 'sandbox',
    name: { zh: '试验场', en: 'Sandbox' },
    desc: { zh: '乱试东西的地方', en: 'Where half-finished ideas live' },
    categoryId: 'lab',
    icon: 'FlaskConical',
    kind: 'internal',
    tags: ['sandbox', 'draft'],
    accent: 'violet',
    badge: 'beta',
    pinyin: 'syc',
    demo: true,
  },
  {
    // The one external example: the card opens the target in a new tab, and
    // /t/my-blog/ stays a permalink that says where the entry leads.
    id: 'my-blog',
    name: { zh: '我的博客', en: 'My Blog' },
    desc: { zh: '外链示例：站外的自己的页面', en: 'External example: a page of mine' },
    categoryId: 'lab',
    icon: 'BookOpen',
    kind: 'link',
    href: 'https://example.com/blog',
    tags: ['blog', 'external'],
    accent: 'indigo',
    pinyin: 'wdbk',
    demo: true,
  },
]
