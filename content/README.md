# 写作规范（content 目录）

这份文件是**给人看的**：文章怎么写、字段什么意思、代码块用什么语言名。
加载器 [lib/content.ts](../lib/content.ts) 的实现与本文档一一对应；改行为请同步改文档。

> **第一条铁律：仓库里不放文章。**
> 这个目录只保留规范和空的目录结构；所有文章由作者本人手写。
> 名字叫 `README.md` 的文件**永远不会被当成文章**（加载器显式跳过），
> 下划线开头的 Markdown（`_index.md` 例外，见下文）同样跳过，可以用作模板 / 草稿盒。

---

## 1. 目录结构

```
content/
├─ README.md                  ← 本文件
├─ zh/
│  └─ posts/
│     ├─ README.md            ← 中文写作提示，不参与构建
│     ├─ _index.md            ← 可选：中文帖子的顶层卡组元数据
│     ├─ hello-world.md       → /zh/posts/hello-world/
│     ├─ notes/               ← 目录即分组（卡组）
│     │  ├─ _index.md         ← 该卡组的标题 / 描述 / 顺序 / 封面
│     │  └─ first-note.md     → /zh/posts/notes/first-note/
│     └─ notes/index.md       → /zh/posts/notes/（目录首页，可选；不写的话这个地址是卡组页）
└─ en/
   └─ posts/…                 ← 同上，英文
```

规则：

- 只认 `.md` 与 `.markdown`；
- **slug 只能是 URL 安全的 ASCII**（字母 / 数字 / `-._~/`）。文件名用中文没关系，但要自己写一行
  `slug`（见下一条与第 4 节的字段表）—— 直接拿中文当 slug 上线会 404；
- **slug 由文件路径推导**：`notes/first-note.md` → `notes/first-note`；
- `目录/index.md` 代表这个目录本身，slug 就是目录名（`notes/index.md` → `notes`）；
- 需要自定义 slug 时，在 frontmatter 里写 `slug`（或 `permalink`）；
- 两个文件推出同一个 slug 会**直接报错**，不会悄悄覆盖；
- 目录不存在、一篇文章都没有，都属于正常状态，站点照样能构建（列表页出空状态）。

---

## 2. 一篇最小文章

````markdown
---
title: 你好，世界
date: 2026-01-01
tags: [随笔]
---

正文从这里开始。

## 小节标题

一段话。
````

---

## 3. frontmatter 的两种写法

文件第一行是 `---` 就用 YAML，是 `+++` 就用 TOML，两者**完全等价**，挑顺手的一种即可。
（YAML 由 js-yaml 解析，TOML 由本仓库自写的 `lib/toml.ts` 解析。）

### YAML（`---`）

```yaml
---
title: 用 YAML 写的文章
date: 2026-01-01 09:30:00
updated: 2026-01-03
description: 一句话摘要，会用在列表、SEO、RSS 里。
tags: [写作, 折腾]
categories: [随笔]
cover: /thumbnails/zh/yaml-post.png
pinned: false
draft: false
isAI: false
references:
  - id: 1
    title: 一篇参考资料
    url: https://example.com/paper
    author: 张三
---
```

### TOML（`+++`）

```toml
+++
title = "用 TOML 写的文章"
date = 2026-01-01T09:30:00
updated = 2026-01-03
description = "一句话摘要，会用在列表、SEO、RSS 里。"
tags = ["写作", "折腾"]
categories = ["随笔"]
cover = "/thumbnails/zh/toml-post.png"
pinned = false
draft = false
isAI = false

[[references]]
id = 1
title = "一篇参考资料"
url = "https://example.com/paper"
author = "张三"
+++
```

> TOML 的 `date` 不写引号时会按日期时间解析（本仓库统一归一化成字符串）；
> YAML 的 `date` 不写引号时会被解析成时间对象。两种情况下最终语义一致，不必纠结。

---

## 4. 字段表

写用不到的字段可以直接省略。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | 字符串 | **建议必写**。缺省时依次回退到正文第一个 `#` 标题、文件名。 |
| `date` | 日期 | 发布日期。缺省时回退到**文件修改时间**（`dateSource: "mtime"`），建议显式写。 |
| `updated` | 日期 | 最后更新日期，文章页会显示。 |
| `description` | 字符串 | 摘要，用于列表 / SEO / RSS。缺省时从正文自动截取约 160 字。 |
| `tags` | 数组或字符串 | `[a, b]` 或 `"a, b"`（逗号、顿号、分号、竖线都能分隔），自动去重。 |
| `categories` | 数组或字符串 | 同上。 |
| `cover` | 字符串 | 缩略图。不写也可以，见第 7 节。 |
| `pinned` | 布尔 | 置顶，首页列表排在前面。 |
| `draft` | 布尔 | 草稿。生产构建（`npm run build`）**不出现**，`npm run dev` 能看到，方便预览。 |
| `about` | 布尔 | 标记为「关于」类文章；每语言取时间最新的一篇。 |
| `hiddenInHomeList` | 布尔 | 首页列表里不出现，但归档、标签、搜索里仍然有。 |
| `isAI` | 布尔 | AI 生成标记（列表页默认会筛掉，第 10 项实现）。 |
| `comments` | 布尔 | 这一篇要不要评论区，缺省 `true`（`comment` 是别名）。写 `false` 就整篇不出评论区。 |
| `references` | 表数组 / 数组 | 参考文献，见第 6 节。 |
| `slug` / `permalink` | 字符串 | 自定义路由，**只能用 ASCII**。文件名是中文时必须写，否则构建会直接报错（原因见第 1 节）。 |

容错写法（都能识别，选一种统一用即可）：

- 布尔：`true` / `"true"` / `1` / `"是"` …；
- 别名：`name`↔`title`、`created`/`published`↔`date`、`modified`↔`updated`、
  `summary`↔`description`、`cates`↔`categories`、`top`/`sticky`/`featured`↔`pinned`、
  `hidden`/`excludeFromHome`↔`hiddenInHomeList`、`ai`↔`isAI`、`comment`↔`comments`。

### 日期口径

| 写法 | 解释 |
| --- | --- |
| `2026-01-01T09:30:00Z` / `+08:00` | 带时区，按绝对时间 |
| `2026-01-01T09:30:00` / `2026-01-01 09:30` | 不带时区，按**构建机器的本地时间** |
| `2026-01-01` | 只有日期，视为当天 `00:00:00Z`（跨时区最稳） |

只写日期最省心；要精确到分钟且在意跨时区，就带上时区。

---

## 5. 卡组（`_index.md`）

一个目录里的 `_index.md` 用来描述这个目录（列表页 / 卡组页 / 首页栏目会用它）：

```toml
+++
title = "折腾笔记"
description = "环境配置、踩坑记录之类。"
order = 10
cover = "/thumbnails/zh/notes.png"
+++
```

- `order`：小的排前面（`weight`、`index` 是别名）；不写按 0 处理；
- `cover` 缺省时，卡组封面取组内第一篇文章的封面；
- 没有 `_index.md` 的目录只要有文章，也会被当成一个卡组，标题由 UI 用目录名兜底；
- 组内文章按时间倒序，`pinned` 不影响组内顺序；
- **列表页按卡组分块显示**：一组一块，组头（组名 + 篇数 + 说明）下面是这一组的卡片；
- **每个卡组都有自己的页面**：`content/zh/posts/notes/` → `/zh/posts/notes/`
  （组名 + 说明 + 封面 + 组内卡片，组头可以点进去）。这个地址由目录名决定，
  **不需要你写任何文件**；组里一篇文章都没有时它不存在（空目录不出现）。
  两种情形**不做**卡组页，都按「谁更具体谁优先」处理：
  1. 目录里写了 `index.md`（`notes/index.md` → slug `notes`）—— 那个地址就是你那篇文章，
     正文优先；
  2. 顶层（`content/zh/posts/` 直接放的那些文章）不是一个卡组，它们在列表页里归「未分组」。

---

## 6. 参考文献

frontmatter 里写 `references`，正文里用 `[reference:1]` 这样的角标引用（渲染在第 3 项实现）。

```toml
+++
# …其它字段…

[[references]]
id = 1
title = "Attention Is All You Need"
url = "https://arxiv.org/abs/1706.03762"
author = "Vaswani et al."
site = "arXiv"
note = "可选的一句话备注"
+++
```

- `id` 缺省时按书写顺序 1、2、3…；
- `title` / `url` 至少要有一个，文末参考列表按 `id` 排序；
- 也接受极简写法：`references = ["https://a.com", "https://b.com"]`。

细节（渲染器 `lib/markdown.ts` 的行为）：

- 排序：纯数字 `id` 按数值升序排在前面，其余（如 `note`）按书写顺序排后面；
  角标里显示的数字 = 它在文末列表里的序号，两边永远一致；
- 角标写法必须紧贴、不能有空格：`[reference:1]`；同一篇里可以重复引用同一条；
- 引用了不存在的 id（比如笔误 `[reference:404]`）会**渲染成红色提示**并在构建日志里给一条警告，
  不会让构建失败——方便你先写完正文再补 frontmatter；
- `references` 里 id 重复也会给警告，角标统一指向第一条。

---

## 7. 缩略图

按这个顺序找，找到就用：

1. frontmatter 的 `cover`（`thumbnail`、`image`、`banner` 是别名）；
   写 `https://…` 当外链，写 `/xxx.png` 或 `xxx.png` 都当作 `public/` 下的路径；
2. `public/thumbnails/<lang>/<slug>.png`（也认 `.jpg` `.jpeg` `.webp` `.avif` `.svg`）；
   再退 `public/thumbnails/<slug>.png`，再退 `public/covers/…` 的同样两种层级；
   嵌套 slug 会先试完整路径（`notes/first-note`），再试最后一段（`first-note`）；
3. 正文里第一张图片；
4. 都没有 → 没有封面。**纯文字博客完全可以没有封面**，卡片会走无图样式。

---

## 8. 图表与代码块

正文代码块的语言名约定（渲染在第 3 项实现，这里先把名字定下来，避免以后改文章）：

| 语言名 | 渲染成 |
| --- | --- |
| `mermaid` | Mermaid 流程图 / 时序图 / 状态图 / 甘特图 / 类图 |
| `echarts` | ECharts 图表（内容是 JSON 配置） |
| `graphviz` / `dot` | Graphviz 有向图 / 无向图 |
| `abc` / `abcjs` | 五线谱（ABC 记谱） |
| `smiles` | 化学结构式（SmilesDrawer） |

其余代码块按语言高亮（monokai 主题）；公式用 `$…$` 与 `$$…$$`（KaTeX，支持 mhchem）。

图表的注意点：

- 想给图表加标题，写在语言名后面：```` ```mermaid title="架构图" ````（也能用 `~~~` 围栏）；
- 图表在**浏览器里**画（五个库都按需动态加载，静态导出没法预渲染），
  所以正文里插入图表不会拖慢首屏，但也没有「无 JS 也能看」的降级；
- 图表画失败（语法错、JSON 不合法、SMILES 解析不了）时，会在原位显示红色报错并打印到控制台，
  不会让整站构建失败；
- 可以在代码块里写中文注释的只有 `graphviz`、`mermaid`、`abc`；`echarts` 是 JSON，不能写注释；
- `smiles` 只取第一行的表达式，`#` 开头的行会被忽略。

可用的 KaTeX 自定义宏（`lib/markdown.ts` 的 `KATEX_MACROS`）：

| 宏 | 效果 |
| --- | --- |
| `\RR` `\NN` `\ZZ` `\QQ` `\CC` | 黑板体 ℛ / 𝒩 / 𝒵 / 𝒬 / 𝒞 |
| `\dd` `\dif` | 正体微分号 d |
| `\ee` `\ii` | 正体 e / i |
| `\abs{x}` `\norm{x}` `\ket{\psi}` `\bra{\phi}` | 绝对值 / 范数 / 右矢 / 左矢 |
| `\E` `\Var` `\Cov` | 期望 / 方差 / 协方差 |
| `\argmax` `\argmin` | 带下标的 arg max / arg min |
| `\ce{…}` `\pu{…}` | 化学式与单位（mhchem 扩展） |

---

## 9. 中文排版自动优化（第 4 项）

写中文时**不用**手工在半角/全角之间纠结，也不用自己敲中英文之间的空格 —— 渲染期会收拾干净
（实现在 [lib/typography.ts](../lib/typography.ts)，只改正文文本，不碰代码与公式）。

| 规则 | 例子 |
| --- | --- |
| 中文与半角字母数字之间补一个空格 | `中文English` → `中文 English`；`2024年` → `2024 年` |
| 前一个字符是中文时，半角标点转全角 | `他说,好` → `他说，好`；`中文.` → `中文。` |
| 中文语境里手打的 `...` 转 `……` | `原来如此...` → `原来如此……` |
| 成对的半角括号只要有一侧贴着中文，两边一起转全角 | `中文(test)` → `中文（test）`；但 `f(x)` 不动 |

**不会**被动到的东西：

- 代码块、行内代码、公式（`$…$` / `$$…$$`）里的内容原样保留；
- 链接与图片的**地址**（链接文字会被排版，地址不会）；
- 内联 HTML 里的内容；
- `1,000`、`3.14`、`v1.2.3`、`example.com`、`a.ts` 这类数字/英文内部的标点
  （规则只认「前一个字符是中文」）；
- 引号：半角 `"` `'` 一律不转，中文引号请直接写 `“ ”`。

两点要知道：

- 已经自己敲了空格的地方不会重复加空格，所以你想怎么排就怎么排；
- 跨节点的相邻（例如 `**中文**English`）看不出来，这种地方自己补一个空格。

想关掉整块或关掉其中某条，用 frontmatter 的 `typography` 字段（缺省全开）：

```toml
+++
title = "这篇不自动排版"
typography = false          # 整块关掉
# 或者只关某几条：
# typography = { spacing = false, punctuation = false, parentheses = false }
+++
```

> 说明：渲染层（`lib/markdown.ts` 的 `RenderOptions.typography`）支持这些开关，
> 而 frontmatter 的 `typography` 字段**已经接上去了**（第 12 项：文章页把字段翻成选项，
> 换算在 `lib/article.ts` 的 `parseTypographyOption()`）。写得认不出来（比如 `typo = false`
> 这种笔误）就当没写，四条规则照旧全开。

---

## 10. 常见报错

| 报错 | 原因 |
| --- | --- |
| `frontmatter 没有闭合` | 开头写了 `---`（或 `+++`），结尾漏了同样的分隔行 |
| `slug "…" 里有 URL 不安全的字符` | 文件名（或 frontmatter 的 `slug`）是中文 / 带空格 / 带 `%`。改文件名成 ASCII，或补一行 `slug = "note-1"` —— 非 ASCII 的 slug 线上一定 404，所以这里直接拦住 |
| `TOML frontmatter 解析失败：…（第 N 行）` | TOML 语法问题，行号已换算成文件行号 |
| `键 "x" 重复定义` | 同一个键写了两次 |
| `slug 冲突` | 两个文件推出同一个 slug，用 `slug` 字段区分 |
| `无法解析的值 "…"（字符串请加引号）` | TOML 里的字符串忘了加引号 |

构建期报错会带上源文件路径，按提示改即可。
