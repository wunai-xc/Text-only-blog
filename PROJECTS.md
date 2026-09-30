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
| 部署 | Cloudflare Workers 静态资源（wrangler + GitHub Actions） |

形态：**纯静态**。无后端、无数据库、无运行时服务端接口；所有数据在构建期生成。

---

## 3. 目录结构（当前）

```
.
├─ app/
│  ├─ globals.css            样式入口（第 6 项：三套令牌 + 蓝图背景层 + 正文与原子件；第 8 项：图案随路由变；颜色唯一事实来源）
│  ├─ layout.tsx             根布局 / metadata / viewport
│  ├─ page.tsx               根路径语言分流
│  ├─ not-found.tsx          404（导出为 out/404.html）
│  └─ [lang]/
│     ├─ layout.tsx          zh | en 静态参数 + 纠正 <html lang> + 全站框架（第 7 项的顶栏/页脚）
│     ├─ page.tsx            首页（第 9 项：八栏吸附，版面与文案在 lib/home.ts）+ 开发态渲染自检
│     └─ posts/page.tsx      文章列表页（第 10 项：构建期取数据；筛选 / 搜索 / 密度在 lib/list.ts + components/list）
├─ components/
│  ├─ ArticleBody.tsx        正文容器：注入 HTML 并按需动态加载五类图表
│  ├─ charts/
│  │  ├─ mermaid.ts          Mermaid 渲染器（只在有图表时才进包）
│  │  ├─ echarts.ts          ECharts（代码块是 JSON option）
│  │  ├─ graphviz.ts         Graphviz（@hpcc-js/wasm-graphviz）
│  │  ├─ abc.ts              五线谱（abcjs）
│  │  └─ smiles.ts           化学结构式（SmilesDrawer）
│  ├─ dev/PipelineCheck.tsx  开发态渲染自检（生产构建里不出现，可删）
│  ├─ LangRedirect.tsx       浏览器端语言跳转
│  ├─ HtmlLang.tsx           客户端纠正 <html lang>
│  ├─ BlueprintBackground.tsx 蓝图草图背景层（第 6 项建立，第 8 项接上路由：路径 → data-decor + 右下角图签）
│  ├─ ThemeInit.tsx          首帧主题脚本（第 6 项；body 第一个元素，避免暗色读者看到闪白）
│  ├─ PrefsInit.tsx          首帧阅读偏好脚本（第 7 项；body 第二个元素，避免版面跳动）
│  ├─ ThemeSync.tsx          跟随系统深浅色变化（第 6 项；只在「跟随系统」时重新解析）
│  ├─ SiteHeader.tsx         顶栏（第 7 项；品牌 / 导航 / 图签三段，服务端组件，构建期读内容统计）
│  ├─ SiteFooter.tsx         页脚（第 7 项；联系方式 + 版权 + 左下角设置入口）
│  ├─ RouteLink.tsx          「按落地状态渲染」的站内链接（第 7 项；pending 渲染成不可点）
│  ├─ ThemeSwitcher.tsx      顶栏外观按钮（第 7 项；四态循环，落点是 lib/theme.ts）
│  ├─ LangSwitcher.tsx       语言切换（第 7 项；顶栏图签区与设置中心共用）
│  ├─ SettingsDock.tsx       左下角齿轮 + 设置抽屉（第 7 项；Esc/遮罩关闭、锁滚动）
│  ├─ SettingsCenter.tsx     设置中心内容（第 7 项；抽屉用，第 13 项的 /settings/ 页也能直接放）
│  ├─ home/
│  │  ├─ HomeBlockHead.tsx   栏头（栏号 + 一句小字 + 栏名；八栏共用，栏号由版面表推出）
│  │  ├─ HomeIntro.tsx       第 1 栏 本站介绍（站名 / 自述 / 三个入口，RSS 是唯一现在可点的）
│  │  ├─ HomePostCards.tsx   第 2 栏 文章卡片（第 11 项起用共用的 PostCard「适中档」）
│  │  ├─ HomeStats.tsx       第 3 栏 数据统计（字数 / 累计阅读 / 首末发布 / 构建日期）
│  │  ├─ HomeChangelog.tsx   第 4 栏 更新日志（构建期读 git log，最多 5 条，有空状态）
│  │  ├─ HomeInventory.tsx   第 5 栏 站内内容（文章 / 专题 / 标签 / 题材 / 语言）
│  │  ├─ HomeReading.tsx     第 6 栏 阅读改善（当场跑一遍 lib/typography.ts 的排版函数）
│  │  ├─ HomeThemes.tsx      第 7 栏 外观切换（客户端；与设置中心同一套 API 与样式）
│  │  ├─ HomeFonts.tsx       第 8 栏 字体设置（客户端；只写 --reading-* 三个令牌）
│  │  └─ HomeIndex.tsx       侧边指示器（客户端；IntersectionObserver 高亮，锚点可无 JS 使用）
│  ├─ list/
│  │  ├─ PostCard.tsx        文章卡片（第 11 项：紧凑 / 适中 / 内容 三档；首页与列表页共用）
│  │  └─ PostList.tsx        列表页本体（第 10 项，客户端：搜索 / 筛选 / 密度 / 地址栏状态）
│  └─ ServiceWorkerRegistrar.tsx  注册 /sw.js（生产构建才注册，dev 下只清旧 SW）
├─ content/
│  ├─ README.md              写作规范
│  └─ {zh,en}/posts/README.md 各语言的目录提示（加载器跳过 README.md）
├─ lib/
│  ├─ site.ts                站点配置（第 7 项扩全：路由表 ROUTES + 落地状态、顶栏导航、联系方式、i18n 文案表）
│  ├─ icons.ts               用到的 MDI 图标（第 7 项；本地打包的图标数据，运行时不发请求）
│  ├─ prefs.ts               阅读偏好（第 7 项：宽度/字号/行距三档，写 --reading-* 令牌 + 首帧脚本）
│  ├─ decor.ts               装饰层（第 8 项：路径 → 图纸编号 + 图案名 + 图签文字，零依赖）
│  ├─ home.ts                首页版面与文案（第 9 项：八栏顺序 / 并排 / 栏号 / 中英文案）
│  ├─ list.ts                列表页（第 10/11 项：筛选状态 / 三档密度 / 纯函数 / 地址栏读写 / 中英文案，零依赖）
│  ├─ toml.ts                自写 TOML 解析器（`+++` frontmatter 用）
│  ├─ frontmatter.ts         双格式识别与字段归一化
│  ├─ content.ts             内容加载 / 查询 API（只读盘，不渲染）
│  ├─ charts.ts              图表语言名登记表（服务端与浏览器共用，零依赖）
│  ├─ typography.ts          中文排版优化（第 4 项，纯字符串函数 + remark 插件，零依赖）
│  ├─ theme.ts               主题与设计令牌（第 6 项：三套外观、首帧脚本、运行时读写、令牌读取）
│  ├─ markdown.ts            Markdown → HTML 管线（第 3 项）
│  ├─ search-index.ts        搜索索引条目构建（第 5 项，Fuse.js 字段约定在这里）
│  ├─ feeds.ts               RSS 2.0 生成（第 5 项）
│  └─ changelog.ts           构建期读 git log 生成更新日志（第 5 项，无 git 时降级为空）
├─ types/
│  └─ iconify.d.ts           icons-mdi 深路径导入兜底声明
├─ .github/workflows/deploy.yml
├─ wrangler.toml
├─ next.config.ts  postcss.config.mjs  tsconfig.json  package.json
├─ .gitignore
└─ PROJECTS.md   ← 本文件
```

第 5 项新增的产物路由（都在构建期生成纯静态文件，见第 4 节第 5 项）：

```
app/feed.xml/route.ts           /feed.xml          默认语言的 RSS
app/[lang]/feed.xml/route.ts    /zh/feed.xml 等    每语言 RSS
app/search-index.json/route.ts  /search-index.json 搜索索引
app/changelog.json/route.ts     /changelog.json    更新日志
app/sitemap.ts                  /sitemap.xml
app/robots.ts                   /robots.txt
app/manifest.ts                 /manifest.webmanifest
app/offline/page.tsx            /offline/          离线兜底页（被 sw.js 预缓存）
public/sw.js                    /sw.js             Service Worker
public/favicon.svg              /favicon.svg       站点图标（favicon + manifest 图标）
```

规划中（尚未创建）的目录：

```
content/{zh,en}/pages/*.md      关于等独立页面
public/thumbnails/、public/covers/  文章缩略图（可选）
public/icon-192.png 等          PNG 图标（可选，见第 4 节第 5 项「PWA」）
```

---

## 4. 进度清单（14 项）

图例：`[x]` 已完成 · `[~]` 进行中 · `[ ]` 未开始

| # | 项目 | 状态 | 交付物 |
| --- | --- | --- | --- |
| 1 | 脚手架 | `[x]` | Next 16.3 静态导出、React 19.2、Tailwind 4、TS 5、wrangler + GitHub Actions |
| 2 | 内容管线 | `[x]` | YAML(`---`) / TOML(`+++`) 双 frontmatter、卡组、references、AI/draft/pinned |
| 3 | Markdown 渲染 | `[x]` | GFM、highlight.js(monokai)、KaTeX + mhchem + 自定义宏、五类图表、`[reference:N]` 角标 |
| 4 | 中文排版优化 | `[x]` | `lib/typography.ts`：中英之间补空格、半角标点/成对括号转全角、`...`→`……`，代码/公式/链接地址自动跳过；四条规则可单独开关 |
| 5 | 构建产物 | `[x]` | 搜索索引 `/search-index.json`、RSS（`/feed.xml` + 每语言）、sitemap、robots、PWA（`sw.js` + 离线页 + manifest + 图标）、更新日志 `/changelog.json`；全部在 `next build` 里生成 |
| 6 | 设计系统 | `[x]` | 护眼纸质底色、蓝图草图背景层、亮/暗/纸三套令牌（`lib/theme.ts` + `app/globals.css`） |
| 7 | 框架 UI | `[x]` | 顶栏（对齐 wunai-blog）、Footer（左下角设置图标）、设置中心 |
| 8 | 装饰与动效 | `[x]` | `lib/decor.ts`：路径 → 图纸（图案 / 编号 / 图签），图案全在 CSS 里；换页纸面重铺一次 + 顶栏光标闪烁 |
| 9 | 首页 | `[x]` | `lib/home.ts`：八栏顺序 / 并排 / 栏号 / 文案；吸附用原生 scroll-snap，侧边指示器是锚点 + IntersectionObserver |
| 10 | 列表页 | `[x]` | `app/[lang]/posts/` + `lib/list.ts`：搜索（懒读 `/search-index.json`）、筛选（标签/分类/年份/排序）、语言切换、密度切换、AI 默认隐藏 |
| 11 | 文章卡片 | `[x]` | `components/list/PostCard.tsx`：紧凑 / 适中 / 内容 三档；首页第 2 栏与列表页共用同一个组件 |
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

### 2. 内容管线 —— 已完成 ✅

- `lib/toml.ts`：自写 TOML 解析器（frontmatter 子集：字符串 / 多行串 / 整数 / 浮点 / 布尔 / 数组 / 内联表 / 表 / 表数组 / 日期），
  支持 `\uXXXX` 转义与十六进制 / 八进制 / 二进制字面量，报错带**行号列号**；只为实现 `+++` 单独装一个包不划算。
- `lib/frontmatter.ts`：开头 `---` 走 YAML（gray-matter → js-yaml），`+++` 走自写 TOML，都没有就当无 frontmatter。
  归一化层把两种写法揉成同一份语义：日期统一 ISO 字符串、`tags` 数组/分隔字符串都吃、
  布尔容忍 `"true"` / `1` / `"是"`、缩略图别名（`thumbnail` / `image` / `banner`）等。
- `lib/content.ts`：只读盘不渲染。扫描 `content/<lang>/posts/**`，识别卡组（`_index.md` + 无 `_index.md` 的目录）、
  `references`、`pinned` / `draft` / `about` / `hiddenInHomeList` / `isAI`、字数与阅读时长（中日韩按字、西文按词）、
  缩略图三级推断（frontmatter → `public/thumbnails|covers` → 正文第一张图）；**跳过 `README.md` 与下划线开头的文件**；
  `目录/index.md` 代表目录本身；slug 冲突直接抛错；`draft` 只在非生产环境出现。
- `content/README.md` + `content/{zh,en}/posts/README.md`：写作规范（目录约定、两种 frontmatter 示例、字段表、
  日期口径、卡组、参考文献、缩略图、图表语言名、常见报错）。
- **零文章可构建**：目录不存在、一篇没有、`public/` 不存在，查询一律返回空数组 / `null`，不抛错；
  首页顺手读一次 `getContentStats()` 当作管线探针。

### 3. Markdown 渲染 —— 已完成 ✅

- `lib/markdown.ts` 一条 unified 管线（全部在构建期跑，客户端只收 HTML 字符串）：
  `remark-parse → gfm → breaks → math → 图表块 → 引用角标 → remark-rehype → rehype-raw → slug →
  目录收集 → autolink-headings → katex → highlight → stringify`。
- 公式：KaTeX + `katex/contrib/mhchem`（`\ce` / `\pu`）+ `KATEX_MACROS` 自定义宏（`\RR`、`\dd`、`\abs`、`\E`…）。
  写错公式时把错误画在原文位置并着色，而不是让整站构建失败 —— 这件事由 `rehype-katex`
  自己保证（它先用 `throwOnError: true` 试、失败记一条 vfile message、再用 `throwOnError: false`
  重画）；**传 `throwOnError` 反而会类型报错**（该字段被 `Omit` 掉了），见「构建修复」一节。
  `trust: false`：不允许 `\href` 之类发请求。
- 代码高亮：highlight.js + monokai（主题在 `app/globals.css` 里 `@import`），未知语言不报错。
- 五类图表：`lib/charts.ts` 是语言名登记表，构建期把 ```` ```mermaid ```` 之类的代码块换成占位 `<figure>`
  （`data-chart` + 隐藏的源码 `<pre class="chart-source">`），客户端 `components/ArticleBody.tsx` 见到才
  **动态 import** 对应渲染器（`components/charts/*.ts`）：mermaid / echarts / graphviz(wasm) / abcjs / smiles-drawer。
  文章里没有图表时，这五个库一个字节都不进客户端包。渲染失败在原位显示红色报错并打到 console。
- 参考文献：正文 `[reference:N]` → 角标链接（`#reference-<slug>`），文末 `renderReferenceList()` 出参考列表。
  排序规则是「纯数字 id 升序在前，其余按书写顺序」，角标数字与列表序号同源；
  id 找不到时渲染成红色 `cite-missing` 并记一条 warning（不中断构建），且给出「首次引用」才有的返回锚点。
- 目录：`rehype-slug` 生成的 id 直接复用（不再自己造 slug），返回**嵌套** `toc` 与 `flattenToc()`；
  标题末尾的 `#` 锚点由 `rehype-autolink-headings` 追加。
- 开发态自检：`components/dev/PipelineCheck.tsx` 内置一段样例（GFM / 公式 / 五类图表 / 角标 / 目录统计），
  只有 `next dev` 的首页会挂它，生产构建里不渲染、也不进产物；确认第 12 项（文章页）之后可以直接删掉这个文件。

### 4. 中文排版优化 —— 已完成 ✅

- `lib/typography.ts`：**零依赖**（不 import 任何包），纯字符串函数 + 一个 remark 插件。
  四条规则，都能单独关掉：
  1. **空隙**：汉字/假名/谚文 与**半角**字母数字紧挨着时补一个空格（`中文English` → `中文 English`、
     `2024年` → `2024 年`）。补的是普通空格 U+0020（与 pangu.js 一致，不用窄空格 —— 免得
     「看起来有空格却选不中」）；两边本来就有空白的不动，尊重作者自己排的版。
  2. **标点**：**前一个字符是中文语境**时，半角 `, . ; : ! ?` 转 `，。；：！？`。
  3. **省略号**：中文语境的 `...` 转 `……`，整串点一次吃掉（`....` 也只出一个）。
  4. **括号**（跟随第 2 条的开关）：半角括号**必须成对**且有一侧贴着中文语境才换
     （`中文(test)` → `中文（test）`；`f(x)` 不动）。用栈配对，落单的括号一律不碰 ——
     换半个会得到 `中文（test）` 这种错配。
- **防误伤是这块的主要工作量**，靠的是两条：
  - 只处理 mdast 的 `text` 节点 —— 代码块/行内代码/公式/链接地址/内联 HTML 的字符串分别在
    `code` / `inlineCode` / `math` / `inlineMath` / `html` 节点或属性里，天生不在处理范围内；
  - 标点规则只看「前一个字符是不是中文」，于是 `1,000`、`3.14`、`v1.2.3`、`example.com`、
    `a.ts`、`http://` 全部自动免疫（又对 `.` 补了「后面跟字母数字或 `/` 就不换」的兜底）。
  - 引号（半角 `"` `'`）**刻意不转**：英文引号与代码里的引号误伤率太高，中文引号请直接写 `“ ”`。
  - 已知不处理：跨节点的相邻（`**中文**English`）看起来没关系，需要作者自己补一个空格。
- 接入 `lib/markdown.ts`：排在 `remarkMath` 之后、`remarkCitations` 之前。
  角标语法不会被碰坏是**推演出来的**而不是碰巧：`[reference:1]` 里 `:` 的左边是字母 `e`，
  规则 2 要求左边是中文语境；`[` 左边虽是中文，但规则 1 只认「中文↔字母数字」。
- 开关：`renderMarkdown(body, { typography: false | { spacing, punctuation, parentheses } })`；
  返回值多了 `typography: { texts, spaces, punctuation, parentheses, ellipses }`，供构建日志与自检显示。
  frontmatter 的 `typography` 字段接到这里属于第 12 项（文章页）的活，规范已在
  `content/README.md` 第 9 节写明。
- 自检：`components/dev/PipelineCheck.tsx` 新增两段样例 —— 一段故意写得很糙的中英混排
  （应当被收拾干净），一段是对照组（`typography: false`，应当原样输出），并在页面上打印改动计数。

### 5. 构建产物 —— 已完成 ✅

**先记一个方案变更（重要）**：原计划是 `scripts/*.mjs` + `prebuild` 生成搜索索引 / RSS / 更新日志。
实际动手时发现那样必须**把 frontmatter 解析与内容扫描在 .mjs 里再写一遍**（Node 跑不了 `.ts`，
除非加 `tsx` 之类的运行时依赖，而 `lib/content.ts` 又只认 node:fs）——两份实现必然漂移。
于是改成：**全部在 `next build` 里生成**，产物路径交给 Next 自己的约定。
依据是 Next 官方文档里的两句话（Static Exports 页）：Route Handler 在 `next build` 时渲染静态响应、
只支持 GET、**必须显式标 `export const dynamic = "force-static"`**；且 `sitemap.xml` / `robots.txt` /
`manifest.json` 这些元数据文件「有内建支持」。所以：

| 产物 | 文件 | 公开地址 |
| --- | --- | --- |
| RSS（默认语言） | `app/feed.xml/route.ts` | `/feed.xml` |
| RSS（每语言） | `app/[lang]/feed.xml/route.ts`（配 `generateStaticParams` + `dynamicParams = false`） | `/zh/feed.xml`、`/en/feed.xml` |
| 搜索索引 | `app/search-index.json/route.ts` | `/search-index.json` |
| 更新日志 | `app/changelog.json/route.ts` | `/changelog.json` |
| sitemap | `app/sitemap.ts` | `/sitemap.xml` |
| robots | `app/robots.ts` | `/robots.txt` |
| manifest | `app/manifest.ts` | `/manifest.webmanifest` |

- `package.json` 里**删掉了 `prebuild` / `predev`**：它们指向的 `scripts/*.mjs` 从来没创建过，
  也就是说这两个钩子一直在让 `npm run build` / `npm run dev` 直接失败（台账旧版里那句
  「build 尚不可用」说的就是它）。现在 dev / build 都能跑，产物在构建期生成。
- **搜索索引**（`lib/search-index.ts`）：每篇一条 `SearchDoc`，字段
  `lang / slug / href / title / description / excerpt / body / tags / categories / group /
  date / updated / pinned / isAI / words / readingMinutes / cover`；
  `fields` 数组（`SEARCH_FIELDS`）与 `version` 一起写进索引，列表页（第 10 项）直接照它配 Fuse.js，
  别在页面里写死字段名。全文检索有意义，所以正文也进索引，但每篇只取前
  `SEARCH_BODY_LIMIT = 1200` 个字符（去 Markdown 标记之后），避免索引膨胀到几百 KB 拖累离线预缓存；
  想改这个折中只改一个常量。**索引格式变了就 +1 `SEARCH_INDEX_VERSION`**。
- **RSS**（`lib/feeds.ts`）：RSS 2.0（不做 Atom / JSON Feed），`atom:link rel="self"` 自指，
  `pubDate` 用 RFC 822、`lastBuildDate` 取最新一篇文章的时间；每条只给**摘要 + 链接**，不带全文
  （全文要把每篇都渲染一遍，与「让人来站点读书」相反）；标签进 `<category>`；
  控制字符会被清掉（XML 1.0 不允许，留着会让阅读器整份订阅报错）。
  最多 `FEED_LIMIT = 30` 条，零文章时输出合法的空 channel。
- **更新日志**（`lib/changelog.ts`）：`git log --no-merges --date=short`，字段用 ASCII 的
  Unit Separator 分隔（正文里不可能出现，不会和 `|` 撞车）；结果按 `includeMerges` 缓存两份，
  首页栏与 JSON 路由不会各跑一次 git。**拿不到 git 时返回空数组 + 一条 console.warn，绝不让构建失败**
  （产物目录、tarball 解压、机器没装 git 都属于这种情况）。CI 里依旧需要 `fetch-depth: 0`。
- **sitemap**：`/`、`/{zh,en}/` 与文章页；语言之间用 `alternates.languages` 配 hreflang
  （文章按 slug 跨语言配对，另给 `x-default`）。
  ⚠️ 文章 URL 依赖第 12 项的文章页 —— 落地前它们会 404，这条记进了第 12 项的待办。
  第 10 / 13 项新增页面（标签、归档、关于、搜索）时，在 `pageRoutes()` 里补一行。
- **robots**：只禁止三类非内容路径 —— `/offline/`、`/search-index.json`、`/changelog.json`；
  正文与归档一律允许；附带 `sitemap` 与 `host`。
- **PWA**：
  - `app/manifest.ts` 生成 `/manifest.webmanifest`（`app/layout.tsx` 早就指着这个地址）；
    `start_url` 是默认语言首页，`display: standalone`，配色取 `THEME_CHROME.paper`
    （「纸」的底色 `#f1ece0`，与 `globals.css` 的 `--c-canvas` 同值 —— 第 6 项把原先写死的
    `#f4f1e8` 换成了令牌；manifest 是构建期产物，只能挑一套，挑的就是「没有 JS 时的默认」）。
  - `public/sw.js`（**不打包**，浏览器直接跑，所以是普通 JS、不能 import）：
    install 预缓存外壳（`/`、`/zh/`、`/en/`、`/offline/`、manifest、favicon，逐条 try/catch，
    单条失败不影响整体）；**第 10 项把 `/zh/posts/` 与 `/en/posts/` 也加进了这份清单**
    （列表页是「翻目录」的入口，第一次访问就带走，之后离线也能挑文章），
    `CACHE_VERSION` 随之从 1 加到 **2**；而 `/search-index.json` **故意不进清单** ——
    它随文章数增长（每篇正文前 1200 字），装 PWA 就替读者拉一份可能几百 KB 的 JSON 不划算；
    搜索过一次之后它自然会进缓存，离线搜索随后也能用；
    activate 清掉旧版本缓存并 `clients.claim()`；
    fetch 策略分两类 —— 导航请求**网络优先**（失败 → 该地址缓存 → 离线页），
    同源静态资源**缓存优先 + 后台更新**（`/_next/*` 等要么带内容哈希、要么可再生）。
    跨源、非 GET、Range 请求一律不插手。改了策略或外壳清单就 +1 `CACHE_VERSION`。
  - `app/offline/page.tsx`（`/offline/`）：纯静态、零联网依赖，列出几个「已缓存、断网也能打开」的入口；
    `metadata.robots = noindex`，同时被 robots.txt 排除（双保险）。
  - `components/ServiceWorkerRegistrar.tsx`：挂在根布局，**只在生产构建注册**；
    `next dev` 下反向注销已有的 SW（否则热更新会被旧缓存糊住，是这类站点的经典坑）。
  - `public/favicon.svg`：「设计图纸」风格（图框 + 三行字），内联 `prefers-color-scheme`
    让亮/暗主题各一套颜色；它同时是 favicon 与 manifest 的图标。
  - **编辑此处**：PNG 图标（192 / 512）还没做 —— 本仓库生成不了二进制图片。
    想「加到主屏幕」更稳，就把 PNG 放进 `public/`，再到 `app/manifest.ts` 的 `icons` 里补两条。
- 订阅源自动发现：`app/layout.tsx` 的 `metadata.alternates.types` 里登记了两个语言的 RSS，
  浏览器 / 阅读器不用手输地址。**注意**：Next 的 metadata 是浅合并 ——
  文章页（第 12 项）如果自己写了 `alternates`，这条 `types` 会被整体覆盖掉，要在文章页里补回来。

### 6. 设计系统 —— 已完成 ✅

**颜色只有一份定义**：`app/globals.css` 里三套块（`:root` = 纸，`[data-theme="light"]`，`[data-theme="dark"]`）。
`lib/theme.ts` 只镜像三套主题的**底色**（`THEME_CHROME`，给 manifest 与 `meta theme-color` 用，
因为构建期读不到浏览器里的 CSS 变量），其余一律走变量。

| 外观 | 定位 | 底色 | 重点色 |
| --- | --- | --- | --- |
| **纸 paper**（默认） | 护眼暖白纸质，长文阅读用 | `#f1ece0` | 暖褐 `#8a6a3b` |
| 亮 light | 冷白，「屏幕上的文档」感 | `#f4f6f6` | 蓝图青 `#1d4f63` |
| 暗 dark | 夜间 | `#0e1416` | 亮青 `#7fc3da` |

- **令牌分组**（面/字/线/重点/蓝图层这五组都在三套块里同名出现，换外观只是换变量值）：
  - 面：`--c-canvas`（页面底）、`--c-surface`（面板/卡片）、`--c-surface-2`（表头、行内代码）；
  - 字：`--c-ink`、`--c-ink-muted`、`--c-ink-subtle`；
  - 线：`--c-rule`、`--c-rule-strong`；
  - 重点：`--c-accent`、`--c-accent-soft`、`--c-accent-ink`（accent 实底上的反白字）、`--c-danger`、`--c-mark`（选区）；
  - 蓝图层：`--bp-line`、`--bp-line-strong`、`--bp-frame`、`--bp-grid`（24px）、`--bp-grid-major`（120px）。
  另有一组三套共用的（写在第二个 `:root` 里）：形状 `--shape-radius` / `--shape-radius-lg` /
  `--shape-shadow`（**故意加 `shape-` 前缀**：Tailwind 自己的 theme 里有 `--radius*` / `--shadow*`，
  同名会把 `rounded-lg` 这类工具类的取值改坏），
  以及**阅读度量** `--reading-measure` / `--reading-size` / `--reading-leading`
  —— 正文的宽 / 字号 / 行距已经全部改成读这三个（第 7 项的设置中心只要改它们的值，第 12 项的文章页直接受益）。
- **怎么流到页面**：`@theme inline` 把 `--c-*` 映射成 Tailwind 的语义色工具类，
  页面里写 `text-ink-muted`、`bg-surface`、`border-rule`、`text-accent`。
  **不要写 `dark:` 变体**：外观有三套，两态变体表达不了；而且令牌一换，已经渲染的 class 立刻跟着变。
- **分层**：自定义样式都写进 `@layer base`（基础层）与 `@layer components`（蓝图、原子件、正文），
  因为 Tailwind 4 的 `index.css` 第一行就声明了 `@layer theme, base, components, utilities;`
  —— 放在层里的规则**能被工具类覆盖**（`<main class="page px-6">` 里的 `px-6` 会生效）。
  不写 layer 的自定义 CSS 反而会盖住一切工具类，那种坑很难查。只有打印样式故意留在层外。
- **切主题的落点只有一个**：`<html data-theme="paper|light|dark">`（外加 `data-theme-choice` 记录读者的选择，
  给设置中心回显用）。三处配合：
  1. `components/ThemeInit.tsx`：把 `THEME_INIT_SCRIPT` 内联成 **body 的第一个元素**。必须在 React 水合之前跑完，
     否则选了暗色的读者会看到一帧白底（FOUC）；React 不会水合这个 `<script>`，它只是原样躺在 HTML 里。
  2. `components/ThemeSync.tsx`：挂 `matchMedia("(prefers-color-scheme: dark)")` 的监听，
     只对「跟随系统」的读者生效（日落自动切深色时页面跟着走）。
  3. `lib/theme.ts` 的运行时 API：`applyTheme()`（写 data-theme / color-scheme / theme-color meta + 派发事件）、
     `setThemeChoice()`（存 localStorage + 生效）、`watchSystemTheme()`、`subscribeTheme()`、`readThemeTokens()`。
     第 7 项的设置中心直接用这些，别在组件里再写一遍 localStorage 与 data-theme 的读写。
- **选择的语义**：`system | paper | light | dark`。`system` 在浅色系统下解析成**纸**、深色系统下解析成**暗**
  —— 「纸」就是本站的浅色，读者不必再挑一次。没存过选择时默认 `system`；localStorage 键是 `tob:theme`。
- **没有 JS 时**：没有任何 `data-theme`，页面落到 `:root` 的「纸」，`meta theme-color` 也是纸的底色
  （`viewport` 里故意只给一条不带宽度的值 —— 读者显式选过外观后，带 `media` 的两条反而会挑错颜色）。
- **蓝图草图背景层**：`components/BlueprintBackground.tsx` 本身只画图案的「容器」，图案全在 CSS 里
  （细格 24px + 每 5 格一条粗格 + 边缘用底色径向淡出 + 大屏上的虚线图框，手机上隐藏图框）。
  它固定在最底（`z-index: -1`）、`aria-hidden`、`pointer-events: none`，线透明度 ≤ 0.26：
  约定第 5 条要的是「有气质但不抢字」。底色画在 `<html>` 上、`body` 保持透明，所以不用给内容加任何包装层。
  第 8 项已把它接上路由（`data-decor` 换图案、`data-route` 微调淡出、换页时 `data-redraw` 重铺一次）
  —— 它因此变成了 `"use client"` 组件（只有 `usePathname()` 知道当前路径），细节见第 4 节第 8 项。
- **正文与原子件**：`.article-body` 的颜色全部换成令牌（第 3 项那套 `--body-*` 局部变量没了）；
  新增两个原子件 `.page`（页面外壳：宽度/内边距/最小高度）与 `.panel`（面板块），
  并且**已经在用**：首页、404、离线页、语言分流页都换成了 `.page` + 令牌工具类
  （原先的 `opacity-70`、写死的 `underline` 之类临时写法一并清掉）。
- **图表跟着主题走**（这块是第 5 项跨项待办里点名要给第 6 项的）：
  `ChartContext` 从「只有一个 `dark`」扩成 `{ theme, dark, colors }`，`colors` 是 `readThemeTokens()`
  从 CSS 变量现读的令牌。`ArticleBody` 用惰性初值拿当前外观、用 `subscribeTheme()` 订阅变化，
  外观一变就「清空容器 → 重跑渲染器」重绘（只在真的有图表的文章里付这个代价）。
  各渲染器的改法：echarts 删掉写死的 `DARK_THEME`，改成按令牌注册一个 `blog` 主题；
  mermaid 用 `themeVariables` 把令牌盖到内置主题上；graphviz 往 dot 源里插三条
  `graph | node | edge` 默认属性（它是「黑字透明底」，暗色下原本等于看不见；作者自己写的颜色优先级更高）；
  smiles 继续用内置的 light/dark；**abc（五线谱）没动**，见下面的待办。
- **打印**：`@media print` 里隐藏蓝图层、正文转 11pt / 不限宽、代码块转浅底
  —— 纯文字博客最实用的「导出」就是 Ctrl+P 存 PDF。
- **改了令牌要同步的三处**（CSS 与 TS 之间没有桥）：`lib/theme.ts` 的 `THEME_CHROME`（三套底色镜像）、
  `THEME_INIT_SCRIPT`（`applyTheme()` 的内联版本：首帧脚本与运行时 API 必须同一套判定逻辑）、
  `FALLBACK_TOKENS`（读不到 CSS 变量时的兜底）。三处都在 `lib/theme.ts` 顶部注释里写明了。

### 7. 框架 UI —— 已完成 ✅

**交付物**：顶栏（`SiteHeader`）、页脚（`SiteFooter`）、设置中心（`SettingsDock` + `SettingsCenter`），
以及它们依赖的三块地基：路由落地状态表（`lib/site.ts` 的 `ROUTES`）、图标表（`lib/icons.ts`）、
阅读偏好（`lib/prefs.ts`）。全部挂在 `app/[lang]/layout.tsx` 上，第 9~13 项每加一页自动带上框架。

- **顶栏**：结构与 wunai-blog 对齐 —— 三段：
  ① 品牌区（外观按钮 + 大号站名 + 闪烁光标 + 小字行「wunai 是谁？ About…… 全部文章 →」）；
  ② 导航区（首页 / 文章 / 标签 / 分类 / 归档 / 搜索 / 友链）；
  ③ 图签区。**唯一的结构改动是第 ③ 段**：wunai-blog 那里是图片位，本站是**纯文字**站，
  于是换成「图纸标题栏」的气质 —— 等宽小字 + 虚线左边框，放语言切换与内容统计
  （构建期读一次 `getContentStats`，所以顶栏是**服务端组件**、页面 HTML 里就有，不发请求）。
  顶栏吸顶、半透明 + `backdrop-filter`（不支持 `color-mix` 时退回不透明）。
  外观按钮点一下循环四态（跟随系统 → 纸 → 亮 → 暗），图标与悬停说明跟着走 —— 与 wunai-blog 的
  ThemeToggle 同一个交互模型；精确挑某一套、或调阅读偏好，走左下角的设置中心。
- **`RouteLink` —— 框架 UI 与后续页面的解耦点**：第 7 项做框架，第 9~13 项才做页面。
  为了照最终形态写链接又不留 404 死链，站内链接统一过 `components/RouteLink.tsx`：
  `lib/site.ts` 里 `status: "ready"` → 真 `<Link>`；`"pending"` → 不可点的 `<span data-pending>`
  （CSS 统一压暗，悬停提示「这一页还没做（第 N 项落地）」）。
  **现在能点的只有「首页」与页脚的 RSS**；做完第 10 / 13 项，把对应 `status` 改成 `"ready"` 即可，
  顶栏、页脚、首页一起生效。这条已写进第 5 节约定（第 8 条）。
- **页脚**：联系方式（邮箱 / GitHub / 本站源码 / RSS）+ 一句话说明 + 版权行（构建时的年份）。
  联系方式与说明都在 `lib/site.ts`（`CONTACT` 与 `i18n.*`），**值全部留空**：空着的条目只显示
  「编辑此处」且不可点（不生成点不动的空链接）。RSS 是第 5 项已有的真实产物 `/{lang}/feed.xml`，
  所以现在就能订阅。
- **设置中心**：左下角一颗 **fixed 定位的齿轮**（视口左下角，任何页面、任何滚动位置都能摸到），
  点开从左侧滑出抽屉（`role="dialog"` + `aria-modal`、打开时移焦点、Esc 关闭、点遮罩关闭、
  打开期间锁 body 滚动、0.18s 滑入且只写在 `prefers-reduced-motion: no-preference` 里）。
  抽屉里四块：
  1. **外观**：四选一，直接调 `lib/theme.ts` 的 `setThemeChoice()` —— 没有在这里重写一遍
     localStorage 与 `data-theme`（第 6 项留的跨项待办就是这么要求的），每项带一枚三色预览色块；
  2. **阅读偏好**：正文宽度 / 字号 / 行距，各三档，值直接写 `--reading-measure` /
     `--reading-size` / `--reading-leading` —— 正文（`.article-body`）已经在读这三个令牌，
     所以改完立刻生效，**不需要通知任何组件**；面板底部还把当前三个令牌的实际取值印出来
     （`--reading-measure: 42rem · …`），调完能当场看到数字变化；
  3. **语言**：与顶栏图签区共用 `LangSwitcher`；
  4. **恢复默认**：清偏好键 + 移除行内变量 + 外观回到「跟随系统」。
  另外一句话说明这些偏好**只存在本机**（localStorage，不上传、不跨设备）——纯静态站的实话。
- **`lib/prefs.ts` 的三个设计决定**（写下来免得以后当 bug 改）：
  1. **存的是档位 id**（`narrow` / `normal` / `wide`…）而不是 rem 值 —— 以后把「宽」从 52rem 调到
     56rem 只改一行，读者已存的偏好不用迁移；
  2. **写到 `<html>` 的行内样式上**：行内样式一定赢过 `globals.css` 的 `:root` 规则，
     不用给三套外观各写一份、也不用跟层叠较劲；「恢复默认」是**移除**行内变量（不是设回默认值），
     让 CSS 的初值重新说了算；
  3. **首帧脚本 `READING_INIT_SCRIPT` 由选项表生成**（`JSON.stringify`，见 `optionValues()`），
     不手抄第二份 —— 与 `THEME_INIT_SCRIPT` 的做法一致，但连数据都不重复。
  脚本由 `components/PrefsInit.tsx` 内联，是 **body 的第二个元素**（紧跟主题脚本）：
  不做这一步，存了「窄 + 大字号」的读者会先看到一帧默认版面的文字再跳成他的设置（版面跳动比闪白更烦）。
  键名：`tob:reading-width` / `tob:reading-size` / `tob:reading-leading`；
  改了值或加一档只动 `lib/prefs.ts`。
- **`lib/icons.ts`（新）**：把用到的 24 个 MDI 图标集中一处、按用途分组（导航 / 外观 / 设置 / 页脚），
  只从 `@iconify/icons-mdi` 深路径导入（本地打包、运行时不发请求），图标名都对着
  `api.iconify.design/mdi/<name>.svg` 核过存在。图标名与数据的对应只有这一份，
  拼错字符串键时 TypeScript 会直接报错。
- **`lib/theme.ts` 的一处改动**：`THEME_LABELS` 的 `hint` 从「一句中文」升级成 `{ zh, en }`。
  设置中心与顶栏按钮都要显示这句话，英文界面下不该冒出中文。这是第 7 项对第 6 项文件唯一的功能性改动
  （其余只加注释），`THEME_LABELS` 此前没有别的使用者，所以不涉及兼容。
- **`app/globals.css`**：新增「6b. 框架 UI」一节（顶栏 / 页脚 / 设置抽屉 / 图标小按钮 / 选项按钮 /
  外观预览色块 / 窄屏收紧），全部走令牌、放在 `@layer components` 里。
  另外三处小改：
  1. 新增令牌 `--frame-width: 48rem`，顶栏、页脚与 `.page` 共用它（三者同宽才对得齐）；
  2. `.page` 的内边距从 `4.5rem 1.5rem` 改成 `2.5rem 1.5rem 4rem`：顶上有了吸顶顶栏，
     再留 4.5rem 首屏会空一大块；下面留 4rem 是给左下角那颗固定的齿轮让位；
  3. 打印样式里隐藏设置入口/遮罩/抽屉，顶栏改成 `position: static`。
  `.theme-chip` 那几组写死的色值是本文件里**唯一**允许写死的地方（它预览的是另外两套外观，
  引用当前令牌就四套长得一样了），已在注释里标明「改令牌时同步这里」。
- **文案分两处**：页面骨架的文案集中在 `lib/site.ts` 的 `I18N`（`SITE.i18n[lang]`，
  中英各一份、缺一边 TypeScript 直接报错，不会出现某一侧 undefined）；**选项文案跟着选项走**
  ——外观在 `lib/theme.ts` 的 `THEME_LABELS`、阅读偏好在 `lib/prefs.ts` 的 `READING_*` 表
  （与第 6 项的做法一致）。第 5 节约定第 3 条据此补了一句说明。
- **第 13 项的 /[lang]/settings/ 页不需要新写**：`SettingsCenter` 只负责内容、不管容器，
  那一页把它放进 `.page` 里即可（抽屉与页面共用同一份组件）。
- 尚未在本机验证的（第 8 节有清单）：吸顶顶栏与蓝图层叠在一起好不好看、齿轮在手机上挡不挡内容、
  抽屉的键盘/读屏行为、阅读偏好首帧不跳动。

### 8. 装饰与动效 —— 已完成 ✅

**交付物**：`lib/decor.ts`（路径 → 图纸的唯一事实来源）、`components/BlueprintBackground.tsx` 接上路由、
`app/globals.css` 第 5 节的七套图案。这一项**没有新页面**，改的全是「纸面」。

- **一张图纸 = 编号 + 图案 + 图签名字**。`lib/decor.ts` 把路径翻成四样东西：
  `section`（哪一页，`RouteId | "article" | "offline" | "unknown"`）、`pattern`（图案名）、
  `sheet`（两位编号）、`lang`（图签上的语言）。规则只有两条：
  1. **先摘语言段**：静态导出下每页都在 `/{lang}/…` 下；`/zh`、`/zh/`、`/zh/?a=1` 是同一张图纸
     （尾斜杠 / 查询串 / 哈希都先规范化掉）；没有语言段（`/offline/`、`/404.html`）退回 `SITE.defaultLang`；
  2. **再看第一段**：空 → `home`；`posts` 且后面还有一段 → `article`（正文）；`offline` → 离线纸；
     认得的 RouteId → 它自己；其它 → `unknown`（编号印 `00`，一眼看出这是张「没编号的纸」）。
- **图案全在 CSS 里，运行期零计算**：`app/globals.css` 的「5b. 图案随路由变」按 `[data-decor="…"]` 选层。
  七套：`sheet`（整幅图纸 —— 就是第 6 项那套基线图案：细格 + 每 5 格一条粗格 + 虚线图框）、
  `columns`（每 16rem 一根竖向分栏线 + 正中一条虚线中轴，像一栏栏的文稿纸）、
  `measure`（左边缘一把刻度尺，短刻度 8px / 长刻度 40px，文章页「在图纸上排版」的感觉）、
  `grid`（16px 密格，没有粗格）、`hatch`（45° 剖面线）、`dots`（18px 点阵）、
  `plain`（什么都不画 —— 断网时纸面最干净，也最省电）。
  全部是 `repeating-linear-gradient` / `radial-gradient`：**没有图片、没有滤镜、不改布局尺寸**，
  所以 PWA 离线时装饰也在（与第 5 项的外壳预缓存不冲突），滚动时也不用重算。
  近景图案（`grid` / `dots` / `hatch` / `plain`）顺手关掉外圈虚线图框 —— 一页一眼就能看出换了张纸。
- **图案与路由的对应**（`PATTERNS` / `SHEETS` 两张表，改一行就换）：
  01 首页 `sheet` · 02 文章列表 `columns` · 03 正文 `measure` · 04 标签 `grid` · 05 分类 `hatch` ·
  06 归档 `columns` · 07 搜索 `dots` · 08 友链 `hatch` · 09 关于 `grid` · 10 设置 `columns` ·
  11 离线 `plain` · 00 未知 `sheet`。
  编号连续说明没落下哪张图纸；图案重复是**故意的**（列表 / 归档 / 设置都是「一栏栏的文稿纸」，
  气质本来就接近）。这两张表写在**页面还没做出来之前**，与第 7 项提前写好 `ROUTES` 是同一个做法：
  第 10~13 项落地时不用回头补装饰。
- **为什么是客户端组件**：静态导出下服务端不知道当前路径，只有 `usePathname()` 知道。
  首屏 HTML 里就已经是这一页的图案（构建期渲染那一页时路径就是那一页的），不是「先画一张再换一张」。
  `BlueprintBackground` 因此从第 6 项的那个空 div 变成 `"use client"` 组件 ——
  但它仍然只是一个 div：**图案的解释权在 CSS 与 `lib/decor.ts`，不在组件里**（组件里没有任何 `if`）。
- **动效只有两处**（第 8 项的全部）：换页时纸面重铺一次，加上第 7 项就写好的顶栏光标闪烁。
  重铺的做法是跳转后在**同一个 div** 上挂 `data-redraw="true"`，0.32s 内 `opacity: 0.45 → 1`，
  360ms 后摘掉属性（比动画长一点，免得停在中间帧）；**首帧不播**（首屏是一次「已经铺好的图纸」，
  没有「换页」这回事），`prefers-reduced-motion: reduce` 的读者完全不参与。
  刻意**没有**做页面转场动画：阅读站抢注意力，代价大于收获。
- **右下角的图签（图纸标题栏）**：等宽小字两行 —— 编号 `TOB-ZH-04`（TOB = Text-Only-Blog）
  + 这一页的名字。名字里 RouteId 那几张**复用顶栏导航的文案**，`SITE.i18n.decor` 只补
  `正文 / 离线 / 未编号` 三条，不在两份文案表里各写一遍十二个名字（约定第 3 条）。
  它画在蓝图层**里面**（`z-index: -1`），所以永远在正文与页脚下面 —— 与页脚重叠时被盖住是预期的；
  窄于 48rem 直接不印，手机上那几平方厘米留给正文。
  **它是装饰、不是信息**：整层 `aria-hidden`，无障碍树里没有它，真正的内容统计在顶栏图签区。
- **`data-route` 也没闲着**：`[data-route="article"]` 把边缘淡出的半径收小一点
  （`radial-gradient(115% 105% at 50% 0% …)`），读正文时视线落在中间；其余图纸用基线那条。
  要再加一处就写 `[data-route="…"]`，别在组件里写判断。
- **新增一张图纸 = 两步**（`lib/decor.ts` 与 `globals.css` 的注释里都写了）：
  `PATTERNS` / `SHEETS` 各加一行 + CSS 加一条 `[data-decor="…"]`。
  两张表都是 `Record<DecorSection, …>`（穷尽类型）：新加一个 `RouteId` 却忘了补图案，TypeScript 直接报错。
- 这一项**没有**改颜色与令牌（线仍然只用第 6 项的 `--bp-line` / `--bp-line-strong` / `--bp-frame`，
  透明度 ≤ 0.26），也**没有**动层序（装饰整层仍是 `z-index: -1`）。
- **「纸质颗粒」没做，理由留档**：CSS 造噪点只有两条路 —— 内联一张 SVG 湍流图（多一个资源，
  与「纯文字站不加图片」的取舍矛盾），或高频渐变叠层（渲染开销 + 手机上容易出摩尔纹）。
  所以这一项交出的纸面**是干净的网格**，不带颗粒；真机上试出来觉得需要再加，
  给 `.blueprint` 补第五层背景、透明度再压一档即可，改动只在 CSS 里。

### 9. 首页 —— 已完成 ✅

**交付物**：`lib/home.ts`（版面 + 文案的唯一事实来源）、`app/[lang]/page.tsx`（把版面渲染出来）、
`components/home/` 下 10 个组件（8 栏 + 栏头 + 侧边指示器）、`app/globals.css` 的「6c. 首页」一节。
这一项把第 1 项的占位首页换成了**八栏吸附式首页**。

- **八栏与顺序（作者给的清单 + 顺序优化）**：

  | 栏 | 内容 | 数据来源 |
  | --- | --- | --- |
  | 01 本站介绍 | 站名 + 自述（编辑此处）+ 三个入口 | 静态文案；RSS 是第 5 项的真实产物 |
  | 02 文章卡片 | 最多 6 篇，置顶优先 | `getHomePosts` |
  | 03 数据统计 | 字数 / 累计阅读 / 首次发布 / 最近更新 / 本次构建（+ 有草稿时显示草稿数） | `getContentStats` |
  | 04 更新日志 | 最近 5 条 git 提交 | `getChangelog(5)` |
  | 05 站内内容 | 文章 / 专题 / 标签 / 题材 / 语言 | `getContentStats` + `LANGS` |
  | 06 阅读改善 | 同一句话的「优化前 / 优化后」+ 四条规则 + 已有能力清单 | 当场调 `transformCjkText` |
  | 07 外观切换 | 四选一，带预览色块 | `lib/theme.ts` |
  | 08 字体设置 | 宽度 / 字号 / 行距三组 + 现场示范段落 | `lib/prefs.ts` |

  **只动了两处顺序**：把「文章」从第八提到第二（读者是来读文章的）；把两两相关的栏并成一行 ——
  「数据统计 + 更新日志」（都在说「这里还在长」）、「站内内容 + 阅读改善」（一个说「有多少」、
  一个说「怎么读得舒服」）、「外观切换 + 字体设置」（偏「玩」的两栏，放最后不挡阅读路径）。
  于是八栏排成 **5 行**：宽屏两栏并排、窄屏上下堆叠。
- **版面与文案只有一个事实来源**（`lib/home.ts`）：`HOME_ROWS`（哪几栏、哪两栏并排）+
  `HOME_TEXT`（中英各一份）。`homeNumber()` 从版面表推出 01~08 —— 调顺序时**不会**出现
  「编号还对、内容已经换了」的错位。页面里那个 `Record<HomeBlockId, ReactNode>` 是穷尽的：
  加了栏却忘了写组件，TypeScript 直接报错。
- **吸附（作者要的「吸附固定」）全部交给 CSS，没有一行 JS 滚动**：
  `html:has(.home-flow) { scroll-snap-type: y proximity; scroll-padding-top: var(--home-head-room) }`。
  - `:has()` 认领「这一页有首页容器」这件事 —— 所以**不用给 `<html>` 挂 class、也不需要 JS**，
    其它页面完全不受影响；浏览器不支持 `:has()` 时只是不吸附（优雅降级）。
  - 用 `proximity` 而不是 `mandatory`：`mandatory` 在内容比一屏高的行上会把中间的位置锁死，
    读长一点的栏会很难受。
  - `scroll-padding-top` 同时管**吸附位置**与**锚点跳转**：侧边指示器点哪一栏，
    栏头都会停在顶栏下面那条线上。这个偏移是令牌 `--home-head-room`（宽屏 5.5rem、
    窄屏 8.5rem —— 顶栏在手机上会折行变高）。**顶栏高度变了就调这一个值。**
  - 宽屏每行至少 `100svh - 顶栏`，面板撑满整行、内容垂直居中（「一屏一张图纸」）；
    窄屏 `min-height: auto`（内容折行后会很高，硬撑一屏反而难读）。
  - `prefers-reduced-motion: reduce` 的人：不做平滑滚动、也**关掉吸附**（吸附在部分浏览器里
    本身就是一段动画）。打印时同样取消（`@media print` 里 `min-height: 0`）。
- **侧边指示器**（`components/home/HomeIndex.tsx`）：固定右侧的一列**真锚点**
  （`<a href="#home-…">`）—— 所以没有 JS 也能跳；滚动动画交给 CSS 的 `scroll-behavior: smooth`。
  高亮用 `IntersectionObserver`，判定带取「正跨过视口中线」那一带（`rootMargin: -45% 0 0 -45%`）：
  **并排的两栏会一起亮**（它们确实在同一屏上，这是预期）。可见项累积在 `useRef` 的 Set 里 ——
  IO 每次只给变化的那几条，不累积会闪。栏名常驻 DOM、靠 CSS 展开（不是 `display: none`），
  读屏与键盘用户都读得到；窄屏整列隐藏，那点宽度留给正文（每栏的栏号本来就印在栏头）。
  层序 `z-index: 18`：低于顶栏（20）与设置抽屉（50），抽屉打开时它被盖住。
- **两栏交互件与设置中心共用一套东西**（不重写第二份）：
  - 外观：`lib/theme.ts` 的 `THEME_CHOICES / THEME_LABELS / setThemeChoice / subscribeTheme`
    + `.settings-opt` 与 `.theme-chip` 预览色块；顺手把设置中心里那张「预览色块格数」表
    挪进 `lib/theme.ts`（`THEME_CHIP_DOTS`），两处现在共用一份；
  - 字体：`lib/prefs.ts` 的选项表与 `setReadingPrefs`，落点仍是那三个 `--reading-*` 令牌
    （约定第 8 条：阅读偏好只写令牌）；两处都把「只改一项」写成 `Partial<ReadingPrefs>`
    而不是 `as` 断言。
  - 首页第 7/8 栏都多放了一段**示范文字**（`.home-demo`，读 `--reading-size` / `--reading-leading`）：
    改外观或改度量，当场就能看见 —— 不必等到第 12 项的文章页。
- **第 3 栏「访问数据统计」的实话**：纯静态站没有后端，也就没有真实浏览量。这一栏给的是
  **构建期数字**（字数 / 累计阅读时长 / 首末发布日期 / 本次构建日期），并在栏内写明要接
  外部服务（Cloudflare Web Analytics 或自建计数器）才有访问量 —— 位置留好了（编辑此处）。
  「本次构建」是渲染时的 `new Date()`：静态导出在 `npm run build` 里跑，所以它就是构建那一天。
- **第 5 栏的「笔记」**：管线里目前只有文章这一种内容类型，所以「笔记数量」映射到
  **卡组（`_index.md` 定义的专题）**，并在栏内写明这件事。要真正的短笔记型内容，
  得在 `content/<lang>/` 下加一种目录类型（加载器加一处扫描），说一声就做。
- **第 4 栏读的是 git 提交**（`git log`，最多 5 条、不含合并提交）：拿不到 git 时
  `getChangelog()` 返回空数组并打一条警告 —— 这一栏有空状态，**绝不让构建失败**。
- **第 2 栏的卡片暂时不可点**：正文页是第 12 项。判断与 `RouteLink` 同一个约定，
  落点只有一个 —— `lib/site.ts` 新增的 `ARTICLE_ROUTE`（`status: "pending", item: 12`），
  第 12 项做完改一个字，首页与列表页的卡片一起变成真链接。卡片的排版是紧凑文字卡，
  第 11 项（三档密度）落地后换成那边的「紧凑档」。
- **约定第 3 条补了一句**：UI 文案仍集中在 `lib/site.ts`，但**首页八栏的文案跟着版面走**
  （`lib/home.ts`）—— 八栏 × 两语 ×（标题 + 说明 + 空状态 + 示范句子）塞进 site.ts 会把
  站点配置变成文案仓库，而改一版首页只该动一个文件（与第 6/7 项「选项文案跟着选项走」同理）。
- 开发态自检仍然在（生产构建里不出现）：现在是首页 `</main>` 之后一块独立的 `.page`，
  不参与八栏吸附；第 12 项落地后连同 `components/dev/PipelineCheck.tsx` 一起删（约定第 6 条）。

### 10. 列表页 —— 已完成 ✅

**交付物**：`app/[lang]/posts/page.tsx`（服务端：构建期取数据）、`components/list/PostList.tsx`（客户端：
搜索 / 筛选 / 密度 / 地址栏状态）、`lib/list.ts`（这一页的唯一事实来源）、`app/globals.css` 的「6d. 列表页」一节。

- **数据全部在构建期取**（第 2 项的 `getPosts` / `getTaxonomy` + `lib/list.ts` 的 `yearsOf`），
  HTML 里就有完整列表 —— 没有 JS、爬虫、离线都能读（约定第 4 条）。筛选与搜索是**增强**，不是前提。
- **搜索**：第一次输入时才 `fetch("/search-index.json")`（第 5 项的产物）并动态 `import("fuse.js")`，
  所以首屏包里既没有索引也没有搜索库。字段与权重来自**索引自带的那份 `fields`**
  （唯一事实来源是 `lib/search-index.ts` 的 `SEARCH_FIELDS`），权重表在 `lib/list.ts` 的
  `SEARCH_FIELD_WEIGHTS`（标题 3 / 标签与分类 2 / 摘要 1.5 / 摘录 1 / 正文 0.7）。
  索引是**全语言**的（第 5 项的设计），列表页按 `doc.lang` 只取当前语言那一份。
- **索引读不到时不会瞎**：`loadSearchIndex()` 在「HTTP 不 ok / 形状不对 / `version` 与代码期望的不一致」
  三种情况下都返回 `null`，于是退回**本页已有的字段**（标题 / 标签 / 分类 / 摘要，`INLINE_SEARCH_FIELDS`），
  并在搜索框下面如实写明「这一次只匹配本页字段」；`fuse.js` 加载失败则是另一种提示（红色，`data-tone="warn"`）。
  这条兜底是有意为之：`/search-index.json` 的产物路径从第 5 项起就**没被验证过**
  （`trailingSlash: true` 下 Route Handler 是否也被加上尾斜杠，见第 8 节），
  兜底让这一页在两种情况下都能用，而且**你自己能一眼看出走的是哪条路**。
- **版本号怎么过到客户端**：`SEARCH_INDEX_VERSION` 是 `lib/search-index.ts` 的**值导出**，而那个文件
  `import` 了 `lib/content.ts`（node:fs）—— 客户端组件**不能**值导入它。所以由服务端页面当普通 props
  传下来（`indexVersion`）。`lib/list.ts` 对 `content.ts` / `search-index.ts` 一律只用 `import type`
  （编译后整条 import 被擦掉），文件头写明了「别改成值导入」。
- **筛选**：标签（多选，带篇数）、分类（多选，带篇数）、时间（年份，选项从数据推出来）、排序（最新 / 最早）、
  密度（三档）。**组内是「或」、组与组之间是「且」**（选中两个标签 = 命中任意一个，再加上年份就是还要在这一年），
  规则只有一份实现：`lib/list.ts` 的 `matchesFilters` —— 搜索命中的结果也要过同一遍（`applyFilters`），
  两条路不会出现「筛选只对直接渲染的那批生效」这种偏差。
- **AI 筛选默认开启**：`DEFAULT_FILTERS.hideAI = true`，frontmatter 里 `isAI: true` 的文章默认不出现，
  也一并从搜索命中里排除；工具条上写着「已隐藏（默认）」并给出理由，点一下变成「已显示」。
- **密度切换记在本机**（`tob:list-density`，`lib/list.ts` 的 `readSavedDensity` / `saveDensity`）：
  它是偏好不是筛选，所以不进地址栏；**筛选进地址栏**（`lib/list.ts` 的 `listQueryString` / `parseListQuery`，
  只写非默认项），于是「某一类文章」可以分享，第 13 项的标签 / 分类页也能直接链到
  `/zh/posts/?tag=xxx`。首帧一律按默认值渲染（服务端读不到 query 与 localStorage），挂载之后才应用真实状态 ——
  与第 7 项读主题 / 阅读偏好同一个做法，不然 React 会报水合不一致。
- **语言切换**：工具条里那一项复用第 7 项的 `components/LangSwitcher.tsx`（它自己按当前路径算出
  `/en/posts/`），没有为此写第二个组件。
- **零文章时**：页头 + 空状态（写明「第一篇由你亲笔写」与写作规范在哪），**不渲染工具条** ——
  一份连文章都没有的清单上，筛选器只会让人以为点坏了。
- **页头的图纸编号**取 `decorate("/{lang}/posts/")`（第 8 项），与右下角图签同一个来源，不手写 `02`。
- **打印**：工具条不印（纸上是点不动的噪音），列表按当前筛选结果排成一条、宽度不再受限。
- **离线**：`public/sw.js` 的外壳清单里加了 `/zh/posts/` 与 `/en/posts/`（`CACHE_VERSION` 1 → 2），
  所以第一次访问就把首页与列表页带走；`/search-index.json` **故意不进清单**（理由写在 sw.js 的注释里：
  它随文章数增长，搜索过一次之后自然进缓存，离线搜索随后也能用）。
- ⚠️ 未在本机跑过浏览器（见第 8 节）：索引的产物路径、搜索实际命中效果、地址栏同步这三件事需要你确认。

### 11. 文章卡片（三档密度）—— 已完成 ✅

**交付物**：`components/list/PostCard.tsx` + `app/globals.css` 里的 `.post-card[data-density="…"]`。

- **三档**（选项表在 `lib/list.ts` 的 `DENSITIES`，中英文案跟着选项走）：
  - **紧凑**：一行一篇 —— 标题 + 日期与时长（扫得最快，适合文章多起来以后）；
  - **适中**（默认）：再加摘要与标签 —— 与首页第 2 栏原来的样子一致；
  - **内容**：把这一篇的元信息全展开 —— 摘要按读者的阅读度量（`--reading-*`）排、摘录、字数、
    修改时间、所属卡组、标签与分类片，并在卡片里写明「列表只到摘要为止，正文在第 12 项落地后可读」。
- **结构上只有两处分支**（摘要要不要渲染、内容档多渲染几句），其余全交给 CSS：
  `.list-grid .post-card[data-density="full"] { grid-column: 1 / -1 }` 让内容档在宽屏上**一行一篇**，
  紧凑档收内边距与字号。组件里没有按密度写的样式分支。
- **一份实现两处使用**：列表页（客户端）与首页第 2 栏（服务端组件）用的是同一个 `PostCard` ——
  首页把它放进 `.home-posts` 并覆盖两行（卡片贴着一块 `.panel`，改用画布色；栅格更密）。
  第 12 项的文章页与第 13 项的标签 / 归档页复用同一个组件即可，**不要另写卡片**。
- 卡片上的小字（几分钟 / 置顶 / 草稿 / AI / 正文页未落地）跟着卡片走（`LIST_TEXT`），
  所以 `lib/home.ts` 里的 `posts.minutes` 与 `articlePending` 已经删掉 —— 首页不再各留一份同义文案。
- 草稿徽章只在 dev 出现（生产构建根本不含草稿，但 dev 下容易忘记哪篇还没发布）。
- 「内容」档**不重复正文**：列表页的意义是挑文章，正文归文章页（第 12 项）。所以这一档停在
  「摘要 + 全部元信息」，并在卡片上如实说明。



### 构建修复 —— 首次云构建失败的两处（2026-09-30）

Cloudflare 上第一次真正跑 `npm run build` 时，编译（Turbopack）通过，**类型检查**挂了两处
—— 都在 `lib/markdown.ts` 的插件选项上（第 3 项写的代码，此前从没被 tsc 检查过）：

1. `rehype-autolink-headings` / `rehype-katex` 的选项原本内联写在 `.use(plugin, { … })` 里，
   tsc 报 `TS2345`。原因在 unified 的 `Processor#use` 签名：参数类型是
   `...parameters: Parameters | [boolean]`（联合元组），而 TS 对联合签名里的**新建字面量**
   只会挑一支做上下文推导 —— 日志里它挑中了 `[boolean]`，于是报
   `… is not assignable to type 'boolean'`（两处都是这个原因）。
   **修法**：把选项写成显式标注插件自己 `Options` 类型的常量（`AUTOLINK_HEADING_OPTIONS` /
   `KATEX_OPTIONS`）—— 传进去的是有类型的值而不是新建字面量，只需一次普通结构比较，联合推导不再参与。
2. `rehype-katex` 的 `Options` 是 `Omit<KatexOptions, "displayMode" | "throwOnError">`
   —— 原来传的 `throwOnError: false` 属于「不存在的属性」，直接类型错误。
   查了插件源码（`rehype-katex@7.0.1/lib/index.js`）确认：它自己先用 `throwOnError: true` 试、
   失败记一条 vfile message、再用 `throwOnError: false` 重画 —— 所以「写错公式不弄挂整站」
   依旧成立，只是这件事由插件保证，不是我们传参保证的。`throwOnError` 已删掉。
3. 顺手做的：插件记在 vfile 上的消息（例如上面那条 KaTeX 渲染失败）现在会并进
   `renderMarkdown` 的 `warnings`，构建日志与开发态自检都能看到 —— 以前它们是**看不见的**。
4. `tsconfig.json` 的 `jsx` 从 `preserve` 改成 `react-jsx`，并补上 `.next/dev/types/**/*.ts` 的
   include：这正是云构建日志里 Next 16 标为 **mandatory changes** 自己改的两项；
   写进仓库是为了让 `npm run typecheck`（第 6 节列的本地命令）不必先跑一次 build 才能用。

还没验证的：改完这些之后**是否真的通过类型检查、静态导出是否产出预期的产物**，
要等再触发一次构建（或本地 `npm run typecheck && npm run build`）。

### 构建失败 —— `package.json` 尾逗号（2026-09-30，第六次云构建）

改部署目标那次提交里，`scripts` 的最后一项（`deploy`）被我留了个**尾逗号**，
于是 `npm run build` 在读 `package.json` 时就挂了 —— **页面构建根本没开始**：

```
Executing user build command: npm run build
npm error code EJSONPARSE
npm error JSON.parse Invalid package.json: JSONParseError: Expected double-quoted property name in JSON
  at position 474 (line 13 column 3) while parsing near "...wrangler deploy\",\n  },\n  \"dependencies\":..."
```

- 原因：JSON **不允许**尾逗号（JS 对象字面量允许，这是两者最容易混的一处）。
  位置 `474 / line 13 column 3` 指的就是 `"deploy": "npx --yes wrangler deploy",` 那个逗号。
- 修法：删掉该逗号，`scripts` 的 `deploy` 成为最后一项。**已修并推送**。
- 教训（以后改 `package.json` 必做）：改完的 JSON 一定要过一遍真正的解析器。
  `npm run typecheck` / `tsc --noEmit` **不会**检查 JSON，能拦住这一步的是：

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')) && console.log('ok')"
```

  本环境没有 shell（跑不了上面这条），只能靠逐行读、对着括号与逗号核 —— 这次就是漏了这一眼。
- 也为上一节那句「改了配置文件后先触发一次构建」提供了例证：这类错**只在云构建里暴露**，
  本环境不执行任何命令，所以构建日志是这个项目唯一的集成测试。

### 部署失败 —— 命令填错与 token 权限（2026-09-30，第二～四次云构建）

**先记好消息**：第一次构建那两处类型错误（`lib/markdown.ts` 的 `TS2345` 与 `throwOnError`）确实修好了。
第二次日志里 `Running TypeScript ... Finished TypeScript in 3.7s`、`Generating static pages (14/14)`，
`bun install` → Turbopack 编译 → 类型检查 → 静态导出全部通过，`Success: Build command completed`。
也就是说**构建阶段已经没有问题**（`out/` 是否如预期含 `feed.xml` / `search-index.json` / `sitemap.xml` /
`404.html` 仍要你 `ls out` 确认一次，见第 8 节）。

**失败的是部署这一步**，与代码无关：

```
Executing user deploy command: npx wrangler deploy
▲ [WARNING] It seems that you have run `wrangler deploy` on a Pages project,
  `wrangler pages deploy` should be used instead.
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

- 原因：`wrangler deploy` 是 **Workers** 的部署命令，它只认 `main`（Worker 脚本）或 `[assets] directory`
  两种「要传什么上去」的写法；本站 `wrangler.toml` 里写的是 **Pages** 的字段
  `pages_build_output_dir = "out"`，Workers 那条路径根本不读它 ——
  于是 Wrangler 一边警告「你这是在 Pages 项目上跑 Worker 部署」，一边找不到入口点，两步自相矛盾地报错。
  提示里的 `main = "src/index.ts"` / `[assets]` 是 Workers 的模板，**本站不需要**，别照着加。
- 结论：这不是配置缺失，是**命令选错了**。部署目标仍旧是 Cloudflare Pages（本仓库的设计如此：
  `wrangler.toml` 的 `pages_build_output_dir`、`package.json` 的 `deploy`、GitHub Actions 里的
  `pages deploy out --project-name=text-only-blog` 三处是一致的）。
- **修法（两处任选其一，都在 Cloudflare 构建设置里改，仓库不用动）**：
  1. 构建设置里的 **Deploy command 改成** `npx wrangler pages deploy` ——
     不带参数时它会自己读 `wrangler.toml`：`pages_build_output_dir` 当产物目录、`name` 当项目名；
  2. 或者填成本仓库已有的那条：`npx wrangler pages deploy out --project-name=text-only-blog`
     （与 `.github/workflows/deploy.yml` 完全一致，项目名写死、报错更直白；本项目推荐这条）。

**第二次尝试（第三次云构建）：命令名拼错，`wrangler` 写成了 `wrangLer`**

构建设置已改成 Pages 那条命令，方向对了，但字母打错：

```
Executing user deploy command: npx wrangLer pages deploy out
npm error 404 Not Found - GET https://registry.npmjs.org/wrangLer - Not found
npm error 404  1. name can no longer contain capital letters
```

- 原因：`npx <名字>` 在本地找不到该命令时会去 **npm registry 下载同名包**。
  npm 包名**只允许小写**（大写字母是历史遗留的非法命名），所以 `wrangLer` 必然 404 ——
  报错里那句「name can no longer contain capital letters」说的就是这件事。
  这跟 Wrangler 无关，纯粹是那个大写的 `L`。
- 顺带说明：这条命令**没有** `--project-name`。它其实能跑（`wrangler.toml` 的 `name` 就是默认项目名），
  但为了报错更直白、也和 `.github/workflows/deploy.yml` 完全一致，还是建议带上。
- **正确写法**（复制粘贴，注意全小写、`pages` 与 `deploy` 之间是空格）：

```
npx wrangler pages deploy out --project-name=text-only-blog
```

**第三次尝试（第四次云构建）：命令少一个空格 + 构建环境的 token 没有 Pages 权限**

```
Executing user deploy command: npx wrangler pages deploy out--project-name=text-only-blog
✘ [ERROR] A request to the Cloudflare API (/accounts/328952a9b1c048e303952da321c5b23a/pages/projects/text-only-blog) failed.
  Authentication error [code: 10000]
  📎 It looks like you are authenticating Wrangler via a custom API token set in an environment variable.
```

两个独立问题，第二个才是真正的墙：

1. **命令少一个空格**：`deploy out--project-name=...` → 位置参数（产物目录）被拼成
   `out--project-name=text-only-blog`，一个不存在的目录名。
   正确：`npx wrangler pages deploy out --project-name=text-only-blog`（`out` 后面必须有空格）。
2. **`Authentication error [code: 10000]` 与目录名无关** —— Wrangler 会先查项目是否存在，
   这条报错来自 `GET /accounts/<id>/pages/projects/text-only-blog` 这个 **Pages API**。
   根因：本构建是 **Workers Builds** 项目（默认 Deploy command 就是 `npx wrangler deploy`，
   与日志相符），它**自动生成的 API token 里没有任何 Pages 权限**。文档列出的默认权限是：
   Account 的 Account Settings(read) / Workers Scripts(edit) / Workers KV Storage(edit) /
   Workers R2 Storage(edit)、Zone 的 Workers Routes(edit)、User 的 User Details(read) / Memberships(read)。
   而 Pages 的 REST API 要求 token 带 **`Cloudflare Pages: Edit`**，文档还特别注明
   「用 *Edit Cloudflare Workers* 模板还得在 Custom Token 里自己加上 Pages 权限」。
   所以只要 deploy 命令还指向 Pages，这个 token 一定认证失败 —— 与命令写法无关。
   - 依据：`developers.cloudflare.com/workers/ci-cd/builds/configuration/`（API token 小节，含默认权限清单）、
     `developers.cloudflare.com/pages/configuration/api/`（Get an API token 小节）。
3. 顺带确认一条之前只是猜测的事：Workers Builds 的文档写明
   「Workers Builds will use the Wrangler version set in your `package.json`」——
   也就是说把 `wrangler` 写进 `devDependencies` 能同时钉住云构建与本机 `npm run deploy` 的版本。

**于是当时有两条真正可走的路**（`wrangler.toml` 保持 Pages 不变的那条需要新 token；
下面 A/B 是当时给出的选项，**最终落地的是 B**，见本节后面「最终决定」）：

- **A. 继续用 Pages（一度选定，随后推翻，留档）**：在 My Profile → API Tokens 建一个自定义 token，权限
  Account → **Cloudflare Pages → Edit**（Account Resources 选你的账号），
  然后到这个 Worker 的 **Settings → Build → API token** 里选中它（文档明说可以「select one that you already own」）。
  再确认 Pages 项目 `text-only-blog` 存在（不存在就先 `npx wrangler pages project create text-only-blog`），
  Deploy command 保持 `npx wrangler pages deploy out --project-name=text-only-blog`。
- **B. 改成 Workers 静态资源（最终采用）**：把 `wrangler.toml` 从 Pages 写法改成
  `[assets] directory = "./out"`（+ `not_found_handling = "404-page"`），
  Deploy command 留回默认的 `npx wrangler deploy` —— 这个 token 的
  `Workers Scripts (edit)` 权限正好够用，**不用碰任何 token**。
  代价是部署目标从 Pages 项目变成同名 Worker（原 Pages 域名/自定义域名要重新绑定），
  且 `package.json` 的 `deploy`、`.github/workflows/deploy.yml` 要同步改 —— 这三处本次都已改完。

**路径 A 的操作清单（未采用，留档 —— 万一以后要回 Pages 照着做）**：

1. My Profile → API Tokens → *Create Token* → *Create Custom Token*：
   Permissions 加一条 **Account · Cloudflare Pages · Edit**，Account Resources 选 `3234319738@qq.com's Account`。
   （文档《Pages → REST API》原话：用 *Edit Cloudflare Workers* 模板还得自己补 Pages 权限。）
2. 回到这个 Worker 的 **Settings → Build → API token**，把刚建的 token 选上（不要用默认那个自动生成的）。
   注意：**改完保存后要等下一次构建才生效**，且如果点 *Retry build*，用的是重试那一刻的配置。
3. 确认 Pages 项目 `text-only-blog` 已存在；不存在就在 Workers & Pages 里先建，
   或本地 `npx wrangler pages project create text-only-blog`（这两步都要带上刚建的 token）。
4. Deploy command 里**把空格补回去**：

```
npx wrangler pages deploy out --project-name=text-only-blog
```

⚠️ 一个仍未验证、值得留意的点：`wrangler pages deploy` 在项目不存在时是否需要交互确认
（非交互环境下 Wrangler 会取「默认是」的兜底值，但这条只是从 `wrangler deploy` 的日志行为类推的，
**没有实测**）。若下一次日志报的是「project not found / must be created」，先做上面第 3 步再重试。

**第四次尝试（第五次云构建）：命令已正确，报错一字未变 → token 没生效**

```
Executing user deploy command: npx wrangler pages deploy out --project-name=text-only-blog
✘ [ERROR] A request to the Cloudflare API (/accounts/328952a9b1c048e303952da321c5b23a/pages/projects/text-only-blog) failed.
  Authentication error [code: 10000]
```

- 空格已补、项目名已带，命令本身与 `.github/workflows/deploy.yml` 完全一致，
  但 `Authentication error [code: 10000]` **完全没变**。按 Wrangler 的执行顺序，
  这条报错发生在**读项目信息**这一步，早于上传产物 —— 也就是说还没碰到 `out/`，是权限判定先挂了。
- 结论：**这个构建环境实际用的 token 仍然没有 Pages 权限。**
  可能是新 token 没在这个 Worker 的 Settings → Build → API token 里被选中，
  也可能选了但权限/账号范围没配对（Pages 权限是 **Account** 级别的，`Cloudflare Pages: Edit`
  与 Account Resources 缺一不可）。日志里那句「logged in with an User API Token, associated with
  the email …」对两种 token 都成立，**日志本身分辨不出用的是哪一个**，所以别用日志判断，要用下面的办法。

**怎么确认到底用的哪个 token（三选一，都能定位）**：

1. **看 token 的「最近使用」**：My Profile → API Tokens，列表里每个 token 都有 *Last used* 时间。
   新 token 若显示 12:11–12:12（这次构建的时刻），说明它确实被用了 → 那就是权限没配够；
   若新 token 从没被用过、而自动生成的那个刚被用过 → 是 **Settings → Build → API token 没切换成功**。
2. **把 Deploy command 临时改成探针**：填 `npx wrangler pages project list`，跑一次。
   它调的是同一套 Pages API —— 能列出项目就说明 token 没问题（那问题在别处），
   仍然 10000 就说明 token 缺 Pages 权限。这一步**不需要本机环境**，是手机上最省事的判别法。
3. **本机（或任何有 shell 的地方）用 curl 直接打 API**：

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/328952a9b1c048e303952da321c5b23a/pages/projects"
```

   返回 `"success": true` 即权限 OK；`code: 10000` 即 token 权限不对。
   另外 `npx wrangler pages project list`（本机、带同一个 token）等价。

**如果不想继续在 token 上磨**：第 4 节上面那条路径 B（Worker 静态资源）与仓库里现成的
`.github/workflows/deploy.yml`（路径 C，用你自己带 Pages 权限的仓库 Secret）都能绕开这个 token ——
两条都是「换一个鉴权主体」，而不是继续猜权限。三者取舍见本节开头两条路 + 第 7 节。

**最终决定：改用路径 B（Workers 静态资源），已落地**

我把选项和日志一起给出后，确认的结果是：**带 Pages 权限的 token 还没建、也没换**（
也就是说这次的 `code 10000` 用的仍是构建环境自动生成的那个 token，符合预期），
于是不再在 Pages 鉴权上继续试，直接换到 **Workers 静态资源** ——
它用的正是那个 token 本来就有的 `Workers Scripts: Edit`。本次改动的文件：

| 文件 | 改动 |
| --- | --- |
| `wrangler.toml` | 从 Pages 写法（`pages_build_output_dir`）改成 `[assets] directory = "./out"` + `not_found_handling = "404-page"` + `html_handling = "auto-trailing-slash"`；`name` / `compatibility_date` 不变 |
| `package.json` | `deploy` 脚本：`wrangler pages deploy out` → `npx --yes wrangler deploy`（与 `preview` 脚本一样用 `npx --yes`，不需要先把 wrangler 装进依赖） |
| `.github/workflows/deploy.yml` | 标题/并发组改名；Deploy 步骤改成 `command: deploy`（不再传 `pages deploy out --project-name=…`，交给 `wrangler.toml`）；顺带把必然会失败的 `npm ci` + `cache: npm` 换成 `oven-sh/setup-bun@v2`（bun 1.2.15）+ `bun install` |
| `app/not-found.tsx` / `next.config.ts` | 两处注释里的「Cloudflare Pages」改成 Workers 静态资源（只动注释） |

- **Cloudflare 侧要做的**：Deploy command 改回默认的 **`npx wrangler deploy`**（无参数），
  API token 保持默认那个自动生成的即可，**不需要新建 token、不需要改权限**。
- 仍未验证的：`wrangler deploy` 是否会因为构建项目名与 `wrangler.toml` 的 `name` 不一致而报错
  —— 之前那条 `npx wrangler deploy` 已经读过配置并且只抱怨缺入口点，说明它至少能解析出
  `name = "text-only-blog"`；但**没有实测过名字不一致的情形**。下一次日志见分晓。
- 也仍未验证：`not_found_handling = "404-page"` 是否真的把 `out/404.html` 服务出来
  （这是文档里的标准写法，但本项目没跑过真环境）。

**顺带记两条**：

- `npx wrangler ...` 在云构建里是**临时下载** wrangler（日志里 `will be installed: wrangler@4.144.0`），
  每次构建版本都可能变；Workers Builds 文档写明它「uses the Wrangler version set in your `package.json`」，
  所以把 `wrangler` 写进 `devDependencies` 能同时钉住云构建与本机 `npm run deploy` 的版本。
  目前仓库里**没有**这个依赖，本地跑 `npm run deploy` 会找不到 `wrangler` 命令。
  这次仍**没加**：要改 `package.json` 就得同步锁文件，而本环境没有 shell（见下一条），
  写了会造成 `package.json` 与锁文件不一致 —— 要做就一次做干净。
- 如果 Deploy command 选项里允许填 `npm run deploy`，也可以那样填（等于走仓库里那条脚本）；
  但脚本名与参数分散在两处，改起来反而容易漏，直接把命令写在构建设置里更好查。

**顺带发现的第二个坑：仓库里没有锁文件**（与本次部署报错无关，但迟早会咬人）

`ls` 仓库根目录只有 `package.json`，没有 `package-lock.json` / `bun.lock` / `yarn.lock`；
云构建日志里那句 `bun install` 之后的 **`Saved lockfile`** 说明锁文件是在构建容器里现生成、随后丢掉的
（所以每次构建都 `Resolved, downloaded and extracted [1306/1308/1306]` 来回跳，依赖版本每次重新解析）。后果：

1. **`.github/workflows/deploy.yml` 现在跑不起来**：它用 `npm ci` + `setup-node` 的 `cache: npm`，
   而这两者都要求仓库里有 `package-lock.json` —— 没有锁文件时 `npm ci` 会直接报
   「can only install with an existing package-lock.json」，`cache: npm` 也会因找不到锁文件而失败。
   修法二选一：把锁文件提交进仓库（本机 `bun install` 后提交 `bun.lock`，并把 workflow 换成
   `oven-sh/setup-bun` + `bun install --frozen-lockfile`，与云构建的行为一致），
   或把 workflow 改成 `npm install`（放弃锁定与缓存）。
2. **依赖版本不受控**：站点的 `next 16.3.1` 是写死的，但 `^` 区间里的依赖（mermaid / echarts / katex 等）
   每次云构建都可能换小版本。这个站是纯静态导出，出问题的概率不低，值得早钉。
3. 这两件事都要在**有 shell 的机器上**做（本环境无 shell，跑不了 `bun install` 生成锁文件），
   所以留给第 14 项（交付）一并处理，已记进下面的跨项待办。

### 跨项待办（做到对应项时顺手勾掉）

- **第 7 项（框架 UI / 设置中心）—— 已完成**，这条留档并转成「后续项要用到的东西」：
  1. ✅ 外观选择器走 `lib/theme.ts` 的 `setThemeChoice()` / `THEME_CHOICES` / `THEME_LABELS`，
     当前选中项读 `currentThemeChoice()`；**没有**第二份 localStorage 与 `data-theme` 读写；
     `THEME_LABELS.hint` 已从「一句中文」改成 `{ zh, en }`（英文界面不该冒中文）；
  2. ✅ 阅读偏好在 `lib/prefs.ts`：三档选项表 + 首帧脚本（`PrefsInit`）+ 写入 `--reading-*`。
     档位值就定在 `READING_WIDTHS / SIZES / LEADINGS` 里（34/42/52rem、0.98/1.0625/1.18rem、1.6/1.85/2.1）；
  3. ✅ 顶栏、页脚、抽屉全部用令牌与 `.panel`，没有写死颜色，`dark:` 变体一个也没有。
- **第 9 项（首页）—— 已完成**，这条留档并转成「后续项要用到的东西」：
  1. 首页的**版面与文案只有一个事实来源**：`lib/home.ts` 的 `HOME_ROWS`（哪几栏、哪两栏并排）
     与 `HOME_TEXT`（中英各一份）。`app/[lang]/page.tsx` 只负责「把行渲染成 <section> +
     把数据传进去」，**不要**在页面里调顺序或加栏 —— 加一栏 = 表里加一行 + 一个组件 + `blocks` 里补一条
     （`Record<HomeBlockId, ReactNode>` 是穷尽的，漏了 TypeScript 直接报错）；
  2. 栏号（01~08）由 `homeNumber()` 从版面表推出来，**别在文案里手写编号**；
  3. 吸附用 `html:has(.home-flow)` 那一条 CSS（不认 `<html>` 上的 class，也不需要 JS）；
     要加新页面而**不想**让它吸附，什么都不用做 —— `:has()` 只认领首页那个容器；
  4. ✅ 第 11 项（文章卡片三档密度）已落地：卡片是 `components/list/PostCard.tsx`，
     `HomePostCards` 已经换成它 —— 首页用的是**适中档**（与这一栏原来的样子一致），
     不是「紧凑档」（紧凑档只有标题 + 日期 + 时长，会把这一栏的摘要去掉，所以没那么选）。
     卡片上的小字跟着卡片走（`lib/list.ts` 的 `LIST_TEXT`），`lib/home.ts` 里的
     `posts.minutes` / `articlePending` 已删，别再加回来；
  5. 第 12 项（文章页）落地后，把 `lib/site.ts` 的 `ARTICLE_ROUTE.status` 改成 `"ready"`
     —— 首页与列表页的文章卡片会一起变成真链接（约定第 8 条的那套做法）；
  6. 第 13 项的 `/[lang]/settings/` 页与首页第 7/8 栏用的是同一套组件与 API，别在那边另写一份。
- **第 13 项**：页面落地后把 `lib/site.ts` 的 `ROUTES[id].status` 从 `"pending"` 改成 `"ready"`
  —— 顶栏、页脚、`RouteLink` 的入口会一起生效；新页面同时加进 `app/sitemap.ts` 的 `pageRoutes()`
  （第 10 项已经按这条办过：`ROUTES.posts` 已是 `"ready"`，sitemap 里也补了列表页两行）。
- **第 12 项（文章页）**：正文宽度一律用 `--reading-measure`（读者的阅读偏好要能生效），别写死 42rem；
  frontmatter 的 `typography` 字段接到 `renderMarkdown` 的 `RenderOptions.typography`（渲染层已支持）。
- **第 13 项（设置页）**：`/[lang]/settings/` 直接复用 `components/SettingsCenter.tsx`（它不管容器），
  不要另写一套；落地后把 `ROUTES.settings.status` 改成 `"ready"`。
- **第 8 项（装饰与动效）—— 已完成**，这两条留档并转成「后续项要用到的东西」：
  1. 新增一张图纸 = `lib/decor.ts` 的 `PATTERNS` / `SHEETS` 各加一行 + `app/globals.css` 加一条
     `[data-decor="…"]`；**不要**在组件里写 `if (pathname === …)`，图签名字也别在页面里手抄；
  2. 层序没变：蓝图层 `-1`（装饰整层 + 右下角图签都在里面）、吸顶顶栏 `20`、齿轮 `40`、
     遮罩 `45`、抽屉 `50` —— 新的装饰层别插到 20 以上；
  3. 「纸质颗粒」没做（理由见第 4 节第 8 项末条）：要加就给 `.blueprint` 补第五层背景，
     只动 `app/globals.css`，别为它引图片资源。
- **第 6 项留下的已知缺口**：
  1. **abc（五线谱）在暗色外观下仍是深色线条**（abcjs 用自己画出来的 `<path>`，颜色不跟令牌）。
     没有真浏览器确认过它的配色入口（是 `foregroundColor` 之类的选项还是靠 `add_classes` 出来的 CSS 类），
     所以第 6 项没动它；第 12 项用真图对着调。mermaid / echarts / graphviz / smiles 都已经跟主题走；
  2. 三套令牌的对比度、蓝图层在三套外观下的观感，只在纸面上推演过，需要你本机看一眼（见第 8 节）。
- **第 12 项（文章页）**：
  1. 把 frontmatter 的 `typography` 字段接到 `renderMarkdown` 的 `RenderOptions.typography`
     （渲染层已经支持，规范写在 `content/README.md` 第 9 节）；
  2. 文章页如果写了 `alternates`，记得把根布局里那两条 RSS `types` 补回去（见上）；
  3. 文章页落地后，sitemap 与 RSS 里的文章 URL 才是真的可访问（在那之前它们指向 404）；
  4. 顺手删掉 `components/dev/PipelineCheck.tsx` 与 `app/[lang]/page.tsx` 里的那三行。
- **第 10 项（列表页）—— 已完成**，留档并转成「后续项要用到的东西」：
  1. 搜索读的是 `/search-index.json` 的 `fields` 与 `version`（唯一事实来源仍是 `lib/search-index.ts` 的
     `SEARCH_FIELDS` / `SEARCH_INDEX_VERSION`）。**客户端不能值导入 `lib/search-index.ts`**（它 `import`
     了 `lib/content.ts` 的 node:fs）—— 版本号由服务端页面当 props 传（`indexVersion`），
     `lib/list.ts` 对那两个文件一律只用 `import type`；
  2. 新页面要表达「跳到某一类文章」时，直接链 `/zh/posts/?tag=<标签>` 或 `?cat=<分类>`
     （第 13 项的标签 / 分类页就靠这个，别自己再实现一遍筛选）；筛选项的编解码只有
     `lib/list.ts` 的 `listQueryString` / `parseListQuery` 一处实现；
  3. 文章卡片只有一份实现（第 11 项的 `components/list/PostCard.tsx`），复用即可；
  4. 密度存在 localStorage 的 `tob:list-density`（偏好，不进地址栏），筛选进地址栏（可分享）；
  5. 索引读不到时会自动退回「本页字段」并把这件事写在页面上 —— 若你本机看到的是那句提示，
     说明 `out/` 里 `/search-index.json` 的产物路径不对，把 `ls out` 的结果发我（见第 8 节）。
- **第 13 项（其余页面）**：新页面加到 `app/sitemap.ts` 的 `pageRoutes()`；
  离线页的文案也归这一项。
- **第 14 项（交付）**：**把锁文件提交进仓库**（现在仓库里没有锁文件，`next build` 之外的依赖版本
  每次云构建都重新解析；workflow 已被迫从 `npm ci` 改成 `bun install`，等有锁文件后可以加
  `--frozen-lockfile` 把版本钉死 —— 详见第 4 节「顺带发现的第二个坑」）；
  顺手考虑把 `wrangler` 写进 devDependencies 钉住部署工具的版本
  （现在 `npm run deploy` 是 `npx --yes wrangler deploy`，每次现下载；
  Workers Builds 也只认 `package.json` 里那个版本）——
  这两件事都需要在有 shell 的机器上 `bun install` 后一起提交，别只改 `package.json`；
  PNG 图标（192 / 512）如果不打算做，就在 README 里写明「只提供 SVG 图标」；
  另外确认 Cloudflare 构建设置里的 Deploy command 是默认的 `npx wrangler deploy`（见第 7 节）。
- `content/README.md` 新增第 9 节（原文第 9 节「常见报错」顺延为第 10 节），
  `content/{zh,en}/posts/README.md` 各加了一行指路。

---

## 5. 约定与规则（重要）

1. **仓库不含任何文章。** `content/**/posts/` 只放 `README.md`（写作规范），加载器显式跳过该文件名；不写测试文章、不写示例文章。
2. **需要作者补内容的地方统一标「编辑此处」**，包括：站点标语/描述、首页各栏文案、关于页、友链、演示段落、头像与 favicon 资源位。
3. **UI 文案不算文章**，由 `lib/site.ts` 的 i18n 表统一维护（中英各一份，缺一边会出现 `undefined`）。
4. 零文章、零配置时站点必须仍能构建与浏览，所有页面要有空状态。
5. 动效一律尊重 `prefers-reduced-motion`，且背景/装饰层不得影响正文可读性（`aria-hidden`、`pointer-events: none`）。
6. **开发态自检不是内容**：`components/dev/PipelineCheck.tsx` 只为在文章页之前验证渲染器而存在，
   生产构建里不渲染、不进产物；第 12 项落地后删掉它和 `app/[lang]/page.tsx` 里那三行即可。
7. **外观只有一个落点**（第 6 项起）：颜色只在 `app/globals.css` 的令牌里定义，页面里用语义色
   工具类（`text-ink-muted` / `bg-surface` / `border-rule` / `text-accent`）；
   不写 `dark:` 变体（三套外观，两态表达不了）、不写死色值、不动 `<html>` 上的 `data-theme`
   （要切换外观就调 `lib/theme.ts` 的 `setThemeChoice()`）。
   唯一的例外是设置中心那几颗**外观预览色块**（`.theme-chip`）：它预览的是另外两套外观，
   只能写死，改令牌时要同步那一处（见第 4 节第 7 项）。
8. **链接的可用性只有一个事实来源**（第 7 项起）：站内链接一律走 `components/RouteLink.tsx`，
   而它读 `lib/site.ts` 的 `ROUTES[id].status`。页面还没做就写 `"pending"`（渲染成不可点、悬停说明
   由第几项落地），做完改成 `"ready"` —— 不在页面里写死 href、也不留会 404 的死链。
   阅读偏好同理：只写 `--reading-*` 令牌（`lib/prefs.ts`），别在组件里直接改字体大小。
9. **列表与卡片各只有一份实现**（第 10/11 项起）：文章卡片一律用 `components/list/PostCard.tsx` 的三档
   （`data-density` 交给 CSS），新页面不要另写一份卡片；「只显示某一类文章」一律用列表页的查询串
   （`/zh/posts/?tag=…`、`?cat=…`、`?year=…`、`?sort=…`、`?density=…`），编解码只在 `lib/list.ts`。
   偏好与筛选分家：**筛选进地址栏**（可分享、可收藏），**偏好进 localStorage**（`tob:list-density` 等）。

---

## 6. 本地命令

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器，访问 / 会自动分流到 /zh/
npm run typecheck    # tsc --noEmit：只查类型，不产出（比 build 快，改完代码先跑它）
npm run build        # 生产构建：搜索索引 / RSS / sitemap / robots / manifest / 更新日志都在这一步生成
npm run preview      # 本地预览 out/ 静态产物（Service Worker 只在这里能用上）
npm run deploy       # wrangler 部署到 Cloudflare Workers（静态资源）
```

> 第 5 项之前，`build` 会因为 `prebuild` 指向不存在的 `scripts/*.mjs` 直接失败；
> 现在那个钩子已经删掉，`dev` 与 `build` 都可以跑。
> 另注：`npm run deploy` 用的 `wrangler` 目前**没有写进 devDependencies**，
> 本机部署前先 `npx wrangler --version` 或全局装一个（这事留给第 14 项一并处理）。

`npm run dev` 后打开 `/zh/`：第 7 项之后**左下角有一颗齿轮**，点开就是设置中心 ——
外观（四选一）、正文宽度 / 字号 / 行距、语言切换、恢复默认都在里面，这是读者的正式路径。
下面这个 `?theme=` 调试参数仍然有效（它不写 localStorage、刷新即失效），用来快速对照三套令牌：

```bash
# 纸（默认）/ 亮 / 暗
http://localhost:3000/zh/?theme=paper
http://localhost:3000/zh/?theme=light
http://localhost:3000/zh/?theme=dark
```

外观之外，第 8 项的「一张图纸」也能这样对照（对照表在 `lib/decor.ts`）：
`/zh/` 整幅图纸 · `/zh/posts/` 分栏线（图签 `TOB-ZH-02`，第 10 项已落地）· 文章页左边缘刻度尺 ·
`/zh/tags/` 密格 · `/zh/categories/` 剖面线 · `/zh/search/` 点阵 · `/offline/` 空纸；
第 11~13 项落地之前，只有首页与列表页能真的看到（其余路径还不存在，敲进去会落到 404 页，
此时蓝图层按 `unknown` 画、图签印 `TOB-ZH-00` —— 这是预期行为）。

除了首页占位，还会看到一块「渲染管线自检」，
里面把第 3 项的 GFM、公式、代码高亮、五类图表、参考文献角标、目录抽取，
以及第 4 项的中文排版（含 `typography: false` 的对照组）全跑一遍，
用来在还没有文章的时候确认渲染器是通的。

构建产物（第 5 项）在 dev 下也能直接访问，它们是按需求值的 Route Handler：
`/feed.xml`、`/zh/feed.xml`、`/search-index.json`、`/changelog.json`、`/sitemap.xml`、`/robots.txt`。
零文章时每个都应返回**合法但为空**的内容（空 channel、`docs: []`、只有首页的 sitemap）。

---

## 7. 部署

**方案变更（2026-09-30，第五次云构建后）**：部署目标从 **Cloudflare Pages** 改为
**Cloudflare Workers 静态资源**。原因不是偏好，而是鉴权：本站的云构建是 **Workers Builds** 项目，
它自动生成的 API token 只含 Workers 权限（没有 Pages），而 Pages 部署必须用带
`Cloudflare Pages: Edit` 的 token —— 试了四次都没绕过去（详见第 4 节「部署失败」）。
Workers 静态资源用的是该 token 本来就有的 `Workers Scripts: Edit`，**不用碰任何权限设置**。
代价：站点从 Pages 项目变成同名 Worker，原先 Pages 上的自定义域名/预览链接要重新绑定。

- 平台：Cloudflare Workers（静态资源），产物目录 `out/`（见 `wrangler.toml` 的 `[assets] directory`）。
- 云构建侧：Deploy command 用回默认的 **`npx wrangler deploy`**（不需要任何参数：
  Worker 名读 `wrangler.toml` 的 `name`，产物目录读 `assets.directory`）。
- `wrangler.toml` 的关键三项：`name = "text-only-blog"`、`[assets] directory = "./out"`、
  `not_found_handling = "404-page"`（让 `out/404.html` 接管未知路径）。
  `html_handling = "auto-trailing-slash"` 是默认值，与 `next.config.ts` 的 `trailingSlash: true` 一致，写出来只为明确意图。
  依据：Cloudflare 文档《Workers → Static Assets → Routing → Static Site Generation (SSG) and custom 404 pages》。
- 本地部署：`npm run deploy`（= `npx --yes wrangler deploy`）。
- CI：`.github/workflows/deploy.yml`，push 到 `main` 触发；`fetch-depth: 0` 是必须的
  （更新日志在 `next build` 期间读 `git log`，浅克隆会让记录不全 —— 拿不到 git 时构建不会失败，
  但那份 `changelog.json` 会是空的）。
  - 该 workflow 原来用 `npm ci` + `setup-node` 的 `cache: npm`，而仓库里**没有锁文件**，
    这两者都会直接失败（见第 4 节「顺带发现的第二个坑」）；本次一并改成
    `oven-sh/setup-bun@v2`（bun 1.2.15，与云构建同版本）+ `bun install`。
  - Deploy 步骤是 `cloudflare/wrangler-action@v3`，`command: deploy`（不写参数，交给 `wrangler.toml`）。
  - 需要在仓库 Secrets 配置：`CLOUDFLARE_API_TOKEN`（**Workers Scripts: Edit** 即可，用
    Cloudflare 的「Edit Cloudflare Workers」模板就行，不再需要 Pages 权限）、`CLOUDFLARE_ACCOUNT_ID`。
- `wrangler.toml` 里的 `name`（= Worker 名）与云构建项目名必须一致，改名时两处一起改。
- 若之后要绑自定义域名：Workers & Pages → 该 Worker → Settings → Domains & Routes。
- 部署前值得自己在本地跑一遍 `npm run build && npm run preview`：静态导出有多少坑（路由产物路径、
  Service Worker、离线页）只有真跑一次才看得见。

---

## 8. 验证状态说明（如实）

构建期脚本与依赖均在**无 shell 环境**下书写，未在本机执行 `npm install` / `npm run build` / 测试。
因此：

- 已完成的代码属于「写完即交付」，实际编译与运行结果以你本地执行为准；
- 有报错直接把日志贴给我，我按证据修；
- 每次交付后本文件的进度表与「已完成 / 进行中」小节会同步更新。
- **2026-09-30 的首次云构建**：`bun install` → Turbopack 编译 → 内容管线都通过了，
  挂在**类型检查**（`lib/markdown.ts` 两处 `TS2345`，详见第 4 节「构建修复」）。
- **2026-09-30 的第二次 / 第三次云构建**：上面那两处类型错误**确认修好**（两次都是
  `Running TypeScript` 3.6–3.7s 通过、静态导出 14/14 页），构建阶段连续两次 `Success`；
  失败点都在**部署命令**上 —— 第二次填了 Workers 的 `npx wrangler deploy`，
  第三次把 `wrangler` 打成了 `wrangLer`（npm 包名不允许大写，直接 404）。
  两次日志合起来说明：`out/` 确实被静态导出产出（否则 Pages 部署也无从谈起），
  但**产物清单**（`feed.xml` 是否为目录、sitemap/robots/manifest 是否在根）仍需 `ls out` 确认。
- **2026-09-30 的第四次云构建**：构建第四次通过（TS 3.4s、14/14 页，`Success: Build command completed`）；
  部署失败有两个原因 —— Deploy command 里 `out` 与 `--project-name` 之间**少了空格**，
  以及**构建环境的 API token 没有 Pages 权限**（`Authentication error [code: 10000]`，
  这是 Workers Builds 自动生成 token 的固有权限范围）。当时选的路径 A（保留 Pages + 换 token）
  **随后被推翻** —— 第五次构建后改用 Workers 静态资源，见下面两条。详见第 4 节「部署失败」。
  ⚠️ 到本文档更新为止，**还没有一次成功的部署**，也就是说 Pages 上线的产物一个都还没被验证过。
- **2026-09-30 的第五次云构建**：构建照旧通过；Deploy command 已修正成
  `npx wrangler pages deploy out --project-name=text-only-blog`（与 workflow 一致），
  但仍报 `Authentication error [code: 10000]` —— 说明该构建实际使用的 token 依旧没有 Pages 权限，
  报错点早于产物上传。判别办法见第 4 节「怎么确认到底用的哪个 token」。
- **改用 Workers 静态资源（本次提交）**：`wrangler.toml` / `package.json` / workflow 三处已按第 7 节改完，
  云构建的 Deploy command 只要填回默认的 `npx wrangler deploy` 即可，**不涉及任何 token 权限改动**。
  ⚠️ 这次改动**没有在本机跑过 `wrangler deploy`**（本环境无 shell），
  首次真实上传的结果以你下一次构建日志为准；若报错请把日志贴回来。

已经做过、但只有你本地能确认的事：

- `katex/contrib/mhchem` 的导入路径对着 katex 0.16.22 的 `exports` 字段核对过
  （`./contrib/mhchem` → `dist/contrib/mhchem.mjs`，是副作用模块，`\ce` 会注册到同一个 katex 实例上）；
- 图表库（mermaid 11 / echarts 5 / @hpcc-js/wasm-graphviz 1 / abcjs 6 / smiles-drawer 2）都只在本仓库里
  **动态 import**，没有做「先跑一遍」的验证；它们的导出形状（默认导出 vs 具名导出）在代码里两种都试，
  真的不匹配会在图的位置上打印明确的报错；
- Graphviz 的 `.wasm` 由 `@hpcc-js/wasm-graphviz` 自己加载，若首次打开报 wasm 404，把那句报错贴给我；
- 第 3 项的外观在第 6 项已**整体换掉**：原来 `app/globals.css` 里那节「最小可读样式」里写死的
  颜色（`--body-fg`、`#272822` 之类）现在全部走 `--c-*` 令牌，只在图表主题那一块保留原样；
  图表主题原本跟随 `prefers-color-scheme`，第 6 项已改成读站点外观（`<html data-theme>`）
  并把令牌喂给渲染器（`ChartContext` 多了 `theme` / `colors`），主题切换时会自动重绘；
- 第 4 项（中文排版优化）已接进 `lib/markdown.ts` 的管线，位置在 `remarkCitations` 之前；
  规则与「为什么不会误伤代码/公式/数字」写在 `lib/typography.ts` 的头部注释里，
  但那套字符分类与配对逻辑**只在本机跑过一次就交付**，边界情况（尤其括号配对、中日文混排）
  请用 `npm run dev` 的首页自检对照着看。
- 第 5 项（构建产物）**有一处方案变更**：改成在 `next build` 里生成，而不是 `scripts/*.mjs` + `prebuild`
  （理由见第 4 节第 5 项开头）。依据是 Next 16 官方文档《Static Exports》里关于 GET Route Handler 与
  `sitemap.xml` / `robots.txt` / `manifest.json` 的说法，文档是现查的、**代码本身没跑过构建**。
  需要你本机确认的三件事，按怀疑程度排序：
  1. **`/feed.xml`、`/search-index.json`、`/changelog.json` 的产物路径**。文档示例是
     `app/data.json/route.ts` → `data.json`，但本仓库开了 `trailingSlash: true`，
     我**没能从文档里确认** Route Handler 会不会也被加上尾斜杠（变成 `out/feed.xml/index.html` 之类）。
     `npm run build` 后看一眼 `ls out` 就知道；真有问题最省事的修法是把这三个文件改成
     `public/` 下的静态文件、由一个 script 生成 —— 告诉我，我来改。
  2. **sitemap / robots / manifest 是否真的落到 `out/` 根目录**（同样只有 `ls out` 才知道）。
  3. **`app/manifest.ts` 的字段是否都在 Next 的 `MetadataRoute.Manifest` 类型里**
     （我用了 `lang` / `dir` / `id` / `categories` 这些规范里的字段；`npm run typecheck` 会直接指出哪个不在）。
- **第 10 / 11 项（列表页与卡片）也没在本机跑过浏览器**，请按顺序看这几件事：
  1. **产物路径（最要紧的一条）**：`npm run build` 之后 `ls out`，确认三件事 ——
     ① `out/zh/posts/index.html` 与 `out/en/posts/index.html` 在（列表页两语言）；
     ② `out/search-index.json` 是**文件**（这一条从第 5 项起就没被验证过：`trailingSlash: true`
     下 Route Handler 会不会也被加上尾斜杠，变成 `out/search-index.json/index.html`）；
     ③ `out/sitemap.xml` 里出现 `/zh/posts/` 两行。
     ②若不对，**页面上会有明确表现**：搜索框下面写「索引没读到，这一次只匹配本页已有的标题 / 标签 / 分类 / 摘要」，
     而搜索仍然能用（兜底路径）。把 `ls out` 的结果发我，我改成「构建期写进 `public/`」的静态文件；
  2. **没有 JS 也能读**：禁用 JS（或直接看 `curl /zh/posts/` 的 HTML）应当看到完整列表与卡片 ——
     工具栏是增强，不是前提；零文章时应当只有空状态、**没有**工具栏；
  3. **搜索**：第一次输入时才应看到 Network 里出现 `/search-index.json` 与 fuse.js 的 chunk；
     中文词、标签名、正文里的词各试一次（正常路径应提示「结果来自构建期索引，含每篇正文的前 1200 字」）；
  4. **筛选**：标签 / 分类组内是「或」、组与组之间是「且」（选两个标签 + 一个年份 = 两个标签任一 + 那一年）；
     地址栏应跟着变成 `?tag=…&year=…`，把地址粘到新标签页打开应当还原同一份筛选（含密度 = 偏好仍取本机）；
  5. **密度**：切到「紧凑」或「内容」后刷新，应当记得上次选的（localStorage 的 `tob:list-density`）；
     「内容」档在宽屏上应当一行一篇、摘要按你选的 `--reading-*` 度量排（与设置中心联动）；
  6. **首页第 2 栏**：卡片外观应当与改造前**基本一致**（第 11 项把首页卡片换成了共用组件，
     只由 `.home-posts .post-card` 覆盖回画布色 / 内边距 / 字号）—— 若发现首页卡片变了样，
     说一声，我调那两行覆盖；
  7. **打印预览**：工具栏不应出现在纸上，列表按当前筛选结果排成一条、宽度不受限。
- **第 11 项的三档「内容」档**停在「摘要 + 全部元信息」，**不重复正文**：那是第 12 项文章页的事。
  若你期望列表页直接给出全文（正文进列表页），说一声 —— 那要把每篇正文也传进客户端组件，
  首屏体积会明显变大，取舍我留给你定。
- Service Worker（`public/sw.js`）与离线页只做了「逻辑上自洽」，没在任何浏览器里跑过。
  `npm run preview` 之后确认三件事：Application → Service Workers 里注册成功；
  断网（DevTools → Network → Offline）刷新仍能看到离线页；
  第二次访问同一篇文章时 Network 里该页面走的是 `(ServiceWorker)` 而不是 `(Disk cache)`/网络。
- 第 6 项（设计系统）**没在本机跑过任何浏览器**，下面这几件事只有你看起来才作数：
  1. **三套外观各看一遍**：`/zh/?theme=paper`、`?theme=light`、`?theme=dark`
     （或者把 localStorage 的 `tob:theme` 设成 `paper|light|dark|system` 刷新）。
     重点看两处：正文对比度够不够、蓝图网格有没有抢字（愿意的话把 `--bp-line` 的透明度调小再看一遍）；
  2. **首帧不闪白**：选择暗色后硬刷新，正常应该直接是深色 —— 如果先闪一下亮色，
     说明 `components/ThemeInit.tsx` 被放到了 body 的非首位（或 Next 把它挪走了），告诉我，我换成别的注入方式；
  3. **`<html>` 上的属性与 `meta theme-color`**：Elements 面板里应当是
     `<html data-theme="dark" data-theme-choice="system" style="color-scheme: dark">`，
     head 里只有一个 `meta[name="theme-color"]`（内容跟着主题变）；
  4. **图表跟着主题重绘**：开着有图表的自检内容，切换主题（改 localStorage + 刷新，或控制台里
     `document.documentElement.dataset.theme = "dark"` 然后手动派发事件），
     看 mermaid / echarts / graphviz 有没有换成对应的配色；graphviz 若报语法错，
     就是 `components/charts/graphviz.ts` 里那段默认属性注入的问题，把那三行删掉即可（我会同步改）；
  5. **iOS Safari 的负 z-index**：蓝图层是 `position: fixed; z-index: -1`，
     在 `<html>` 有底色的前提下各家浏览器表现一致；如果你在手机上看到底色被盖住或者整页变灰，告诉我。
- 第 6 项里唯一「查过文档」的是 Tailwind 4 的 `@theme inline`（用它才能让工具类引用变量、
  而不是把颜色值烤进 CSS）；其余都是照 CSS 规范写的，没跑过构建，`npm run typecheck` 先跑一遍。
- **第 7 项（框架 UI）也没在本机跑过浏览器**，下面这几件事请你按顺序看一遍：
  1. **`npm run typecheck`** —— 这一项新增 8 个组件与 2 个 lib 文件，类型面比前几项大；
     特别留意 `lib/icons.ts` 的 24 个深路径导入（名字都对着 iconify 的 API 核过，
     但包里文件是否齐全只有装完依赖才知道）；
  2. **顶栏三段在桌面与手机上的换行**：窄屏时品牌 / 导航 / 图签会逐段折行 ——
     图签区的虚线左边框折行后可能显得突兀，觉得碍眼就把 `.site-titleblock` 的
     `border-left` 在窄屏媒体查询里去掉（那一条已经写好了，加两行即可）；
  3. **吸顶顶栏 + 蓝图背景层**：顶栏是半透明底 + `blur(8px)`，滚过蓝图网格时会不会显得脏
     （嫌脏就把 `color-mix` 的那个 88% 调高，见 `.site-header`）；
  4. **左下角齿轮**：手机上（尤其带手势条的机型）会不会挡住正文最后一行或与浏览器自己的
     悬浮控件打架；页脚专门留了 4.75rem 下边距，其他页面的 `.page` 留了 4rem；
  5. **设置抽屉**：Esc 能关、点遮罩能关、打开时背景不跟着滚、Tab 焦点不会跑到抽屉后面
     （目前没有做完整的焦点陷阱，只把焦点移进抽屉 —— 觉得不够严谨告诉我，我加一层循环）；
  6. **阅读偏好**：选「窄 + 大 + 宽松」后**硬刷新**，正文应当一帧就是设置好的版面，
     不该先看到默认版面再跳（若跳，说明 `PrefsInit` 被挪到了 body 非第二个位置）；
     再开 DevTools → Elements 看 `<html style="--reading-measure: 34rem …">` 是不是写上了；
     「恢复默认」后这几个行内变量应当**被移除**（不是设回默认值）；
  7. **外观按钮**：连点四下应当依次是 跟随系统 → 纸 → 亮 → 暗 → 跟随系统，
     图标与悬停提示跟着变；在设置中心里点某一套，顶栏那颗按钮的图标也要跟着变
     （两者通过 `subscribeTheme` 同步，这条没跑过真浏览器）；
  8. **语言切换**：在 `/zh/` 点进设置抽屉里的「English」，应当到 `/en/`（带尾斜杠），
     回来时偏好设置保持不变；
  9. **未落地的入口**：顶栏除了「首页」以外都应该是压暗、点不动、悬停有「第 N 项落地」提示；
     页脚的邮箱 / GitHub / 源码三行显示「编辑此处」不可点，RSS 那一行可以点开（`/zh/feed.xml`）；
  10. **打印预览**（Ctrl+P）：设置入口与抽屉不应出现在纸上，顶栏不再吸顶。
- **第 8 项（装饰与动效）同样没在本机跑过浏览器**，图案的几何与层叠只能靠推演，请按顺序看：
  1. **能对照的只有两张图纸**：第 10~13 项还没落地，所以「首页（整幅图纸 + 虚线图框）」与
     「未知路径（`unknown`，图签印 `TOB-ZH-00`）」之外都点不到 —— 顶栏其余入口是 `RouteLink`
     的 pending 态（压暗、不可点）。想在地址栏硬敲 `/zh/tags/` 看密格图案，静态导出里那条路径
     还不存在，服务器会给 `out/404.html`，此时蓝图层按 `unknown` 画 —— **这是预期，不是 bug**；
     换页重铺那 0.32s 也因此暂时只能用浏览器前进/后退（同文档内的客户端跳转）来看。
  2. **`data-decor` 是否真的落在首屏 HTML 上**：`curl` 或查看源代码，应能在那个 div 上看到
     `data-decor="sheet" data-route="home"`（首页）。如果水合之后才出现图案，
     说明构建期那次 `usePathname()` 给了别的值 —— 把那一段 HTML 贴给我。
  3. **右下角图签**：桌面宽屏应看到 `TOB-ZH-01` + 「首页」两行小字，窄于 48rem 不印；
     它与页脚重叠时被盖住是预期的（它在 `z-index: -1` 那一层）。
  4. **印刷与动效**：`prefers-reduced-motion: reduce` 下不应有任何淡入（顶栏光标也不再闪）；
     打印预览里蓝图层整层不出现（第 6 项的 `@media print` 已关掉它）。
  5. **手机上滚动是否掉帧**：装饰层是「固定定位 + 最多四层 CSS 渐变」，没有图片与滤镜
     （全站唯一的 `backdrop-filter` 是顶栏那个 `blur(8px)`）。若滚动发涩，
     先把粗格那一层（`--bp-grid-major`）从 `.blueprint` 的 `background-image` 里去掉再看 —— 那层最费。

---

## 9. 变更记录（台账自身）

| 日期 | 变更 |
| --- | --- |
| 本次提交 | 建立台账；第 1 项脚手架完成；第 2 项内容管线开工 |
| 本次提交 | 第 2 项内容管线完成（TOML/YAML 双 frontmatter、内容加载与查询、写作规范）；第 3 项 Markdown 渲染完成（GFM/KaTeX+宏/高亮/五类图表按需加载/参考文献角标/目录）；新增开发态渲染自检 |
| 本次提交 | 第 4 项中文排版优化完成（`lib/typography.ts`：补空格 / 标点与成对括号转全角 / `...`→`……`，四条规则可开关，代码与公式与链接地址自动跳过）；自检加两组对照；写作规范新增第 9 节 |
| 本次提交 | 第 5 项构建产物完成（方案改为在 `next build` 内生成：`/search-index.json`、`/feed.xml` + 每语言 RSS、`/sitemap.xml`、`/robots.txt`、`/manifest.webmanifest`、`/changelog.json`；PWA：`public/sw.js` + `/offline/` + 注册组件 + `favicon.svg`）；删除失效的 `prebuild`/`predev`（它们一直是 `build` 失败的根因）并新增 `typecheck`；新增「跨项待办」小节 |
| 本次提交 | 第 6 项设计系统完成（`app/globals.css` 三套令牌：纸/亮/暗 + `@theme inline` 映射成语义色工具类；`lib/theme.ts`：选择解析、首帧脚本、运行时 API、令牌读取；蓝图草图背景层；`.page`/`.panel` 原子件与正文度量 `--reading-*`；占位页面改用令牌）。图表跟随主题：`ChartContext` 扩成 `{theme, dark, colors}`，ArticleBody 订阅外观变化后重绘，mermaid/echarts/graphviz/smiles 改用令牌（abc 留作待办）。manifest 配色改用 `THEME_CHROME` |
| 2026-09-30 | 首次云构建的修复：`lib/markdown.ts` 的 autolink / katex 选项改成显式标注 `Options` 的常量（TS2345）、删掉 `rehype-katex` 不允许的 `throwOnError`、把 vfile 消息并进 `warnings`；`tsconfig.json` 按 Next 16 的 mandatory changes 改 `jsx: react-jsx` 并补 include |
| 2026-09-30 | 第二次云构建：类型检查与静态导出（14/14 页）通过，确认上次修复生效；部署失败定位为**命令填错**——`npx wrangler deploy` 是 Workers 命令，Pages 项目要用 `npx wrangler pages deploy out --project-name=text-only-blog`。台账新增「部署失败」小节与第 7 节相应条目，仓库文件未改动 |
| 2026-09-30 | 第三次云构建：构建再次通过（TS 3.6s、14/14 页）；部署失败是**命令名拼错**（`wrangLer`，npm 包名不允许大写 → registry 404）。台账补上正确命令与原因，第 8 节合并记两次部署失败 |
| 2026-09-30 | 第四次云构建：构建通过（TS 3.4s、14/14 页）；部署失败为「命令少空格 + 构建环境 token 无 Pages 权限（`Authentication error [code: 10000]`）」。查文档确认 Workers Builds 自动生成 token 的权限清单与 Pages API 要求的 `Cloudflare Pages: Edit`，据此选定路径 A（保留 Pages + 换 token）并写入操作清单。另发现**仓库无锁文件**（`npm ci` / `cache: npm` 会失败、依赖版本不受控）并记入第 14 项待办。仓库代码与配置仍未改动 |
| 2026-09-30 | 第五次云构建：命令已完全正确（`pages deploy out --project-name=…`）但 `code 10000` 一字未变，判定为该构建实际使用的 token 仍无 Pages 权限（报错早于产物上传）。台账补「怎么确认用的哪个 token」三条判别法与绕开 token 的两条备选路径 |
| 2026-09-30 | **部署目标从 Cloudflare Pages 改为 Workers 静态资源**（避开 Pages 鉴权）：`wrangler.toml` 改为 `[assets] directory = "./out"` + `not_found_handling = "404-page"` + `html_handling = "auto-trailing-slash"`；`package.json` 的 `deploy` 改成 `npx --yes wrangler deploy`；workflow 改名并把 Deploy 步骤改成 `command: deploy`，同时把必然失败的 `npm ci` / `cache: npm` 换成 `setup-bun@v2`（bun 1.2.15）+ `bun install`；两处注释里的 Pages 措辞同步。台账第 2、6、7、8 节与第 14 项待办一并更新。⚠️ 未在本机执行过 `wrangler deploy` |
| 2026-09-30 | 第六次云构建：**构建阶段就失败**（`EJSONPARSE`）—— 上一次提交给 `package.json` 的 `deploy` 留了尾逗号（我的编辑失误，JSON 不允许尾逗号），删掉后重新触发。台账新增「构建失败 —— `package.json` 尾逗号」小节，并记下以后改 JSON 要过 `node -e "JSON.parse(...)"` 这类真正的解析器（`tsc` 不检查 JSON） |
| 本次提交 | **第 7 项框架 UI 完成**：顶栏（品牌 / 导航 / 图签三段，对齐 wunai-blog）、页脚（联系方式 + 版权 + 左下角齿轮）、设置中心抽屉（外观 / 阅读偏好 / 语言 / 恢复默认）。新增 `lib/icons.ts`（本地打包的 24 个图标）、`lib/prefs.ts`（宽度/字号/行距三档 + 首帧脚本 + 写 `--reading-*`）；`lib/site.ts` 扩全为「路由落地状态表 ROUTES + 顶栏导航 + 联系方式 + i18n 文案表」；新组件 `RouteLink`（按 `ROUTES.status` 决定可点/不可点）、`SiteHeader`、`SiteFooter`、`ThemeSwitcher`、`LangSwitcher`、`SettingsDock`、`SettingsCenter`、`PrefsInit`。框架挂到 `app/[lang]/layout.tsx`（第 9~13 项自动带上）；`globals.css` 新增「6b. 框架 UI」一节与 `--frame-width` 令牌，`.page` 内边距收紧到 `2.5rem 1.5rem 4rem`；`THEME_LABELS.hint` 由中文一句改成 `{ zh, en }`；约定新增第 8 条（链接可用性以 `ROUTES.status` 为唯一事实来源） |
| 本次提交 | **第 8 项装饰与动效完成**：新增 `lib/decor.ts`（路径 → 图纸的唯一事实来源：`section` / `pattern` / 两位编号 / 图签语言，纯函数 + 两张穷尽表，零依赖）；`components/BlueprintBackground.tsx` 从空 div 变成 `"use client"` 组件，用 `usePathname()` 挂 `data-decor` / `data-route`，并在换页时让纸面重铺一次（0.32s、首帧不播、尊重 `prefers-reduced-motion`）；`app/globals.css` 新增「5b. 图案随路由变」一节 —— 七套图案（sheet / columns / measure / grid / hatch / dots / plain，全是渐变，无图片、无滤镜、不动布局）+ 右下角图签（`TOB-ZH-01` 之类，窄屏不印）+ `[data-route="article"]` 的边缘淡出微调；`lib/site.ts` 新增 `isRouteId()` 与 `SITE.i18n.decor` 三条文案（图签名字复用导航文案，不重复写十二个）。这一项**未改任何颜色与令牌、未动层序**；「纸质颗粒」未做，理由见第 4 节第 8 项 |
| 本次提交 | **第 10 项列表页 + 第 11 项文章卡片（三档密度）完成**：新增 `app/[lang]/posts/page.tsx`（构建期取文章 / 标签 / 分类 / 年份，零文章出空状态且不出工具栏）、`components/list/PostList.tsx`（客户端：搜索 / 筛选 / 排序 / 密度 / 语言 / 地址栏状态）、`components/list/PostCard.tsx`（三档密度共用卡片）、`lib/list.ts`（筛选状态与默认值、三档密度与排序的选项表、纯函数、查询串读写、密度本机记忆、中英文案 —— 对 `content.ts` / `search-index.ts` 只 `import type`，故客户端可安全引入）；搜索在**第一次输入时**才读 `/search-index.json` 并动态 `import("fuse.js")`，索引读不到 / 版本不匹配时自动退回本页字段并在页面上写明；`ROUTES.posts` 改 `"ready"`（顶栏「文章」可以点了），sitemap 补两行列表页；`lib/site.ts` 新增 `feedAlternatesTypes()`（页面自写 `alternates` 会覆盖根布局那份 RSS 发现表，第 5 项记下的坑先在这里堵上，`app/layout.tsx` 同步改用）；首页第 2 栏换成共用的 `PostCard`（适中档），`lib/home.ts` 删掉 `posts.minutes` / `articlePending`；`lib/icons.ts` 补 11 个图标（筛选 / 时间 / 排序 / 三档密度 / AI / 清除搜索）；`app/globals.css` 新增「6d. 列表页与文章卡片」一节并把 `.home-kicker` 系三个类换成 `home/list` 共用，打印样式隐藏工具栏 |
