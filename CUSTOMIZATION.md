# 自定义指南

这个项目把日常修改集中在少数入口。优先改配置和插槽，只有需要全新交互时才改业务组件；这样升级外壳时最省力。

## 1. 站点信息与首页开关

编辑 `config/site.ts`：

- `name`、`slogan`、`description`：品牌、首页短句和 SEO 描述。
- `brand.logoSrc`：使用 `public/` 下的图片，例如 `/logo.svg`；设为 `null` 使用内置渐变标志。
- `background`：背景图片路径与桌面/移动端裁切位置；设 `imageSrc: null` 可恢复纯色背景。
- `hero`：标题、说明、两个按钮与是否允许折叠。
- `footer.links`：页脚链接；外链加 `external: true`。
- `defaultAccent`：`indigo`、`violet`、`cyan` 或 `emerald`。
- `features`：Hero、命令面板、密度切换和强调色切换的总开关。

首页发现区单独放在 `home`：

```ts
home: {
  showInlineSearch: true,       // 首页直接搜索
  showCategoryNavigation: true, // 分类筛选按钮
  emptySlots: {
    top: 'hidden',              // 'hidden' | 'compact' | 'full'
    middle: 'hidden',
  },
},
```

`hidden` 只隐藏“空”的插槽；一旦插槽返回 JSX，内容始终会显示。开发自定义区时可临时切到 `compact` 或 `full`，方便看到插入位置。

## 2. 添加、隐藏或替换工具

编辑 `config/tools.ts`。新增条目后，首页卡片、分类数量、搜索、命令面板和静态详情页会自动同步。

```ts
{
  id: 'my-tool',
  name: { zh: '我的工具', en: 'My Tool' },
  desc: { zh: '一句清楚的说明', en: 'One clear sentence' },
  categoryId: 'work',
  icon: 'Wrench',
  iconSrc: '/images/my-tool.png', // 可选：使用 public/ 下的自定义卡片图标
  kind: 'internal',
  route: 't/my-tool', // 有自定义页面时填写；使用通用外壳时可省略
  tags: ['work', 'text'],
  accent: 'indigo',
  badge: 'new',       // 'new' | 'beta' | 'wip'
  pinyin: 'wdgj',
  enabled: true,
}
```

- 临时隐藏：设 `enabled: false`，不要删除，方便以后恢复。
- 外部工具：设 `kind: 'link'` 并提供安全的 `https://` 地址 `href`。
- 调整分类：修改文件顶部的 `categories`；`id` 要保持稳定，显示名可自由改。
- 站点目前没有内置示例条目；新增个人页面时直接追加到 `tools` 数组即可。
- 图标名必须注册在 `lib/icons.ts`；非法分类、重复 id 或危险链接会让构建明确失败。

## 3. 五个 JSX 自定义区

编辑 `components/slots.tsx`，不用碰首页布局：

| 插槽          | 位置                | 适合放置                 |
| ------------- | ------------------- | ------------------------ |
| `HeroSlot`    | Hero 文案下方       | 状态、版本、短提示       |
| `HomeTopSlot` | Hero 与工具列表之间 | 公告、统计、快捷入口     |
| `HomeMidSlot` | Top 插槽之后        | 日程、收藏、个人面板     |
| `HomeSlot`    | 工具列表下方        | 长内容、说明、更新记录   |
| `FooterSlot`  | 页脚隐私文案之前    | 备案、额外导航、联系信息 |

插槽会收到当前 `locale`。一个最小双语示例：

```tsx
export function HomeTopSlot({ locale }: SlotProps): ReactNode {
  return (
    <section>
      <h2 className="text-xl font-semibold">{locale === 'zh' ? '我的快捷区' : 'My shortcuts'}</h2>
      <p className="mt-2 text-xs text-muted-foreground">
        {locale === 'zh' ? '这里可以放任意 React 内容。' : 'Any React content can live here.'}
      </p>
    </section>
  )
}
```

`HomeTopSlot` 与 `HomeMidSlot` 已经有外层玻璃面板，通常不要再套一层 `GlassCard`。`HeroSlot`、`HomeSlot` 和 `FooterSlot` 可根据内容自行决定表面样式。

## 4. 文案与语言

- 通用界面文案：`dictionaries/zh.ts` 和 `dictionaries/en.ts`。
- `zh.ts` 定义字典结构，新增键后必须在 `en.ts` 同步补齐。
- 品牌、工具名、工具说明优先放在配置文件的 `{ zh, en }` 字段，不要写死在组件中。

## 5. 视觉令牌

编辑 `app/globals.css` 中的变量，不需要逐个改组件：

- `:root`：亮色主题；`.dark`：暗色主题。
- `[data-accent='…']`：四套全站强调色。
- `--glass-*`：玻璃透明度、边线、模糊和饱和度。
- `--site-background-filter`、`--site-background-scrim`：背景饱和度、亮度与主题遮罩。
- `--d-card-pad`、`--d-gap`、`--d-section`、`--d-card-min`：卡片和页面密度。
- `@theme inline`：圆角、阴影、字号与字体栈。

正文颜色和交互边界已经按可访问性对比度设计。大改颜色后，应同时检查亮/暗主题、键盘焦点和 `prefers-reduced-transparency`。

## 6. 静态与隐私边界

项目使用 Next.js 静态导出，并承诺运行时不请求第三方资源。自定义时保持以下边界：

- 图片、字体和脚本放进 `public/`，不要直接引用 CDN。
- 不加入 Server Actions、运行时 API、cookies、middleware 或依赖服务端的页面。
- 新动态路由必须能在构建时生成全部参数。
- 外链可以作为普通 `<a>`，但不要让页面自动加载外部 iframe、图片或脚本。

## 7. 每次改完的检查

```bash
pnpm run check
pnpm run build
pnpm run audit:external
```

本地查看生产导出：

```bash
pnpm run serve:out
```

然后访问 `http://127.0.0.1:4321/zh/`，至少检查 360、768、1024 和 1440 像素宽度，以及亮色、暗色和键盘操作。
