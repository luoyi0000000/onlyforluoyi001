/**
 * Chinese is the source of truth for the dictionary shape. `Dictionary` is
 * derived from this object, so `dictionaries/en.ts` fails to compile the moment
 * a key is missing, misspelled or extra. No i18n framework involved.
 *
 * Note the deliberate absence of `as const`: string literals widen to `string`,
 * which is what lets the English dictionary hold different values while still
 * being checked against the same key structure.
 */
export const zh = {
  meta: {
    title: '工具箱',
    titleTemplate: '%s · 工具箱',
    description: '一个纯前端的个人工具站：所有数据留在本机，不上传、不追踪。',
  },

  a11y: {
    skipToContent: '跳转到主内容',
    mainLandmark: '主内容',
    sidebarLandmark: '工具分类',
    breadcrumbLandmark: '面包屑导航',
    footerLandmark: '页脚链接',
    resultsAnnouncement: '共 {count} 个工具',
    noResultsAnnouncement: '没有匹配的工具',
    externalLink: '在新标签页打开',
    loading: '加载中',
  },

  nav: {
    home: '首页',
    about: '关于',
    allTools: '全部工具',
    categories: '分类',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    collapseSidebar: '折叠侧边栏',
    expandSidebar: '展开侧边栏',
  },

  actions: {
    search: '搜索工具',
    searchPlaceholder: '搜索工具、标签或说明…',
    openCommandPalette: '打开命令面板',
    close: '关闭',
    copy: '复制',
    copied: '已复制',
    copyFailed: '复制失败',
    clear: '清空',
    paste: '粘贴',
    pasteFailed: '浏览器拒绝了读取剪贴板，请手动粘贴（Ctrl/⌘ + V）',
    download: '下载',
    pin: '收藏',
    unpin: '取消收藏',
    clearRecent: '清空最近使用',
    reset: '重置',
    retry: '重试',
    backHome: '返回首页',
  },

  theme: {
    label: '主题',
    light: '亮色',
    dark: '暗色',
    system: '跟随系统',
    switchTo: '切换到{mode}',
  },

  locale: {
    label: '语言',
    switchTo: '切换到{language}',
  },

  density: {
    label: '密度',
    comfortable: '舒适',
    compact: '紧凑',
  },

  accent: {
    label: '强调色',
    indigo: '靛蓝',
    violet: '紫罗兰',
    cyan: '青',
    emerald: '翠绿',
  },

  appearance: {
    title: '外观设置',
  },

  sections: {
    pinned: '置顶收藏',
    recent: '最近使用',
    all: '全部工具',
    results: '搜索结果',
  },

  slot: {
    title: '这一格留给你',
    desc: '打开 components/slots.tsx，把 {name} 的返回值换成你自己的 JSX，这一整格就归你了。',
  },

  empty: {
    noResultsTitle: '没有找到匹配的工具',
    noResultsDesc: '试试更短的关键字，或清除筛选条件。',
    noPinnedTitle: '还没有收藏',
    noPinnedDesc: '在卡片上点击星标，工具就会固定到这里。',
    noRecentTitle: '还没有使用记录',
    noRecentDesc: '打开任意工具后，这里会显示最近用过的几个。',
    noToolsTitle: '还没有登记任何工具',
    noToolsDesc: '打开 config/tools.ts，往 tools 数组里加一条，这一页就会出现对应的卡片。',
    clearFilters: '清除筛选',
  },

  badge: {
    new: '新',
    beta: '测试',
    wip: '开发中',
    demo: '示例',
  },

  footer: {
    privacyTitle: '隐私承诺',
    privacy:
      '纯前端站点：没有后端、没有接口、没有埋点、没有第三方脚本与字体请求。主题、语言、收藏与最近使用只写入本机 localStorage，数据不出本机。',
    aboutLink: '关于本站',
    sourceLink: '源码',
    backToTop: '回到顶部',
  },

  hero: {
    dismiss: '收起介绍',
    restore: '展开介绍',
    hint: '随时搜索全部工具',
  },

  sidebar: {
    toolCount: '{count} 个',
    drawerTitle: '按分类浏览',
    openDrawer: '浏览分类',
    closeDrawer: '关闭分类',
  },

  card: {
    open: '打开{name}',
    externalHint: '外部链接',
    pinOn: '收藏{name}',
    pinOff: '取消收藏{name}',
    demoHint: '示例数据，功能尚未实现',
  },

  tags: {
    title: '标签',
    clear: '清除标签筛选',
    toggle: '筛选标签 {tag}',
    active: '已选 {count} 个标签',
    showMore: '还有 {count} 个',
    showLess: '收起标签',
  },

  search: {
    resultCount: '{count} 个工具',
    resultCountFiltered: '{count} / {total} 个工具',
    clear: '清空搜索',
    inCategory: '分类：{name}',
  },

  palette: {
    title: '命令面板',
    placeholder: '搜索工具，或输入命令…',
    empty: '没有匹配项',
    groupTools: '工具',
    groupCategories: '跳转到分类',
    groupActions: '操作',
    groupAccents: '强调色',
    actionToggleTheme: '切换主题',
    actionToggleLocale: '切换语言',
    actionToggleDensity: '切换密度',
    actionShowHelp: '查看快捷键',
    actionAccent: '强调色：{name}',
    actionClearRecent: '清空最近使用',
    actionOpenAbout: '打开「关于本站」',
    hintNavigate: '选择',
    hintOpen: '打开',
    hintNewTab: '新标签页打开',
    hintClose: '关闭',
  },

  shortcuts: {
    title: '键盘快捷键',
    desc: '在输入框内只有 Esc 会被响应，其余快捷键不会抢走你的按键。',
    openPalette: '打开命令面板',
    focusSearch: '打开搜索',
    showHelp: '显示这份快捷键说明',
    closeOverlay: '关闭浮层并把焦点还给触发它的元素',
    openInNewTab: '在新标签页打开选中项',
    moveInGrid: '在卡片网格里移动',
  },

  tool: {
    workspaceTitle: '工具区',
    workspacePlaceholder: '此处放置工具 UI',
    workspaceHint: '把你的实现渲染进这个插槽即可：外壳、面包屑、收藏与工具栏都已就位。',
    inputLabel: '输入',
    outputLabel: '输出',
    inputPlaceholder: '在这里粘贴或输入…',
    outputPlaceholder: '结果会显示在这里',
    demoTitle: '这是示例条目',
    demoBody: '本条目来自 config/tools.ts 中的示例数据，功能尚未实现。改写或删掉那一条即可。',
    categoryLabel: '分类',
    tagsLabel: '标签',
    externalTitle: '这是一个外部链接',
    externalBody: '这个条目不在本站渲染，点下面的按钮会在新标签页打开目标地址。',
    openExternal: '在新标签页打开',
  },

  demo: {
    noticeTitle: '当前是示例数据',
    noticeBody:
      '这 {count} 个工具都是占位示例，用来验证布局与交互。编辑 config/tools.ts 换成你自己的工具即可。',
  },

  preview: {
    stageBadge: '阶段 1 · 视觉预览',
    title: '设计令牌与玻璃基元',
    lead: '这一页只用来核对视觉底座：语义色、玻璃表面、五态控件、对比度与降级行为。工具网格在阶段 2 接入。',
    tokensTitle: '语义色令牌',
    surfacesTitle: '表面层级',
    surfaceGlass: '玻璃面（.glass）',
    surfaceGlassDesc: '正文永远落在这一层上，绝不直接压在渐变光斑上。',
    surfaceInset: '内嵌面（.glass-inset）',
    surfaceInsetDesc: '嵌在玻璃面内部，不叠加第二层模糊，守住两层预算。',
    surfaceSolid: '实色面（card）',
    surfaceSolidDesc: 'prefers-reduced-transparency 生效时，玻璃面降级成这一层。',
    statesTitle: '控件五态',
    stateHover: '悬停',
    stateFocus: '聚焦（Tab 到这里）',
    stateActive: '按下',
    stateDisabled: '禁用',
    stateLoading: '加载中',
    contrastTitle: '对比度自查',
    contrastPair: '组合',
    contrastRatio: '对比度',
    contrastRequired: '要求',
    contrastResult: '结论',
    contrastPass: '通过',
    typeTitle: '排版比例',
    typeSample: '中英文混排 Mixed Script 12345',
    skeletonTitle: '骨架屏',
    skeletonDesc:
      '骨架卡片与真实卡片逐元素同构：同一内边距令牌、同样 48px 图标块、一行标题、两行说明、一行徽标，所以替换时布局不发生位移。',
    a11yTitle: '降级行为',
    a11yTransparency: '减少透明度：玻璃面变实色，模糊与光晕关闭。',
    a11yMotion: '减少动态：光晕停止漂移，只保留 100ms 内的透明度过渡。',
    a11yHint: '在系统设置里打开对应开关后刷新本页即可验证。',
  },

  about: {
    title: '关于本站',
    lead: '一个只在你浏览器里跑的工具站。这一页说清楚它是什么、存了什么、以及你怎么自己验证。',
    whatTitle: '这是什么',
    what: '一个把常用小工具收在一起的入口页：按分组平铺展开，⌘K / Ctrl K 直接搜索，收藏与最近使用固定在最上面一条。工具本身通过配置文件登记，加一个工具只需要往一个数组里加一个对象。',
    privacyTitle: '隐私与数据',
    privacyBody:
      '站点是纯静态文件，没有后端、没有接口、没有埋点、没有第三方脚本。你在工具里输入的内容只在当前页面的内存里参与计算，不会被发送到任何地方，也不会被写进任何日志。',
    storageTitle: '本机存了什么',
    storageTheme: '主题偏好：暗色 / 亮色 / 跟随系统',
    storageLocale: '语言偏好：中文 / English',
    storagePrefs: '密度与强调色偏好',
    storageFavorites: '收藏的工具 id 列表',
    storageRecent: '最近打开的工具 id 列表',
    storageNote:
      '以上全部写在本浏览器的 localStorage 里，键名都以 toolbox. 开头。清除该站点的浏览器数据就会全部消失，不会留下任何服务端副本。',
    networkTitle: '网络请求',
    networkBody:
      '首屏之后不再发起任何请求。字体是自托管的 woff2，背景光晕与噪点都是 CSS 与内联 SVG，没有一张外部图片、没有一次第三方 CDN 调用、没有 Google Fonts。',
    verifyTitle: '怎么自己验证',
    verifyBody:
      '打开浏览器开发者工具的网络面板，勾选「禁用缓存」后刷新：除了本站自己的 HTML、CSS、JS 和那一个字体文件，应该一条外部请求都没有。也可以直接关掉 JavaScript 刷新——页面内容与工具列表依然可读。',
  },

  notFound: {
    code: '404',
    title: '这里没有页面',
    desc: '链接可能已经失效，或者地址打错了一个字符。',
  },
}

export type Dictionary = typeof zh
