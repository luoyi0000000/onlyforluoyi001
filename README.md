# 工具箱 / Toolbox

一个纯前端个人工具站的**外壳**：暗色优先的毛玻璃界面、命令面板、中英双语、暗亮主题、四套强调色，全站静态导出，部署在 Cloudflare Workers Static Assets 上。

数据不出本机：没有后端、没有接口、没有埋点、没有第三方脚本、没有第三方字体请求。只有主题、语言、密度、收藏和最近使用会写进本机 localStorage。

## 当前状态：外壳完成，工具未实现

`config/tools.ts` 里有 12 条显式标了「示例 / DEMO」的占位条目。它们不做任何事，只是让站点看起来、用起来像一个成品。每一条都会打开一个工具页外壳，页面正中写着「此处放置工具 UI」，下面还有一套可直接复用的双栏输入/输出模板（复制、粘贴、下载、清空都是能用的）。

把你自己的工具注册进去、删掉这 12 条，站点就是你的了。

## 快速开始

要求：Node ≥ 20.9，pnpm 11（`packageManager` 已锁定 `pnpm@11.24.0`）。

```bash
pnpm install
pnpm dev              # 开发服务器，直接访问 http://localhost:3000/zh/
pnpm run build        # 产出 out/，这就是要部署的东西
pnpm run serve:out    # 本地静态服务器预览 out/，行为与线上一致
pnpm run test         # 零依赖单测（node:test），见下
pnpm run check        # typecheck + lint + format:check + test
pnpm run audit:external   # 机械验证「零外部请求」，构建后跑
```

根路径 `/` 的语言跳转页是手写的 `public/index.html`，只在导出后的 `out/` 里生效；开发时请直接访问 `/zh/` 或 `/en/`。

`pnpm run test` 用 Node 内置的 `node:test` 直接跑 `tests/*.test.ts`，没有装任何测试框架 —— 这需要 **Node ≥ 22.18**（原生类型剥离）。站点本身构建只要 Node ≥ 20.9；如果你的 Node 是 20.x，`build` 正常，只有 `test` 跑不了。覆盖的是两处「读起来对不代表是对的」的逻辑：快捷键匹配规则（`matchesHotkey`，包括输入框里不抢键、IME 组词期间让键、Alt 一律不触发）和 localStorage 的输入校验（`readStringList`，非数组、超长 id、重复、上限 200、读写抛异常）。

## 加一个工具：只改一个文件

在 `config/tools.ts` 的 `tools` 数组里追加一个对象，别的什么都不用动。卡片、分类分组、侧边栏计数、搜索索引、命令面板、以及 `/<语言>/t/<id>/` 详情页会自动出现。

```ts
{
  id: 'my-tool',                                    // URL 片段 + localStorage 键，定了就别改
  name: { zh: '我的工具', en: 'My Tool' },
  desc: { zh: '一句话说明，约 40 字以内', en: 'One short line' },
  categoryId: 'text',                               // 必须能在 categories 里找到
  icon: 'Wrench',                                   // lib/icons.ts 里注册过的名字
  kind: 'internal',                                 // 站内渲染；'link' 则是外链
  tags: ['demo', 'example'],
  accent: 'indigo',                                 // 图标块渐变，见 types/tool.ts
  pinyin: 'wdgj',                                   // 可选：⌘K 里用拼音首字母也能搜到
}
```

配置在构建时校验（`lib/validate-config.ts`）：id 重复、分类不存在、`link` 缺 `href`、`internal` 多给了 `href`、危险的 URL scheme，都会让 `pnpm run build` 直接失败并指出是哪一条。图标名写错不会崩，会回退成扳手并在构建时提示。

想要真正的工具 UI，两种做法：

1. **用外壳自带的双栏模板**（最快）：新建 `app/[locale]/t/my-tool/page.tsx`，渲染 `<ToolWorkspaceShell>`，把 `<ToolTwoPane transform={fn} />` 放进去 —— `fn` 是一个 `(input: string) => string` 的纯函数，复制/下载/清空/粘贴都已经接好了。然后在配置里给这条加 `route: 't/my-tool'`。
2. **完全自己写**：同上建页面，`<ToolWorkspaceShell>` 的 children 就是你的 UI，外壳只负责标题、面包屑、收藏和留白。

## 换外观与站点信息

- `config/site.ts`：站名、口号、Hero 文案与按钮、页脚链接、默认强调色、功能开关（Hero、命令面板等）。
- `components/slots.tsx`：三个可选 JSX 插槽 `HeroSlot` / `SidebarExtraSlot` / `FooterSlot`。不传内容时不渲染任何 DOM。
- `app/globals.css`：全部设计令牌（oklch）。改主题只改这里的变量：颜色、圆角 8/12/16/24、四级阴影、`--glass-*`、`--glow-*`、字号阶梯、密度。
- 强调色四套（靛蓝/紫罗兰/青/翠绿）由 `<html data-accent>` 一个属性切换，右上角有切换器。

## 键盘

| 键                 | 作用                                |
| ------------------ | ----------------------------------- |
| `⌘K` / `Ctrl+K`    | 打开命令面板                        |
| `/`                | 聚焦搜索框                          |
| `?`                | 快捷键帮助                          |
| `Esc`              | 关闭当前浮层并把焦点还回原处        |
| `↑` `↓`            | 在面板结果间移动                    |
| `Enter` / `⌘Enter` | 打开 / 在新标签页打开               |
| `←` `↑` `→` `↓`    | 在卡片网格里移动（roving tabindex） |

命令面板支持中英文名称、说明、标签的模糊匹配，以及拼音首字母（`sjz` → 时间戳转换）。除 `Esc` 外，快捷键在输入框里不会抢键。

## 部署到 Cloudflare Workers

`wrangler.jsonc` 已经配好：Static Assets、`directory: ./out`、`html_handling: auto-trailing-slash`、`not_found_handling: 404-page`、日志关闭。没有 `main`，也就是**边缘上没有任何脚本在跑**。

```bash
pnpm run deploy       # = pnpm dlx wrangler@4 deploy
```

`out/` 是 git-ignored 的，所以 `wrangler.jsonc` 里挂了 `build.command: "pnpm run build"` —— 部署前 wrangler 自己会先构建。这样无论是本地 `pnpm run deploy`，还是 Cloudflare Workers Builds 那种「clone 仓库 → `pnpm install` → 裸跑 `wrangler deploy`」的流程，都不会因为 `out/` 不存在而失败；接了 Git 自动部署时，控制台的 Build command 留空即可。

注意是 `pnpm run deploy`，不能写成 `pnpm deploy` —— 后者是 pnpm 自己的内置命令（把包部署到目录），不会执行这个脚本。

`wrangler` 故意没有装进 devDependencies：它只在部署时用一次，装进来会给这个仓库加上几十 MB 与几百个传递依赖。`pnpm dlx` 会临时取用。首次部署需要先 `pnpm dlx wrangler@4 login`。想在本地跑一遍边缘行为：`pnpm dlx wrangler@4 dev`。

响应头在 `public/_headers`（会被原样复制进 `out/`），含 CSP、`nosniff`、`no-referrer`、`X-Frame-Options`、`Permissions-Policy`、HSTS，以及静态资源的缓存策略。CSP 里 `script-src` 允许 `'unsafe-inline'`，原因写在文件里：防白闪脚本必须在首次绘制前同步执行，而静态导出没有服务端可以发 nonce。文件里也标了将来哪些指令需要放宽（`media-src`、`worker-src`）。

## 隐私承诺怎么验证

`pnpm run audit:external` 扫描 `out/` 下所有已发布文件，分两遍：

- **Pass A**：浏览器会自动去取的位置（`<link>` / `<script>` / `<img>` / `<iframe>` 的 `src`/`href`、`srcset`、`poster`、`action`、CSS 的 `url()` 与 `@import`、meta refresh）。任何一个指向站外就直接失败。`<a href>` 不算 —— 那是访客自己点的 —— 但每条外链都会打印出来供你核对。
- **Pass B**：已知第三方主机名（字体 CDN、统计、Tag Manager、错误追踪等），出现在任何位置都失败。

其余绝对 URL 会作为「提示」列出并标明来自哪个文件，不藏在白名单里。字体是自托管的 `public/fonts/inter-latin-variable.woff2`，中日韩走系统字体栈。

## 静态导出的硬约束

`next.config.ts` 是 `output: 'export'`。这条约束决定了整个代码库，不要绕过它：

- 不能有 Server Actions、Node runtime 的 Route Handler、ISR/`revalidate`、`next/headers`、`cookies()`、动态 middleware。
- 每个动态路由都必须有 `generateStaticParams`：`/[locale]` 出两种语言，`/[locale]/t/[id]` 出「语言 × 已注册工具」。
- 客户端读不到 `useSearchParams()`，筛选状态是在 effect 里读 `location.search`、用 `history.replaceState` 写回的。
- `images.unoptimized: true`；不允许运行时请求任何第三方 CDN。

## 目录结构

```
app/[locale]/            布局（root layout 在这里，为了 <html lang> 正确）、首页、about、
                         t/[id] 工具页外壳、not-found
components/              业务组件；ui/ 下是手工 vendor 进来的 shadcn 风格基础件
components/ui/glass-card 全站唯一写 backdrop-blur 的地方
config/                  site.ts / tools.ts —— 你要改的就是这两个
dictionaries/            zh.ts 是字典的形状来源，en.ts 少一个键就编译不过
hooks/                   收藏、最近使用、偏好、快捷键
lib/                     搜索索引、图标注册表、i18n、配置校验、工具读模型
public/                  404.html、index.html（语言跳转）、_headers、图标、字体
scripts/                 导出后处理、外部请求审计、本地静态服务器
tests/                   node:test 单测（快捷键匹配、localStorage 校验）
```

## 无障碍与响应式

WCAG 2.1 AA 为红线：正文对比度 ≥ 4.5:1，大字与图标 ≥ 3:1，正文永远不压在渐变光晕上。跳转到主内容、landmark、标题层级、浮层的 `role`/`aria-*`、结果数量的 `aria-live` 播报都在。触摸目标在 `(pointer: coarse)` 下 ≥ 44×44。断点 360/768/1024/1440 对应 1/2/3/4 列。`prefers-reduced-transparency` 下毛玻璃变实心面板，`prefers-reduced-motion` 下只保留 ≤100ms 的透明度过渡。
