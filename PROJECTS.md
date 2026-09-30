# PROJECTS —— 项目实施与进度台账

> 本文件是**开发进度台账**，不是站点内容。随着每项推进而更新。
> 站点本身的说明文档在 [README.md](./README.md)（第 14 项完成）。
>
> 文件名沿用你给的名字，按英文习惯补全为 `PROJECTS.md`（原请求写作 `PROGECTS.md`）。
> 如果你要的正是那个拼写，说一声我改名。

---

## 1. 项目定位

**Text-only-blog** —— 纯文字博客。核心诉求：

- 内容以 Markdown 手写，**作者本人亲自写**，仓库不预置任何文章（含测试文章）；
- 面向**阅读优化**：护眼纸质底色、中文排版自动优化、可控阅读宽度/字号/行距、阅读进度与目录；
- 拥有 `wunai-Blog` 的全部写作与渲染能力（双 frontmatter、GFM、公式、五类图表、参考文献、搜索、RSS/PWA）；
- 视觉上是一套「设计图纸 / 蓝图草稿」气质，动效克制、不干扰阅读。

所有需要作者补内容的位置，统一以 **「编辑此处」** 标注。

---

## 2. 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Next.js 16.3（App Router，`output: "export"` 静态导出） |
| UI | React 19.2、Tailwind CSS 4（`@tailwindcss/postcss`）+ 自定义 `app/globals.css` |
| 语言 | TypeScript 5 |
| Markdown | unified / remark（`parse`、`gfm`、`math`、`breaks`）+ rehype（`raw`、`highlight`、`katex`、`slug`、`autolink`、`stringify`） |
| 公式 | KaTeX 0.16 + `katex/contrib/mhchem`（含自定义宏） |
| 检索 | Fuse.js 7（构建期预生成索引，零运行时后端） |
| 图表 | Mermaid、ECharts、Graphviz（`@hpcc-js/wasm-graphviz`）、abc.js、SmilesDrawer —— 全部按需动态加载 |
| 图标 | Iconify（`@iconify/react/offline` + `@iconify/icons-mdi`，离线打包，无运行时请求） |
| 评论 | giscus（GitHub Discussions） |
| 部署 | Cloudflare Pages（wrangler + GitHub Actions） |

形态：**纯静态**。无后端、无数据库、无运行时服务端接口；所有数据在构建期生成。

---

## 3. 目录结构（当前）

```
.
├─ app/
│  ├─ globals.css            样式入口（Tailwind 4 + KaTeX + monokai）
│  ├─ layout.tsx             根布局 / metadata / viewport
│  ├─ page.tsx               根路径语言分流
│  ├─ not-found.tsx          404（导出为 out/404.html）
│  └─ [lang]/
│     ├─ layout.tsx          zh | en 静态参数 + 纠正 <html lang>
│     └─ page.tsx            占位首页（第 9 项替换为八栏吸附）
├─ components/
│  ├─ LangRedirect.tsx       浏览器端语言跳转
│  └─ HtmlLang.tsx           客户端纠正 <html lang>
├─ lib/
│  └─ site.ts                站点配置（第 6 项扩全）
├─ types/
│  └─ iconify.d.ts           icons-mdi 深路径导入兜底声明
├─ .github/workflows/deploy.yml
├─ wrangler.toml
├─ next.config.ts  postcss.config.mjs  tsconfig.json  package.json
├─ .gitignore
└─ PROJECTS.md   ← 本文件
```

规划中（尚未创建）的目录：

```
content/{zh,en}/posts/**        文章；README.md 说明写作规范，加载器会跳过它
content/{zh,en}/pages/*.md      关于等独立页面
public/                         头像、favicon、manifest、sw.js、搜索索引、RSS
scripts/*.mjs                   构建期产物生成（搜索索引 / RSS / 更新日志）
```

---

## 4. 进度清单（14 项）

图例：`[x]` 已完成 · `[~]` 进行中 · `[ ]` 未开始

| # | 项目 | 状态 | 交付物 |
| --- | --- | --- | --- |
| 1 | 脚手架 | `[x]` | Next 16.3 静态导出、React 19.2、Tailwind 4、TS 5、wrangler + GitHub Actions |
| 2 | 内容管线 | `[~]` | YAML(`---`) / TOML(`+++`) 双 frontmatter、卡组、references、AI/draft/pinned（进行中） |
| 3 | Markdown 渲染 | `[ ]` | GFM、highlight.js(monokai)、KaTeX + mhchem + 自定义宏、五类图表、`[reference:N]` 角标 |
| 4 | 中文排版优化 | `[ ]` | CJK 与半角间自动加空格、中文标点转换（自动跳过代码/公式/链接） |
| 5 | 构建产物 | `[ ]` | 搜索索引、RSS、sitemap、robots、PWA(sw + 离线页)、更新日志 |
| 6 | 设计系统 | `[ ]` | 护眼纸质底色、蓝图草图背景层、亮/暗/纸三套令牌 |
| 7 | 框架 UI | `[ ]` | 顶栏（对齐 wunai-blog）、Footer（左下角设置图标）、设置中心 |
| 8 | 装饰与动效 | `[ ]` | 全站低干扰图形，随路由切换而变化 |
| 9 | 首页 | `[ ]` | 八栏吸附固定 + 侧边指示器（含顺序优化与并排排版） |
| 10 | 列表页 | `[ ]` | 搜索、筛选（标签/时间/分类）、语言切换、密度切换、AI 筛选默认开启 |
| 11 | 文章卡片 | `[ ]` | 紧凑 / 适中 / 内容 三档 |
| 12 | 文章页 | `[ ]` | 悬浮 TOC（含上下篇）、右侧细进度条带百分比、圆形回顶、giscus 评论 |
| 13 | 其余页面 | `[ ]` | 关于/友链/标签/分类/归档/搜索/设置/404/离线 |
| 14 | 交付 | `[ ]` | README + 编辑指南、git 提交推送 |

### 1. 脚手架 —— 已完成 ✅

- `next.config.ts`：`output: "export"`、`trailingSlash: true`、`images.unoptimized`。
  静态导出下不可用 rewrites / redirects / 服务端图片优化，故根路径语言分流放在浏览器端（`components/LangRedirect.tsx`），并保留 `<a>` 兜底。
- `app/globals.css`：Tailwind 4 用 `@import "tailwindcss"` + CSS 变量（`@theme`）配置，不生成 `tailwind.config.js`；一并引入 KaTeX 样式与 monokai 代码高亮主题。
- 依赖版本策略：`next 16.3.1` / `react 19.2.8` 与 `wunai-Blog` 对齐；其余用宽松主版本区间（`^11`、`^5` 等），避免锁到不存在的版本号导致安装失败。`overrides` 把 katex 钉在 `^0.16`。
- 图表库（mermaid / echarts / graphviz / abcjs / smiles-drawer）**不进入首屏包**，只在文章真的出现对应代码块时动态 `import`，为此保留了 PWA 离线可用性。
- 图标走 `@iconify/react/offline` + `@iconify/icons-mdi`，构建期打包，运行时不发请求。

### 2. 内容管线 —— 进行中 🚧

计划交付：

- `lib/toml.ts`：自写 TOML 解析器（frontmatter 子集：字符串/多行串/整数/浮点/布尔/数组/内联表/表/表数组/日期），避免为 `+++` 引入额外依赖。
- `lib/frontmatter.ts`：自动识别 `---`（YAML）与 `+++`（TOML），统一归一化。TOML 日期会被转成字符串，保证两种格式得到同一个 `date` 语义。
- `lib/content.ts`：扫描 `content/<lang>/posts/**`，识别卡组（`_index.md`）、`references`、`pinned` / `draft` / `about` / `hiddenInHomeList`、`isAI`（AI 标记）、字数统计、缩略图推断；**跳过 `README.md`**；**零文章也能正常构建**（所有列表页渲染空状态）。
- `content/README.md`：写作规范（目录约定、frontmatter 两种写法示例、图表代码块语言名、参考文献角标语法、如何标 AI）。

---

## 5. 约定与规则（重要）

1. **仓库不含任何文章。** `content/**/posts/` 只放 `README.md`（写作规范），加载器显式跳过该文件名；不写测试文章、不写示例文章。
2. **需要作者补内容的地方统一标「编辑此处」**，包括：站点标语/描述、首页各栏文案、关于页、友链、演示段落、头像与 favicon 资源位。
3. **UI 文案不算文章**，由 `lib/site.ts` 的 i18n 表统一维护（中英各一份，缺一边会出现 `undefined`）。
4. 零文章、零配置时站点必须仍能构建与浏览，所有页面要有空状态。
5. 动效一律尊重 `prefers-reduced-motion`，且背景/装饰层不得影响正文可读性（`aria-hidden`、`pointer-events: none`）。

---

## 6. 本地命令

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器，访问 / 会自动分流到 /zh/
npm run build        # 生产构建（prebuild 生成搜索索引 / RSS / 更新日志）
npm run preview      # 本地预览 out/ 静态产物
npm run deploy       # wrangler 部署到 Cloudflare Pages
```

> ⚠️ 当前 `npm run build` **尚不可用**：`prebuild` 指向 `scripts/*.mjs`，属于第 5 项内容。
> 第 5 项完成前请用 `npm run dev`，或在第 5 项落地后统一验证构建。

---

## 7. 部署

- 平台：Cloudflare Pages，产物目录 `out/`（见 `wrangler.toml`）。
- CI：`.github/workflows/deploy.yml`，push 到 `main` 触发；`fetch-depth: 0` 是必须的（首页「更新日志」栏读 `git log` 生成 `changelog.json`，浅克隆记录会不全）。
- 需要在仓库 Secrets 配置：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。
- `wrangler.toml` 里的 `name`、workflow 里的 `--project-name` 均为 `text-only-blog`，改名请同步两处。

---

## 8. 验证状态说明（如实）

构建期脚本与依赖均在**无 shell 环境**下书写，未在本机执行 `npm install` / `npm run build` / 测试。
因此：

- 已完成的代码属于「写完即交付」，实际编译与运行结果以你本地执行为准；
- 有报错直接把日志贴给我，我按证据修；
- 每次交付后本文件的进度表与「已完成 / 进行中」小节会同步更新。

---

## 9. 变更记录（台账自身）

| 日期 | 变更 |
| --- | --- |
| 本次提交 | 建立台账；第 1 项脚手架完成；第 2 项内容管线开工 |
