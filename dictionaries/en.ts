import type { Dictionary } from './zh'

/**
 * Typed against the Chinese dictionary: a missing, extra or renamed key is a
 * compile error, not a runtime surprise.
 */
export const en: Dictionary = {
  meta: {
    title: 'Toolbox',
    titleTemplate: '%s · Toolbox',
    description:
      'A client-only personal toolbox. Everything stays on your machine — nothing is uploaded, nothing is tracked.',
  },

  a11y: {
    skipToContent: 'Skip to main content',
    mainLandmark: 'Main content',
    sidebarLandmark: 'Tool categories',
    breadcrumbLandmark: 'Breadcrumb',
    footerLandmark: 'Footer links',
    resultsAnnouncement: '{count} tools',
    noResultsAnnouncement: 'No matching tools',
    externalLink: 'Opens in a new tab',
    loading: 'Loading',
  },

  nav: {
    home: 'Home',
    about: 'About',
    allTools: 'All tools',
    categories: 'Categories',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
  },

  actions: {
    search: 'Search tools',
    searchPlaceholder: 'Search tools, tags or descriptions…',
    openCommandPalette: 'Open command palette',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    clear: 'Clear',
    paste: 'Paste',
    pasteFailed: 'The browser refused clipboard access — paste manually (Ctrl/⌘ + V)',
    download: 'Download',
    pin: 'Pin',
    unpin: 'Unpin',
    clearRecent: 'Clear recent',
    reset: 'Reset',
    retry: 'Try again',
    backHome: 'Back to home',
  },

  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    switchTo: 'Switch to {mode}',
  },

  locale: {
    label: 'Language',
    switchTo: 'Switch to {language}',
  },

  density: {
    label: 'Density',
    comfortable: 'Comfortable',
    compact: 'Compact',
  },

  accent: {
    label: 'Accent',
    indigo: 'Indigo',
    violet: 'Violet',
    cyan: 'Cyan',
    emerald: 'Emerald',
  },

  appearance: {
    title: 'Appearance',
  },

  sections: {
    pinned: 'Pinned',
    recent: 'Recent',
    all: 'All tools',
    results: 'Results',
  },

  slot: {
    title: 'This band is yours',
    desc: 'Open components/slots.tsx and return your own JSX from {name} — the whole panel is yours.',
  },

  empty: {
    noResultsTitle: 'No tools matched',
    noResultsDesc: 'Try a shorter keyword, or clear the active filters.',
    noPinnedTitle: 'Nothing pinned yet',
    noPinnedDesc: 'Hit the star on any card and it will stick to the top.',
    noRecentTitle: 'No history yet',
    noRecentDesc: 'Open a tool and the last few you used will show up here.',
    noToolsTitle: 'Nothing registered yet',
    noToolsDesc:
      'Open config/tools.ts, add an entry to the tools array, and a card for it appears here.',
    clearFilters: 'Clear filters',
  },

  badge: {
    new: 'New',
    beta: 'Beta',
    wip: 'WIP',
    demo: 'Demo',
  },

  footer: {
    aboutLink: 'About',
    backToTop: 'Back to top',
  },

  hero: {
    dismiss: 'Hide intro',
    restore: 'Show intro',
    hint: 'searches everything, any time',
  },

  sidebar: {
    toolCount: '{count}',
    drawerTitle: 'Browse by category',
    openDrawer: 'Browse categories',
    closeDrawer: 'Close categories',
  },

  card: {
    open: 'Open {name}',
    externalHint: 'External link',
    pinOn: 'Pin {name}',
    pinOff: 'Unpin {name}',
    demoHint: 'Demo entry — not implemented yet',
  },

  tags: {
    title: 'Tags',
    clear: 'Clear tag filter',
    toggle: 'Filter by tag {tag}',
    active: '{count} tags selected',
    showMore: '{count} more',
    showLess: 'Show fewer',
  },

  search: {
    resultCount: '{count} tools',
    resultCountFiltered: '{count} of {total} tools',
    clear: 'Clear search',
    inCategory: 'Category: {name}',
  },

  palette: {
    title: 'Command palette',
    placeholder: 'Search tools, or type a command…',
    empty: 'No matches',
    groupTools: 'Tools',
    groupCategories: 'Jump to category',
    groupActions: 'Actions',
    groupAccents: 'Accent colour',
    actionToggleTheme: 'Toggle theme',
    actionToggleLocale: 'Switch language',
    actionToggleDensity: 'Toggle density',
    actionShowHelp: 'Show keyboard shortcuts',
    actionAccent: 'Accent: {name}',
    actionClearRecent: 'Clear recent',
    actionOpenAbout: 'Open “About this site”',
    hintNavigate: 'Navigate',
    hintOpen: 'Open',
    hintNewTab: 'Open in new tab',
    hintClose: 'Close',
  },

  shortcuts: {
    title: 'Keyboard shortcuts',
    desc: 'While you are typing in a field, only Esc is handled — nothing else steals your keys.',
    openPalette: 'Open the command palette',
    focusSearch: 'Open search',
    showHelp: 'Show this shortcut list',
    closeOverlay: 'Close the overlay and return focus to what opened it',
    openInNewTab: 'Open the highlighted item in a new tab',
    moveInGrid: 'Move around the card grid',
  },

  tool: {
    workspaceTitle: 'Workspace',
    workspacePlaceholder: 'Tool UI goes here',
    workspaceHint:
      'Render your implementation into this slot — the shell, breadcrumb, pin button and toolbar are already wired.',
    inputLabel: 'Input',
    outputLabel: 'Output',
    inputPlaceholder: 'Paste or type here…',
    outputPlaceholder: 'The result shows up here',
    demoTitle: 'This is a demo entry',
    demoBody:
      'It comes from the seed data in config/tools.ts and does nothing yet. Rewrite or delete that one entry.',
    categoryLabel: 'Category',
    tagsLabel: 'Tags',
    externalTitle: 'This is an external link',
    externalBody:
      'This entry is not rendered here. The button below opens the target in a new tab.',
    openExternal: 'Open in a new tab',
  },

  demo: {
    noticeTitle: 'Showing demo data',
    noticeBody:
      'These {count} tools are placeholders used to verify layout and interaction. Edit config/tools.ts to register your own.',
  },

  preview: {
    stageBadge: 'Stage 1 · Visual preview',
    title: 'Design tokens and glass primitives',
    lead: 'This page exists to verify the visual foundation: semantic colours, glass surfaces, five control states, contrast, and reduced-preference fallbacks. The tool grid lands in stage 2.',
    tokensTitle: 'Semantic colour tokens',
    surfacesTitle: 'Surface hierarchy',
    surfaceGlass: 'Glass surface (.glass)',
    surfaceGlassDesc: 'Body text always lands here — never directly on a gradient lobe.',
    surfaceInset: 'Inset surface (.glass-inset)',
    surfaceInsetDesc:
      'Nests inside glass without a second backdrop blur, keeping the two-layer budget.',
    surfaceSolid: 'Solid surface (card)',
    surfaceSolidDesc: 'What the glass degrades to under prefers-reduced-transparency.',
    statesTitle: 'Five control states',
    stateHover: 'Hover',
    stateFocus: 'Focus (Tab here)',
    stateActive: 'Active',
    stateDisabled: 'Disabled',
    stateLoading: 'Loading',
    contrastTitle: 'Contrast audit',
    contrastPair: 'Pair',
    contrastRatio: 'Ratio',
    contrastRequired: 'Required',
    contrastResult: 'Verdict',
    contrastPass: 'Pass',
    typeTitle: 'Type scale',
    typeSample: 'Mixed script 中英文混排 12345',
    skeletonTitle: 'Loading skeleton',
    skeletonDesc:
      'The skeleton mirrors a real card element for element — same padding token, same 48px tile, one title row, two description lines, one badge row — so swapping one for the other shifts nothing.',
    a11yTitle: 'Reduced-preference behaviour',
    a11yTransparency:
      'Reduced transparency: glass turns opaque, blur and glow are switched off entirely.',
    a11yMotion: 'Reduced motion: the glow stops drifting; only sub-100ms opacity fades remain.',
    a11yHint: 'Flip the matching switch in your OS settings and reload this page to verify.',
  },

  about: {
    title: 'About this site',
    lead: 'A toolbox that runs entirely inside your browser. This page spells out what it is, what it stores, and how to check both for yourself.',
    whatTitle: 'What this is',
    what: 'A single entry point for the small tools you reach for often: every entry laid out under its group, ⌘K / Ctrl K to search, and pins and recents kept on one row at the top. Tools are registered through a config file — adding one means adding one object to an array.',
    privacyTitle: 'Privacy and data',
    privacyBody:
      'The site is a set of static files. There is no backend, no API, no analytics and no third-party script. Whatever you type into a tool is computed in the page and goes nowhere else — it is never sent anywhere and never written to a log.',
    storageTitle: 'What is stored locally',
    storageTheme: 'Theme preference: dark / light / follow system',
    storageLocale: 'Language preference: 中文 / English',
    storagePrefs: 'Density and accent preference',
    storageFavorites: 'The ids of pinned tools',
    storageRecent: 'The ids of recently opened tools',
    storageNote:
      'All of it lives in this browser’s localStorage under keys prefixed with `toolbox.`. Clearing site data removes every trace; there is no server-side copy to clear.',
    networkTitle: 'Network requests',
    networkBody:
      'Nothing is requested after the first load. The font is a self-hosted woff2, the background glow and grain are CSS and an inline SVG. No external image, no third-party CDN, no Google Fonts.',
    verifyTitle: 'How to verify it yourself',
    verifyBody:
      'Open the Network panel in devtools, tick “Disable cache” and reload: apart from this site’s own HTML, CSS, JS and that one font file, there should be no external request at all. You can also switch JavaScript off and reload — the content and the tool list stay readable.',
  },

  notFound: {
    code: '404',
    title: 'Nothing here',
    desc: 'The link may have expired, or the address is off by a character.',
  },
}
