# PROJECTS —— 项目实施与进度台账

> 本文件是**开发进度台账**，不是站点内容。随着每项推进而更新。
> 站点本身的说明文档在 [README.md](./README.md)（第 14 项交付）。
>
> 文件名沿用你给的名字，按英文习惯补全为 `PROJECTS.md`（原请求写作 `PROGECTS.md`）。
> 如果你要的正是那个拼写，说一声我改名。

---

> **⚠️ 台账状态（本轮起）**：框架与 14 项都已经落地，站长的判断是「这份台账属于项目前期的东西」。
> 于是**下面 §1~§9 全部转为「历史档案」** —— 它们记录的是当时怎么做的、为什么这么做、踩过什么坑，
> 留作追溯与查证；**不再要求逐条遵守**（新代码不必照它们的措辞写注释，也不必再提「第 N 项落地」那套说法）。
> **现行规范只有一处**：紧接本段之后的【现行】一节（几何实体与手绘草稿，第 15 项）。
> 两者冲突时**一律以现行规范为准**；历史里仍然适用的技术约定已经收进那一节的 §15.7，
> 不必再回 §5 去找。

---

## 【现行】几何实体与手绘草稿 —— 第 15 项规范（优先于 §1~§9）

**为什么单独立在文件最前面**：框架与 14 项都已经落地，这一轮视觉语言要**从头改一次** ——
背景的「气氛」（软边大色块）→ 页面里的「实体」（硬边几何体 + 手绘草稿线）。
本节是**唯一要严格遵守的规范**；§1~§9 是历史。历史里仍然适用的技术约定（令牌单一来源、
`aria-hidden`、`reduced-motion`、只读滚动、打印不印、不引图片资源……）已经收进 **§15.7**；
不适用于现在的（图纸图案开关、软边遮罩、「第 8 项」那套编号与图签）不再要求。

**本节显式替代历史里的两处**（是替代，不是忽略，理由就在下面）：

1. 约定第 5 条那句「背景装饰层只许是纯色与大色块……要在背景上加线条之前先问一声」
   → 改为：**背景里可以加线**（这一轮要的就是手绘草稿线），但只许**细线、且只跟着几何实体**，
   **不许满页网格 / 点阵 / 铺满的排线**；
2. 「大色块」（软边、无边框、纯气氛）→ 换成**硬边、带描边的几何实体**。

### 15.1 站长这一轮的需求（原话摘）与八个追问的答复

> 增加一些类似手绘的草稿线，像一件未完成的高级设计图纸一样，像达芬奇那种艺术品。
> 大色块去掉模糊效果……我想要的是那种一整个东西穿插在博客页面里面，而不是一个简单的背景……
> 一眼又能看到它清晰的边框，以及它就在那里，切换页面时色块运动到下一个位置，
> 就像我友链里阿卡迪亚那种海报博客似的，但是我们做的又不是海报博客，模仿它的丝滑切换动画，
> 就是仿照它的动效我们做成一块小形状不断在变化……文章页面是一个长方形，红色，竖着放，
> 那它就保持在一个位置，我一眼能看得到，随文章上下滑动。
> 说白了我想做成带有大量几何动效与几何实体的博客。

**八个追问的答复 → 落成规格**（下面这张表是这一轮的唯一依据）：

| # | 追问 | 站长答复 | 落地 |
| --- | --- | --- | --- |
| 1 | 实体多大 | **C：主实体 + 小卫星** | 每页 **1 个主实体 + 1 个小卫星**；元素数量**恒定**（这一页用不上的写 `fade: 0`，不删行 —— 否则换页会变成「跳变」） |
| 2 | 正文列要不要不透明底 | **穿插在正文里** | 实体**允许跨过正文列**（宽度可以压过 `--reading-measure`），不是只贴左右留白；正文列**不加**不透明底 |
| 3 | 手机上怎么办 / 能不能压字 | **实体永远放在文字后面** | 整层永远 `z-index: -1`；任何装饰都**不许出现在正文之上**（没有前景层）；「看得见」靠形状的边框与位置，不靠压在字上 |
| 4 | 颜色 | **做成多彩的，亮色模式下色调重，暗色模式下色调浅** | 新增**八色颜料表**（§15.2）：浅底（纸 / 亮）用**重色**（深、饱和），深底（暗）用**浅色**（高明度、低饱和）；整层浓度仍由 `--figure-alpha` 收着 |
| 5 | 指针跟随的小形状要不要 | **不要** | 不做任何指针交互。互动只留两件：**换页形变** + **滚动联动** |
| 6 | 草稿线铺多大 | **做细，放在背景里** | 草稿线一律**细线**（0.6~1px）、**只跟着实体**走、随实体一起动；**不做满页网格 / 点阵** |
| 7 | 右下角图签怎么处理 | **合并进实体** | 删除独立图签；`TOB-ZH-03` + 页名变成**实体的注解**（等宽小字），跟着实体一起挪 |
| 8 | 节奏 | **分两批** | V1 / V2 见 §15.6 |

★ **参考站取证**（只读，没改仓库）：`https://www.arcadia.moe/`（阿卡迪亚）的标志性手法是两样 ——
① 一只 `fixed` 的 4rem 洋红圆 + `border-2` 描边环、`mix-blend-multiply`，**跟着指针走**；
② 跨场景的 `data-scene-persistent` 色块，带一份**声明式的进出场规格**
（`{in:{duration:400,…}}`，其中一处写着 `"change":{"effect":"morph"}`）—— 换场景时同一块东西**变过去**。
**只借②**（本站已有的形变机制本来就是同一路数），**不借①**（答复 5）。它的满页 12 栏网格线、
`filter: blur(.45rem)` 入场、`feTurbulence` 噪点也不借（前者你否过，后两者与本站「不用 blur / 不引图片」的取舍相冲）。

### 15.2 颜色令牌（答复 4 的落地）

颜料**八色**，三套外观各一组值；**同一号颜料在浅底上是重色、在深底上是浅色**：

| 号 | 名字 | 纸 paper（浅底 · 重） | 亮 light（浅底 · 重） | 暗 dark（深底 · 浅） |
| --- | --- | --- | --- | --- |
| 1 | 朱 vermilion | `#a63a24` | `#b03a2e` | `#f0a08c` |
| 2 | 暖褐 umber | `#8a6a3b` | `#6f5a2e` | `#dcbf94` |
| 3 | 陶土 terracotta | `#b4623a` | `#c0663c` | `#f2b28c` |
| 4 | 芥黄 ochre | `#9c7a1e` | `#8a6a12` | `#e6cf86` |
| 5 | 苔绿 moss | `#5c7a3a` | `#4f6b30` | `#b6d0a0` |
| 6 | 青 teal | `#2f6f6a` | `#1f6b6b` | `#9ed6d0` |
| 7 | 群青 ultramarine | `#33517f` | `#2a4a86` | `#a8bce6` |
| 8 | 紫 violet | `#6b4a80` | `#5c3f7a` | `#cbb0e0` |

- 令牌名：`--figure-tint-1…8`（颜料）、`--figure-alpha`（整层浓度）、`--figure-ink`（草稿主线的墨）、
  `--figure-ink-soft`（第二道描边 / 构造线）。旧的一组 `--ambient-tint-1…6` / `--ambient-alpha`
  **在 V1 里删除**（改名收进 `--figure-*`），不并存两套。
- ⚠️ 上表色值是**起手值** —— 本环境跑不了浏览器，没法当场看。真机上觉得哪一号偏了，
  只改 `app/globals.css` 三套令牌块里的那一个值（改色永远只有一个落点）。
- 起手浓度：`--figure-alpha` 纸 `0.26` / 亮 `0.22` / 暗 `0.30`（浅底的重色要靠浓度压下来；
  深底的浅色本身已经亮，给低了看不见）；墨色 `--figure-ink` 纸 `rgba(60,48,28,.45)` /
  亮 `rgba(20,40,50,.4)` / 暗 `rgba(200,225,230,.35)`。
- 历史里那条「文章页整层压到六成」**取消**：那一条是为软边气氛设的，而这一轮站长点名
  「文章页面是一枚竖放的红长方形，我一眼能看得到」—— 文章页的实体是主角，不再整体压淡；
  它只要**让开左右两侧的悬浮件**（目录 / 进度条 / 回顶 / 齿轮都有不透明底，会自然压在实体之上，
  所以只需避免实体的主体正好铺满那些小圆件的正下方，别让人误以为它们是实体的一部分）。

### 15.3 几何实体（`lib/decor.ts` 的 `FIGURES`）

- **类型 `Figure`**：`shape`（形状）/ `x`、`y`（圆心，视口百分比）/ `w`、`h`（尺寸）/
  `rot`（朝向）/ `tint`（颜料号 1~8）/ `fade`（这一块的浓度，默认 1）/ `sketch`（草稿线种类与密度）/
  `note`（注解位置）。`FIGURES: Record<DecorSection, FigurePair>` 仍是**穷尽表**：
  新加一页忘了给规格，TypeScript 直接报错。
- **形状集合**：V1 做 `rect`（长方形）/ `bar`（细长条）/ `circle`（圆）；
  V2 再加 `triangle` / `cross`（十字）/ `arc`（弧）。文章页按站长原话 = **竖放的朱红 `rect`**。
- **每页不一样**靠**形状 / 位置 / 尺寸 / 朝向 / 颜料**五样一起变（相邻两页一定不同）；
  具体数值在写代码那一步定，本节只钉住上面这些字段与「主 + 卫星」的结构。
- **换页形变**：沿用现有机制 —— 同一批 DOM 节点、只把新规格交给 CSS，浏览器插值过去；
  时长 `--figure-shift: 1100ms`、曲线 `cubic-bezier(0.22,0.61,0.36,1)`（历史值，保留）。
  再加一条 V1 的观感要求：卫星**先动、主实体后动**（错开 ~120ms），看起来才像「一个东西带着一个小东西走」。
- **尺寸怎么变（技术取舍）**：历史里「宽高恒定、几何只在 `transform` 上」是为了遮罩不重栅格化；
  **去掉 mask 之后这条限制取消** —— V1 直接 transition `width` / `height`（整层 `position: fixed`、
  不占文档流，所以不可能引起 CLS 或版面跳动），硬边实心块的每帧重绘比遮罩便宜得多。
  真机上若发涩，退回「恒定基准框 + `transform: scale()`」，代价是描边会被非等比缩放拉粗。
- **注解（答复 7）**：实体带一枚**注解**（等宽小字：`TOB-ZH-03` + 这一页的名字，取
  `decorCode()` / `decorLabel()`，不手抄），贴在实体的角上、随实体一起动。
  `components/BlueprintBackground.tsx` 与 `.blueprint-tag` **一并删除**；
  `data-route`（这一页是哪一张图纸）**挪到实体层上**（CSS 里 `[data-route="…"]` 那几处钩子继续可用），
  `data-decor` 与图案那套一起消失 —— 文章页右下角「图签让给回顶按钮」的冲突因此自然解决。

### 15.4 硬边与手绘草稿线

- **去掉模糊**：删除 `.ambient-blob` 的 `mask-image` 与 `border-radius: 50%` 兜底；
  改成**实心填充 + 两道描边**（第二道错位 1~2px、透明度约为主线的 60%）——
  「清晰的边框」与「手绘感」是同一件事的两面，两道略有偏差的线就有了。
- **草稿线**（答复 6：细、在背景里），跟着实体走，四类（V1 做前两类）：
  1. **轮廓双线**（V1）—— 沿实体边界画出略微抖动的两条线；
  2. **构造线**（V1）—— 中心十字 / 对角线，细、淡；
  3. **排线 hatch**（V2）—— 45° 细排线，用 clip 限定在实体内（**不许**铺出实体之外）；
  4. **标注**（V2）—— 尺寸线 + 箭头 + 刻度 + 一行注解文字（达芬奇图纸上那种）。
- 线宽 **0.6~1px**、抖动幅度 ≤ 2px、颜色只用 `--figure-ink` / `--figure-ink-soft`；
  透明度上限沿历史那一档（「有气质但不抢字」）。
- **生成方式（重要）**：抖动的「手绘」路径由**确定性**算法生成 —— 种子来自路径字符串
  （`hash(pathname)` + 一个极小的 PRNG），**禁止用 `Math.random()` / `Date.now()`**：
  构建期渲染与客户端渲染必须得到同一份路径，否则会 hydration 不一致。内联 SVG（不引图片、不发请求），
  断网与 PWA 离线照旧。
- **不做满页网格 / 点阵 / 铺满的排线**。从实体引出、横穿整页的**延长线**属于 V2 的可选项，
  **默认先不做**；要做的话先确认一次。

### 15.5 滚动联动（「随文章上下滑动」）

- 只**读**滚动，绝不改滚动：一次 `scroll`（passive）+ `requestAnimationFrame` 节流，
  往实体层（或 `<html>`）写一个 CSS 变量（例如 `--scroll-shift`），实体的 `translateY` 用 `calc()` 读它。
- 位移上限 **±8vh**（起手值）：实体任何时刻都要有**一大半留在视口里** ——
  「我一眼能看得到」是这一轮的硬要求，联动不许把它送出屏幕。
- 变量没写的时候（未挂载 / 无 JS / reduced-motion）：实体停在**基准位置**，**照样看得见**（渐进增强）。
- `prefers-reduced-motion: reduce`：不联动、不形变、直接落位。
- 打印：整层不印。

### 15.6 两批（答复 8）

**V1（先做，做完你先看）**

1. `lib/decor.ts`：`AMBIENTS` → `FIGURES`（12 页 × 主实体 + 卫星）、`Ambient*` → `Figure*`、
   `AMBIENT_SHIFT_MS` → `FIGURE_SHIFT_MS`（值仍 1100）；删 `PATTERNS` / `DecorPattern` /
   `DECOR_PATTERNS` / `Decor.pattern`，**保留** `SHEETS` / `Decor.section` / `Decor.lang` /
   `decorCode()` / `decorLabel()`（注解要用）；
2. `components/AmbientBackdrop.tsx` → `components/FigureLayer.tsx`：硬边实体 + 双描边 +
   轮廓 / 构造线（确定性 SVG）+ 实体注解 + 滚动联动；
3. 删除 `components/BlueprintBackground.tsx` 与 `app/layout.tsx` 里那一行挂载（两个装饰层合并成一个）；
   `app/globals.css` 的第 5 / 5b / 5c 节重写成「5. 几何实体层」——
   **图案那七套与 `DECOR_PATTERNS` 开关一并删除**（装饰语言已经改成「实体」，留一套死开关只会被误用；
   要恢复就照 §8 的历史描述重写，历史里留着完整规格）；
4. 三套外观的颜料 / 墨色令牌（§15.2 那张表）+ `--figure-shift` / `--figure-alpha` 等常量；
5. 清理与自检：`grep -rn "data-decor\|blueprint\|ambient"` 在 `app/` `components/` `lib/` 里应当为空。

**V2（V1 看过之后再定）**：排线 hatch 与尺寸标注、`triangle` / `cross` / `arc` 形状、
卫星滞后拖动（二阶运动）、可选的延长线。

### 15.7 不许破的规矩（本节优先于 §1~§9 里的一切说法）

1. 整层 `position: fixed; inset: 0; z-index: -1; pointer-events: none; aria-hidden="true"`，
   **永不**上移。层序（沿用）：粘性标题 17 < 目录 18 < 进度与回顶 19 < 吸顶顶栏 20 <
   设置齿轮 40 < 遮罩 45 < 抽屉 50 < 全站加载线 60。
2. 实体**永远在文字后面**：正文列不加不透明底、不做「被切断」；没有前景装饰层。
3. **只读滚动**：不做 scroll-jacking、不动 `scroll-snap`、不改任何滚动位置。
4. 颜色只在 `app/globals.css` 的三套令牌块里定义；`lib/decor.ts` 只说用几号颜料。
   不写 `dark:` 变体、不写死色值（唯一的例外仍是设置中心那几颗 `.theme-chip` 预览色块）。
5. 细线（0.6~1px）、不许满页网格 / 点阵。
6. 首帧不播、只有换页才形变；`prefers-reduced-motion: reduce` 下不形变、不联动、直接落位。
7. 打印不印（`.figure { display: none }`）。
8. **不引图片资源**：草稿线一律内联 SVG / CSS，断网与 PWA 离线照旧。
9. **确定性手绘**：禁止 `Math.random()` / `Date.now()` 参与几何生成；同一路径每次渲染必须一致
   （SSR 与客户端一致，避免 hydration 报错）。
10. 不引第三方动画库（现有机制 —— CSS transition + 一个 rAF 节流的 scroll 监听 —— 已经够用）。

### 15.8 验收（V1 交付后你本机看）

1. **文章页**：应当有一枚**竖放的朱红长方形**、**边框清晰**，滚动时它跟着上下挪一点但**不会跑掉**；
   文字照读不误（它永远在字后面）。
2. **换页**：首页 → 列表 → 文章 → 标签，**同一块东西**应当是**挪过去 / 变形 / 换色**，
   而不是消失再出现；小卫星跟着走（略滞后）。
3. **三套外观**：纸 / 亮 是**重色**，暗 是**浅色**；底色上**没有**满页网格。
4. **右下角不再有** `TOB-ZH-xx` 图签 —— 编号现在长在实体上；文章页右下角的回顶按钮不再被压住。
5. **减少动效**：系统开 `prefers-reduced-motion: reduce` 后不形变、不联动，实体仍在视野里。
6. **打印预览**：实体与草稿线都不印。
7. **`npm run typecheck`** 应当过；`next build` 的产物与历史一致（本环境没有 shell，这两条只有你本机能跑）。
8. 手机上（窄视口）实体应当**压过正文列但仍在字后面** —— 若看起来「糊在字上」读着累，
   告诉我，改法是调 `--figure-alpha` 或把实体挪向视口边缘（都是一个值的事）。

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
| 图标 | Iconify（`@iconify/react/offline` + 内联的 MDI 图标数据 `lib/icons-data.ts`，离线打包，无运行时请求） |
| 评论 | giscus（GitHub Discussions） |
| 部署 | Cloudflare Workers 静态资源（wrangler；由 Cloudflare Workers Builds 构建） |

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
│     ├─ page.tsx            首页（第 9 项：八栏吸附，版面与文案在 lib/home.ts）
│     └─ posts/
│        ├─ page.tsx         文章列表页（第 10 项：构建期取数据；筛选 / 搜索 / 密度在 lib/list.ts + components/list）
│        └─ [...slug]/page.tsx  文章正文页（第 12 项：构建期渲染全文 + 目录 / 进度 / 上下篇 / 评论；零文章时保一条保留路径 `__empty__`，见 lib/article.ts 的 EMPTY_POST_SLUG）
│     ├─ tags/page.tsx       标签页（第 13 项：薄壳，本体是 components/pages/FacetIndex）
│     ├─ categories/page.tsx 分类页（第 13 项：与标签页共用同一个组件）
│     ├─ archives/page.tsx   归档页（第 13 项：年 → 月 → 文章的时间线）
│     ├─ search/page.tsx     搜索页（第 13 项：复用列表页组件 + 自动聚焦搜索框）
│     ├─ about/page.tsx      关于页（第 13 项：渲染 frontmatter 里 about: true 的那篇文章）
│     ├─ links/page.tsx      友链页（第 13 项：读 lib/site.ts 的 LINKS —— 八个，卡片带头像）
│     └─ settings/page.tsx   设置页（第 13 项：直接复用 components/SettingsCenter）
├─ components/
│  ├─ ArticleBody.tsx        正文容器：注入 HTML 并按需动态加载五类图表
│  ├─ charts/
│  │  ├─ mermaid.ts          Mermaid 渲染器（只在有图表时才进包）
│  │  ├─ echarts.ts          ECharts（代码块是 JSON option）
│  │  ├─ graphviz.ts         Graphviz（@hpcc-js/wasm-graphviz）
│  │  ├─ abc.ts              五线谱（abcjs；渲染后把近黑的 stroke/fill 换成 --c-ink，见第 12 项）
│  │  └─ smiles.ts           化学结构式（SmilesDrawer）
│  ├─ article/
│  │  ├─ ArticleToc.tsx      悬浮目录（第 12 项，客户端：面板可收起 —— 宽屏默认展开在左上、窄屏默认收起成左下角一个挂件；底部挂着 compact 档上下篇）
│  │  ├─ ArticleStickyTitle.tsx 粘性标题（第 12 项，客户端：零高、贴在 <article> 里，大标题滚出视野后在顶栏下面挂一条 —— 左边篇名、右边**正在读的那一小节**，小节名与目录高亮 / 进度条方块同源）
│  │  ├─ ArticleProgress.tsx 阅读进度 + 圆形回顶（第 12 项，客户端：一次 scroll 监听 + rAF 节流；细线是可拖的滑块、回顶按钮套一圈进度环）
│  │  ├─ ArticlePager.tsx    上下篇（第 12 项；无 hook，服务端也能用，full/compact 两档共用）
│  │  └─ GiscusComments.tsx  giscus 评论（第 12 项，客户端：滚到附近才加载、换外观走 postMessage）
│  ├─ LangRedirect.tsx       浏览器端语言跳转
│  ├─ HtmlLang.tsx           客户端纠正 <html lang>
│  ├─ BlueprintBackground.tsx 蓝图草图背景层（第 6 项建立，第 8 项接上路由：路径 → data-decor + 右下角图签）
│  ├─ AmbientBackdrop.tsx    环境色层（第 8 项扩展：每页三块软边大色块，换页时形变；只有色块、无图案）
│  ├─ PageIntro.tsx          换页渐入（第 8 项扩展：换页后给 <html> 挂 data-page-in，正文淡入一次）
│  ├─ ThemeInit.tsx          首帧主题脚本（第 6 项；body 第一个元素，避免暗色读者看到闪白）
│  ├─ PrefsInit.tsx          首帧阅读偏好脚本（第 7 项；body 第二个元素，避免版面跳动）
│  ├─ ThemeSync.tsx          跟随系统深浅色变化（第 6 项；只在「跟随系统」时重新解析）
│  ├─ SiteHeader.tsx         顶栏（第 7 项建立；顶栏改版后是「品牌 / 友链 / 图片位」三段，服务端组件）
│  ├─ HeaderIntro.tsx        顶栏入场与光标控制（顶栏改版新增；客户端：三段错开淡入 + 切后台暂停光标）
│  ├─ SiteFooter.tsx         页脚（第 7 项建立；顶栏改版后承接了站内导航 + 语言切换 + 内容统计，
│  │                         另有联系方式 / 说明 / 版权与左下角设置入口）
│  ├─ RouteLink.tsx          「按落地状态渲染」的站内链接（第 7 项；pending 渲染成不可点）
│  ├─ ThemeSwitcher.tsx      顶栏外观按钮（第 7 项；四态循环，落点是 lib/theme.ts）
│  ├─ LangSwitcher.tsx       语言切换（第 7 项；页脚导航与设置中心共用）
│  ├─ SettingsDock.tsx       左下角齿轮 + 设置抽屉（第 7 项；Esc/遮罩关闭、锁滚动）
│  ├─ SettingsCenter.tsx     设置中心内容（第 7 项；抽屉用，第 13 项的 /settings/ 页也能直接放）
│  ├─ home/
│  │  ├─ HomeBlockHead.tsx   栏头（栏号 + 一句小字 + 栏名；八栏共用，栏号由版面表推出）
│  │  ├─ HomeIntro.tsx       第 1 栏 本站介绍（站名 / 自述 / 三个入口，RSS 是唯一现在可点的）
│  │  ├─ HomePostCards.tsx   第 2 栏 文章卡片（第 11 项起用共用的 PostCard「适中档」）
│  │  ├─ HomeStats.tsx       第 3 栏 数据统计（字数 / 累计阅读 / 首末发布 / 构建日期）
│  │  ├─ HomeChangelog.tsx   第 4 栏 更新日志（日期 + 主题 + 「新」标记，整行链到 GitHub 提交）
│  │  ├─ HomeInventory.tsx   第 5 栏 站内内容（文章 / 专题 / 标签 / 题材 / 语言）
│  │  ├─ HomeReading.tsx     第 6 栏 阅读改善（当场跑一遍 lib/typography.ts 的排版函数）
│  │  ├─ HomeThemes.tsx      第 7 栏 外观切换（客户端；与设置中心同一套 API 与样式）
│  │  ├─ HomeFonts.tsx       第 8 栏 字体设置（客户端；只写 --reading-* 三个令牌）
│  │  └─ HomeIndex.tsx       侧边指示器（客户端；IntersectionObserver 高亮，锚点可无 JS 使用）
│  ├─ list/
│  │  ├─ PostCard.tsx        文章卡片（第 11 项：紧凑 / 适中 / 内容 三档；首页与列表页共用）
│  │  └─ PostList.tsx        列表页本体（第 10 项，客户端：搜索 / 筛选 / 密度 / 地址栏状态）
│  ├─ pages/
│  │  └─ FacetIndex.tsx      标签页 / 分类页的同一份实现（第 13 项；服务端组件，无状态）
│  ├─ RouteLoading.tsx       全站加载动画（换页 / 首屏资源时顶上那条描线；静态导出没有 loading.tsx）
│  ├─ CardIntro.tsx          文章卡片的入场动画（IntersectionObserver + 错开延迟，只加属性不改结构）
│  └─ ServiceWorkerRegistrar.tsx  注册 /sw.js（生产构建才注册，dev 下只清旧 SW）
├─ content/
│  ├─ README.md              写作规范
│  └─ {zh,en}/posts/README.md 各语言的目录提示（加载器跳过 README.md）
├─ lib/
│  ├─ site.ts                站点配置（第 7 项扩全：路由表 ROUTES + 落地状态、站内导航、联系方式、
│  │                         i18n 文案表；顶栏改版新增 HEADER_IMAGE 图片位）
│  ├─ icons.ts               图标表（第 7 项）：图标名 `"mdi:xxx"` → 图标数据的映射
│  ├─ icons-data.ts          用到的 49 个 MDI 图标数据（第 7 项；内联副本，运行时不发请求）
│  ├─ prefs.ts               阅读偏好（第 7 项：宽度/字号/行距三档，写 --reading-* 令牌 + 首帧脚本）
│  ├─ decor.ts               装饰层（第 8 项：路径 → 图纸编号 + 图案名 + 图签文字，零依赖；
│  │                         第 8 项扩展：同一份路径 → 环境色层 AMBIENTS —— 每页三块大色块）
│  ├─ home.ts                首页版面与文案（第 9 项：八栏顺序 / 栏号 / 中英文案；首页改版后一栏一屏）
│  ├─ list.ts                列表页（第 10/11 项：筛选状态 / 三档密度 / 纯函数 / 地址栏读写 / 中英文案，零依赖）
│  ├─ article.ts             文章页（第 12 项：目录缩进与阈值 / 上下篇 / typography 字段 / giscus 映射 / 中英文案，零依赖）
│  ├─ pages.ts               其余页面（第 13 项：标签 / 分类 / 归档 / 搜索 / 关于 / 友链 / 设置的文案 + 字号档 + 地址，零依赖）
│  ├─ toml.ts                自写 TOML 解析器（`+++` frontmatter 用）
│  ├─ frontmatter.ts         双格式识别与字段归一化
│  ├─ content.ts             内容加载 / 查询 API（只读盘，不渲染）
│  ├─ charts.ts              图表语言名登记表（服务端与浏览器共用，零依赖）
│  ├─ typography.ts          中文排版优化（第 4 项，纯字符串函数 + remark 插件，零依赖）
│  ├─ theme.ts               主题与设计令牌（第 6 项：三套外观、首帧脚本、运行时读写、令牌读取）
│  ├─ markdown.ts            Markdown → HTML 管线（第 3 项）
│  ├─ search-index.ts        搜索索引条目构建（第 5 项，Fuse.js 字段约定在这里）
│  ├─ feeds.ts               RSS 2.0 生成（第 5 项）
│  └─ changelog.ts           更新日志（第 5 项：先 GitHub API、再 git log，都失败则空）
├─ wrangler.toml
├─ next.config.ts  postcss.config.mjs  tsconfig.json  package.json
├─ .gitignore
├─ README.md     ← 站点说明（第 14 项：给人看的上手 + 写作 + 部署 + 「需要你亲自填的地方」）
└─ PROJECTS.md   ← 本文件（开发台账：为什么这样做、踩过的坑、还没验证的事）
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
public/wunai_logo.png           /wunai_logo.png    站点图标（favicon + manifest 图标）
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
| 8 | 装饰与动效 | `[x]` | `lib/decor.ts`：路径 → 图纸（图案 / 编号 / 图签），图案全在 CSS 里；换页纸面重铺一次 + 顶栏光标闪烁。**扩展（见后面那节）**：同一份路径 → 环境色层（每页三块软边大色块，换页时丝滑形变，只有色块、没有图案）+ 换页后正文渐入一次 |
| 9 | 首页 | `[x]` | `lib/home.ts`：八栏顺序 / 栏号 / 文案（首页改版后：一栏一屏、无并排、无卡片外壳；每栏定高一屏、内容多了在栏内滚）；吸附用原生 scroll-snap 的 `y mandatory`，侧边指示器是锚点 + IntersectionObserver |
| 10 | 列表页 | `[x]` | `app/[lang]/posts/` + `lib/list.ts`：搜索（懒读 `/search-index.json`）、筛选（标签/分类/年份/排序）、语言切换、密度切换、AI 默认隐藏 |
| 11 | 文章卡片 | `[x]` | `components/list/PostCard.tsx`：紧凑 / 适中 / 内容 三档；首页第 2 栏与列表页共用同一个组件 |
| 12 | 文章页 | `[x]` | `/zh/posts/<slug>/`：构建期渲染全文、悬浮 TOC（**可收起**，含上下篇）、右侧细进度条（**可拖动**）、**粘性标题**、圆形回顶（**带进度环**）、giscus 评论 |

| 13 | 其余页面 | `[x]` | 标签 / 分类 / 归档 / 搜索 / 关于 / 友链 / 设置 + 404 / 离线页；全部复用既有组件（卡片、列表、设置中心、渲染管线） |
| 14 | 交付 | `[~]` | README + 编辑指南 ✅、git 提交推送 ✅；**锁文件 ⏳** —— 本环境没有 shell，生成不了锁文件，需你在本机 `bun install` 后提交（见第 4 节第 14 项） |

> **追加的一次修订（不在原 14 项里）**：第 7 项的顶栏在交付后按 wunai-blog 参考稿**改版**过一次 ——
> 顶栏变成「品牌 / 友链 / 图片位」三段，原先挂在顶栏的七项导航、语言切换与内容统计搬到页脚。
> 为什么改、动了哪些文件、要小心的令牌，见本文件后面那节「**顶栏改版 —— 对齐 wunai-blog 参考稿**」。
> 第 7 项那一节保留原样（当时的取舍仍有参考价值），凡与顶栏结构冲突处，以「顶栏改版」一节为准。
>
> **再追加的一次修订（第 8 项的扩展）**：正文底下加了一层**环境色**（每页三块软边大色块，
> 换页时形变成下一页的样子）＋ 换页时正文**渐入**一次。见本文件后面那节
> 「**环境色大色块 + 换页渐入（第 8 项的扩展）**」。⚠️ 这一层**只有色块，没有任何图案 / 格子 / 线**：
> 第一版做过一套「结构覆盖」（同心环 / 网格 / 点阵…），站长否掉了（「不要任何格子背景，背景干净点」），
> 整套已删 —— 别再往回加。

### 1. 脚手架 —— 已完成 ✅

- `next.config.ts`：`output: "export"`、`trailingSlash: true`、`images.unoptimized`。
  静态导出下不可用 rewrites / redirects / 服务端图片优化，故根路径语言分流放在浏览器端（`components/LangRedirect.tsx`），并保留 `<a>` 兜底。
- `app/globals.css`：Tailwind 4 用 `@import "tailwindcss"` + CSS 变量（`@theme`）配置，不生成 `tailwind.config.js`；一并引入 KaTeX 样式与 monokai 代码高亮主题。
- 依赖版本策略：`next 16.3.1` / `react 19.2.8` 与 `wunai-Blog` 对齐；其余用宽松主版本区间（`^11`、`^5` 等），避免锁到不存在的版本号导致安装失败。`overrides` 把 katex 钉在 `^0.16`。
- 图表库（mermaid / echarts / graphviz / abcjs / smiles-drawer）**不进入首屏包**，只在文章真的出现对应代码块时动态 `import`，为此保留了 PWA 离线可用性。
- 图标走 `@iconify/react/offline`，图标数据内联在 `lib/icons-data.ts`（只留用到的 49 个）。原先依赖 `@iconify/icons-mdi` 整包（110MB / 27742 个文件），CI 每次构建都要完整 `npm ci`，是构建慢的主因之一，故改为内联。

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
  `remark-parse → gfm → cjk-friendly → cjk-friendly-gfm-strikethrough → breaks → math → 图表块 →
  引用角标 → remark-rehype → rehype-raw → slug →
  目录收集 → autolink-headings → katex → highlight → stringify`。
- **中文里 `**` / `~~` 的修正（追加，2026-10-01 站长的《医药学笔记》把它暴露出来的）**：
  加 `remark-cjk-friendly` + `remark-cjk-friendly-gfm-strikethrough`（都从 `/parseOnly` 进 ——
  本站只解析、从不把 mdast 写回 Markdown）。修的是 CommonMark 的一条规则（commonmark-spec#650）：
  闭合定界符的**内侧是标点**（`）`、`]`、`。` 之类）、**外侧既不是空白也不是标点**时，
  它不算「右翼定界符」，于是 `**抗生素（antibiotic）**的定义`、`*青霉素（Penicillin）*开始`、
  `**钱恩[…]（1906-1979)]**利用` 以前整段渲染成**字面量星号**；而 `**抗生素（antibiotic）**，`
  （外侧是标点）与 `**弗莱明**与`（内侧是汉字）**一直是对的** —— 现场四条坏 + 三条好正好把这条规则证出来。
  上线后对照：`/zh/posts/pharmacy-note-1/` 那四处应当变成 `<strong>` / `<em>`，页面上再无 `**`。
  两条使用规矩（改这一行之前先看一眼）：**两个必须一起挂**；`remark-cjk-friendly-gfm-strikethrough`
  **必须排在 `remark-gfm` 之后**（放到它前面就不生效，插件自己的要求）。
  ⚠️ 它*不修*「`1.有序` 不成列表」—— 有序列表标记后面必须有空格，那条与解析器无关（撰写侧唯一的改法）。
- 公式：KaTeX + `katex/contrib/mhchem`（`\ce` / `\pu`）+ `KATEX_MACROS` 自定义宏（`\RR`、`\dd`、`\abs`、`\E`…）。
  写错公式时把错误画在原文位置并着色，而不是让整站构建失败 —— 这件事由 `rehype-katex`
  自己保证（它先用 `throwOnError: true` 试、失败记一条 vfile message、再用 `throwOnError: false`
  重画）；**传 `throwOnError` 反而会类型报错**（该字段被 `Omit` 掉了），见「构建修复」一节。
  `trust: false`：不允许 `\href` 之类发请求。
- 代码高亮：highlight.js + monokai（主题在 `app/globals.css` 里 `@import`），未知语言不报错。
  每个代码块由 `rehypeCodeBlocks`（必须排在 highlight **之后** —— 它读的是 highlight 写在 `<code>`
  上的 `language-xxx` 类）套一层 `.code-block`，顶上工具头印出**语言名**（构建期，禁用 JS 也看得到「这
  是什么语法」）；那颗**复制**按钮由 `components/ArticleBody.tsx` 补（剪贴板只在浏览器里有）。
  ⚠️ 代码块自带 monokai 的深底（三套外观下都一样），所以 `pre` 的字色**写死成浅色** ——
  没写语言名的代码块没有 `hljs` 类，字色会退回主题墨色，浅色外观下就是「深底压深字」。
- 五类图表：`lib/charts.ts` 是语言名登记表，构建期把 ```` ```mermaid ```` 之类的代码块换成占位 `<figure>`
  （`data-chart` + 隐藏的源码 `<pre class="chart-source">`），客户端 `components/ArticleBody.tsx` 见到才
  **动态 import** 对应渲染器（`components/charts/*.ts`）：mermaid / echarts / graphviz(wasm) / abcjs / smiles-drawer。
  文章里没有图表时，这五个库一个字节都不进客户端包。渲染失败在原位显示红色报错并打到 console。
- 参考文献：正文 `[reference:N]` → 角标链接（`#reference-<slug>`），文末 `renderReferenceList()` 出参考列表。
  排序规则是「纯数字 id 升序在前，其余按书写顺序」，角标数字与列表序号同源；
  id 找不到时渲染成红色 `cite-missing` 并记一条 warning（不中断构建），且给出「首次引用」才有的返回锚点。
- 目录：`rehype-slug` 生成的 id 直接复用（不再自己造 slug），返回**嵌套** `toc` 与 `flattenToc()`；
  标题末尾的 `#` 锚点由 `rehype-autolink-headings` 追加。
- 开发态自检（**第 12 项已删掉这个文件**，留档说明它当时做什么）：`components/dev/PipelineCheck.tsx` 内置一段样例（GFM / 公式 / 五类图表 / 角标 / 目录统计），
  只有 `next dev` 的首页会挂它，生产构建里不渲染、也不进产物；第 12 项（文章页）落地后**已删**（连同首页里那三行），
  CSS 里的 `.pipeline-check` 一节也一并删掉了。

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
  —— 这一段自检随第 12 项删掉了：它的任务（在文章页之前验证渲染器）已经由真的文章页承担。

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
- **更新日志**（`lib/changelog.ts`）：两个来源，按顺序试 —— ① **GitHub REST API**
  （`/repos/<owner>/<repo>/commits`，仓库地址取 `CONTACT.repo` 里的 `owner/repo`），
  ② `git log --no-merges --date=short`（字段用 ASCII 的 Unit Separator 分隔，正文里不可能出现，
  不会和 `|` 撞车）。**先 API 后 git** 的理由与参考项目（wunai-Blog 的
  `scripts/generate-changelog.mjs`）一样：云构建常常是浅克隆，`git log` 在那种环境里只剩触发
  构建的那一条提交；API 那边多要几条是为了过滤掉合并提交后仍然够数。每条还带 `url`
  （GitHub 上的提交地址），首页那一栏因此整行可点。结果按 `includeMerges` 缓存**一个 Promise**，
  首页栏与 JSON 路由不会各跑一次。**两个来源都失败时返回空数组 + 一条 console.warn，绝不让构建失败**
  （产物目录、tarball 解压、机器没装 git、API 限流都属于这种情况）；`/changelog.json` 的
  `source` 字段（`github` / `git` / `none`）说的就是这批记录来自哪里。CI 里依旧需要
  `fetch-depth: 0`（作为兜底）。⚠️ 那一处 `fetch` 用的是 `cache: "force-cache"` 而**不是**
  `no-store` —— 静态导出下 `no-store` 会把页面标记成动态渲染，构建直接失败。
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
    install 预缓存外壳（`/`、`/zh/`、`/en/`、`/offline/`、manifest、站点图标，逐条 try/catch，
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
  - `public/wunai_logo.png`（1500×1500）：站点图标。`app/layout.tsx` 的 `metadata.icons`
    （`icon` + `apple`）、`app/manifest.ts` 的 `icons` 与 `public/sw.js` 的外壳清单都指向它。
  - PNG 图标（192 / 512）仍未单独生成：`manifest.ts` 里 `sizes` 写真实尺寸（≥144px，
    浏览器与「加到主屏幕」都认）。想更精细就另做两份 PNG，并在 `manifest.ts` 的 `icons` 里补两条。
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
  smiles 继续用内置的 light/dark；abc（五线谱）当时没动，**第 12 项补上了**（画完后把近黑的
  `stroke` / `fill` 换成 `--c-ink`，见下面第 12 项与第 4 节的待办）。
- **打印**：`@media print` 里隐藏蓝图层、正文转 11pt / 不限宽、代码块转浅底
  —— 纯文字博客最实用的「导出」就是 Ctrl+P 存 PDF。
- **改了令牌要同步的三处**（CSS 与 TS 之间没有桥）：`lib/theme.ts` 的 `THEME_CHROME`（三套底色镜像）、
  `THEME_INIT_SCRIPT`（`applyTheme()` 的内联版本：首帧脚本与运行时 API 必须同一套判定逻辑）、
  `FALLBACK_TOKENS`（读不到 CSS 变量时的兜底）。三处都在 `lib/theme.ts` 顶部注释里写明了。

### 7. 框架 UI —— 已完成 ✅

**交付物**：顶栏（`SiteHeader`）、页脚（`SiteFooter`）、设置中心（`SettingsDock` + `SettingsCenter`），
以及它们依赖的三块地基：路由落地状态表（`lib/site.ts` 的 `ROUTES`）、图标表（`lib/icons.ts`）、
阅读偏好（`lib/prefs.ts`）。全部挂在 `app/[lang]/layout.tsx` 上，第 9~13 项每加一页自动带上框架。

> ⚠️ **顶栏与页脚在交付后改版过一次**（对齐 wunai-blog 参考稿）：顶栏现在只有
> 「品牌 / 友链 / 图片位」三段，原先挂在顶栏的七项导航、语言切换与内容统计都搬到了页脚。
> 怎么改的、为什么、以及要小心的令牌见本文件后面那节「**顶栏改版 —— 对齐 wunai-blog 参考稿**」。
> 下面这几条描述的是**第 7 项落地时**的形态（保留它是因为其中的取舍仍有参考价值），
> 凡是与「三段：品牌 / 导航 / 图签」有关的部分都以那一节为准。

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
  3. **语言**：与页脚导航栏共用 `LangSwitcher`（第 7 项时它在顶栏图签区）；
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
     ——顶栏改版后**只有页脚与 `.page` 还用它**（参考稿的顶栏是通栏），见后文那节；
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

> ⚠️ **本节描述的图案默认已经关掉了**（站长的要求：全站背景改成纯色）——
> `lib/decor.ts` 的 `DECOR_PATTERNS = false` 让每页都是 `plain`，代码一行没删。
> 开关与理由见后面的「**背景改成纯色（图案层关掉）**」一节。
>
> ⚠️ **另有一层是第 8 项后来扩展出来的**：正文底下的**环境色**（每页三块软边大色块，换页时丝滑形变，
> **只有色块、没有任何图案**）+ 换页后正文**渐入**一次。本节当时没有这两样 ——
> 见后面那节「**环境色大色块 + 换页渐入（第 8 项的扩展）**」。

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
  + 这一页的名字。名字里 RouteId 那几张**复用导航文案**（`SITE.i18n.nav`，第 7 项时它印在顶栏、
  现在印在页脚），`SITE.i18n.decor` 只补
  `正文 / 离线 / 未编号` 三条，不在两份文案表里各写一遍十二个名字（约定第 3 条）。
  它画在蓝图层**里面**（`z-index: -1`），所以永远在正文与页脚下面 —— 与页脚重叠时被盖住是预期的；
  窄于 48rem 直接不印，手机上那几平方厘米留给正文。
  **它是装饰、不是信息**：整层 `aria-hidden`，无障碍树里没有它，真正的内容统计在**页脚**
  （第 7 项时它印在顶栏右侧的图签区里，顶栏改版后搬到了页脚第一块）。
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

> ⚠️ **首页后来改版过一次**（站长的要求：一个栏目占一屏、去掉栏目卡片、吸附别乱）：
> 现在是一栏一屏（`.home-block` 自己就是吸附块）、`mandatory` 吸附、**没有并排、没有卡片外壳**，
> 版面表也从带「哪两栏并排」的 `HOME_ROWS` 简化成 `HOME_ORDER` 一维数组。
> 而且每栏是**定高一屏**（`height` 而不是 `min-height`）：内容比一屏多就在栏内滚，栏本身仍是一屏，
> 吸附点永远落在整屏位置；文档末尾的页脚也补了一个吸附点，不然会被吸回去。
> 本节剩下那些「5 行 / 两栏并排 / `proximity`」的描述是**第 9 项落地当时**的形态，
> 要理解现在的版面请直接看后面那节「**首页改版 —— 一栏一屏**」。

- **八栏与顺序（作者给的清单 + 顺序优化）**：

  | 栏 | 内容 | 数据来源 |
  | --- | --- | --- |
  | 01 本站介绍 | 站名 + 自述（编辑此处）+ 三个入口 | 静态文案；RSS 是第 5 项的真实产物 |
  | 02 文章卡片 | 最多 4 篇（首页改版后从 6 收到 4：一栏一屏，卡片多了就超过一屏），置顶优先 | `getHomePosts` |
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
    读长一点的栏会很难受。（⚠️ 这两条讲的是当时的 `proximity` + 并排行；
    首页改版后是 `mandatory` + 一栏一屏，理由见后文那节，`scroll-padding-top` 那部分不变。）
  - `scroll-padding-top` 同时管**吸附位置**与**锚点跳转**：侧边指示器点哪一栏，
    栏头都会停在顶栏下面那条线上。这个偏移是令牌 `--home-head-room` ——
    它**由顶栏高度推出来**（`calc(var(--header-h) + 0.5rem)`，顶栏改版后立的规矩），
    所以顶栏变高变矮这里自动跟着走，不必再手调；窄屏原来那一档 `8.5rem` 也随之删掉了
    （原因是顶栏改成了固定高、不再折行变高，见后文「顶栏改版」一节）。
  - 宽屏每行至少 `100svh - 顶栏`，面板撑满整行、内容垂直居中（「一屏一张图纸」）；
    窄屏 `min-height: auto`（内容折行后会很高，硬撑一屏反而难读）。
    （⚠️ 首页改版后：一栏一屏、**没有面板**、窄屏也照旧一屏一栏 —— 见后文那节。）
  - `prefers-reduced-motion: reduce` 的人：不做平滑滚动、也**关掉吸附**（吸附在部分浏览器里
    本身就是一段动画）。打印时同样取消（`@media print` 里 `min-height: 0`）。
- **侧边指示器**（`components/home/HomeIndex.tsx`）：固定右侧的一列**真锚点**
  （`<a href="#home-…">`）—— 所以没有 JS 也能跳；滚动动画交给 CSS 的 `scroll-behavior: smooth`。
  高亮用 `IntersectionObserver`，判定带取「正跨过视口中线」那一带（`rootMargin: -45% 0 0 -45%`）：
  **并排的两栏会一起亮**（它们确实在同一屏上，这是预期；首页改版后改成了一栏一屏，
  所以通常只有当前那一栏亮）。可见项累积在 `useRef` 的 Set 里 ——
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
- **第 4 栏读的是提交历史**（先 GitHub API、再 `git log`，最多 5 条、不含合并提交）：
  两个来源都失败时 `getChangelog()` 返回空数组并打一条警告 —— 这一栏有空状态，
  **绝不让构建失败**。这一栏的**样子与交互对齐参考项目首页**（wunai-Blog 的
  `.ah-updates` / `.ah-update`）：一列「等宽日期 + 提交主题 + 最新那条一枚「新」标记」的行，
  默认只有一圈透明描边，悬停时描边与底色浮出来，整行点开是这条提交在 GitHub 上的页面
  （新标签页 + `rel="noopener noreferrer"`）；`CONTACT.repo` 没填时渲染成不可点的行，
  不留点不动的空链接（本站在别处也是这条约定）。
- **第 2 栏的卡片暂时不可点**：正文页是第 12 项。判断与 `RouteLink` 同一个约定，
  落点只有一个 —— `lib/site.ts` 新增的 `ARTICLE_ROUTE`（`status: "pending", item: 12`），
  第 12 项做完改一个字，首页与列表页的卡片一起变成真链接。卡片的排版是紧凑文字卡，
  第 11 项（三档密度）落地后换成那边的「紧凑档」。
- **约定第 3 条补了一句**：UI 文案仍集中在 `lib/site.ts`，但**首页八栏的文案跟着版面走**
  （`lib/home.ts`）—— 八栏 × 两语 ×（标题 + 说明 + 空状态 + 示范句子）塞进 site.ts 会把
  站点配置变成文案仓库，而改一版首页只该动一个文件（与第 6/7 项「选项文案跟着选项走」同理）。
- 开发态自检仍然在（生产构建里不出现）：现在是首页 `</main>` 之后一块独立的 `.page`，
  不参与八栏吸附；第 12 项落地时连同 `components/dev/PipelineCheck.tsx` 与 `.pipeline-check`
  的 CSS 一起删掉了（约定第 6 条已兑现）。

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
    修改时间、所属卡组、标签与分类片，并在卡片里写明「列表只到摘要为止 —— 点标题进正文页读全文」。
- **结构上只有两处分支**（摘要要不要渲染、内容档多渲染几句），其余全交给 CSS：
  `.list-grid .post-card[data-density="full"] { grid-column: 1 / -1 }` 让内容档在宽屏上**一行一篇**，
  紧凑档收内边距与字号。组件里没有按密度写的样式分支。
- **一份实现两处使用**：列表页（客户端）与首页第 2 栏（服务端组件）用的是同一个 `PostCard` ——
  首页把它放进 `.home-posts` 并覆盖两行（卡片贴着一块 `.panel`，改用画布色；栅格更密）。
  第 13 项的标签 / 归档页复用同一个组件即可，**不要另写卡片**
  （文章页没有卡片，它给的是正文，见下面第 12 项）。
- 卡片上的小字（几分钟 / 置顶 / 草稿 / AI）跟着卡片走（`LIST_TEXT`），
  所以 `lib/home.ts` 里的 `posts.minutes` 与 `articlePending` 已经删掉 —— 首页不再各留一份同义文案。
- 标题可点与否由卡片自己判断（读 `lib/site.ts` 的 `ARTICLE_ROUTE`，约定第 8 条）：
  第 12 项把那个状态改成了 `"ready"`，所以首页与列表页的标题**已经是真链接**了 ——
  一行都没改 `PostCard` 与两个页面。
- 草稿徽章只在 dev 出现（生产构建根本不含草稿，但 dev 下容易忘记哪篇还没发布）。
- 「内容」档**不重复正文**：列表页的意义是挑文章，正文归文章页（第 12 项）。所以这一档停在
  「摘要 + 全部元信息」，并在卡片上如实说明。

### 12. 文章页 —— 已完成 ✅

**交付物**：`app/[lang]/posts/[...slug]/page.tsx`（服务端：构建期取这一篇并渲染成 HTML）、
`lib/article.ts`（这一页的唯一事实来源）、`components/article/` 下四个组件
（`ArticleToc` / `ArticleProgress` / `ArticlePager` / `GiscusComments`）、
`app/globals.css` 的「6e. 文章页」一节。原来第 3 项留下的开发态自检
（`components/dev/PipelineCheck.tsx` 与首页里那三行、以及 `.pipeline-check` 的 CSS）本次一并删掉。

- **正文在构建期就渲染好**：`getPostWithBody` → `renderMarkdown`，静态导出后这一页的 HTML 里
  就是完整正文 —— 没有 JS、爬虫、断网（PWA 缓存过）都能读（约定第 4 条）。只有三样东西是
  客户端的：悬浮目录（要观察滚动）、阅读进度（要读滚动量）、评论（第三方 iframe）。
- **宽度只有一个来源**：`.article-page { max-width: calc(var(--reading-measure) + 3rem) }`
  —— 页头、正文、上下篇、评论区同宽，读者在设置中心把正文调窄调宽，这一页整体跟着走。
  任何地方都**没有写死 42rem**（第 6 项留的待办，这里兑现）。
- **悬浮目录**（`ArticleToc`）：一组**真锚点**（`<a href="#heading-id">`，id 就是第 3 项
  `rehype-slug` 给的那个，不另造一套 slug），所以没有 JS 也能跳；高亮用 `IntersectionObserver`
  取「顶栏下方那一带里的第一条」，带里空着时**保留上一次高亮**（不然小节之间会闪）——
  与首页侧边指示器同一个做法。缩进档由 `lib/article.ts` 的 `tocIndent()` 换算
  （depth ≤2 不缩进 / 3 一档 / ≥4 两档），深于 `TOC_MAX_DEPTH` 的标题不列。
  ⚠️ 落地时的形态是「宽屏（≥78rem）才显示，窄屏那点宽度留给正文」；
  **后来补强过一次**（面板第一行加了开关：宽屏默认展开、窄屏默认收起成左下角一个挂件，点开是浮层）
  —— 见「文章页悬浮件补强」一节，这里保留原样是为了说明「为什么当初是隐藏而不是收起」。
  它会**值导入** `lib/article.ts`，所以那个文件对 `lib/markdown.ts` 只用 `import type`
  （否则整条 unified 管线会被打进浏览器包，文件头写明了这条）。
- **阅读进度 + 回顶**（`ArticleProgress`）：右侧 2px 细线 + 百分比牌子（宽屏才有牌子）。
  ⚠️ 这一轮补强过：细线现在是个 **`role="slider"`**（可拖、可用键盘），回顶按钮套了一圈**进度环** ——
  见「文章页悬浮件补强」一节；下面这段讲的是它落地时的形态。
  进度算的是**整页**的滚动比例，不是「正文读了多少」—— 免得出现「文章读完了、数字停在 87%」
  这种让人不放心的刻度。一次 `scroll`（passive）+ `requestAnimationFrame` 节流同时管两件事：
  画进度、决定回顶按钮是否出现（超过 `BACK_TO_TOP_AFTER = 600`）。回顶按钮不可见时
  `aria-hidden` + `tabIndex={-1}`（不会 Tab 到看不见的东西上），点击在
  `prefers-reduced-motion: reduce` 下用瞬时跳转。
  文章页右下角本来印着图纸图签（装饰），这一页把它让给回顶按钮
  （`.blueprint[data-decor="measure"] .blueprint-tag { display: none }`）——
  图纸编号在页头照样印着（`decorate(meta.href)`，与图签同一个来源），信息没丢。
- **上下篇**（`ArticlePager`）：无 hook、无 state，所以服务端组件直接渲染（文章末尾 `full` 档），
  同一份组件也被悬浮目录以 `compact` 档复用 —— 「上/下」只在 `articleNeighbors()` 里解释一次
  （顺序就是 `getPosts` 的时间倒序，页面里不再排一遍），两个位置都带日期，读不出歧义。
  只有一侧有邻居时那一格留在它该在的那一边（左 = 上一篇、右 = 下一篇），另一格不占位。
- **标签 / 分类片是链接**：链到列表页的筛选（`/zh/posts/?tag=…`、`?cat=…`），
  编解码只有 `lib/list.ts` 一处实现（约定第 9 条）—— 第 13 项的标签 / 分类页落地前，
  这就是站内唯一「按标签看文章」的入口。
- **giscus 评论**（`GiscusComments`）：配置在 `lib/site.ts` 的 `COMMENTS`（已接上
  `wunai-xc/Text-only-blog` 的 `Announcements` 分类；四个值只要有一个留空，就退回
  按约定第 2 条显示「编辑此处」+ 怎么配，而不是一个空壳 iframe）。四项都填了才会真的挂上去，
  并且：
  1. **懒加载**：滚到评论区附近（`rootMargin: 600px`）才插 giscus 的脚本 ——
     不读评论的读者一个字节都不会连到 giscus.app；
  2. **外观跟着站点走**：三套外观映射成 giscus 的 light / dark（表在 `lib/article.ts`），
     换外观时用 `postMessage` 通知 iframe 换配色（giscus 的官方接口），**不重新加载**评论区
     （重载会丢掉读了一半的评论列表）；
  3. **讨论的映射用 `specific` + 文章的站内路径**（`commentsTerm()` 会先切掉 `?tag=` 之类的查询串）：
     同一篇的中英版本、带查询串的地址都落到同一个讨论上；
  4. iframe 被拦掉 / 断网时给一行提示，正文不受影响。
  frontmatter 的 `comments: false`（别名 `comment`）可以关掉单篇的评论区。
- **metadata**：标题 / 描述 / 关键词 + OpenGraph `article`（发布与修改时间、作者、标签）。
  `alternates` 里 **canonical 用 `post.href`、languages 用同一 slug 的跨语言配对**，
  并把根布局那份 RSS 发现表（`feedAlternatesTypes()`）带了回来 ——
  Next 的 metadata 是浅合并，页面自己写 `alternates` 会把根布局那份整体覆盖（第 5 项记下的坑，
  第 10 项先堵了一次，这一项是第二次）。sitemap 与 RSS 里的文章 URL 从这一刻起才真的可访问。
- **frontmatter 的 `typography` 字段接上了**（第 4 项留给第 12 项的接口）：
  `parseTypographyOption()` 把 `false` / `{ spacing = false }` 这类写法翻成
  `RenderOptions.typography`，**返回 `undefined` 与返回 `false` 是两件事**
  （前者「没说」、后者「说了要关」）。规范在 `content/README.md` 第 9 节。
- **渲染警告进构建日志**：`renderMarkdown` 的 `warnings`（缺引用、公式没渲染成功……）在这里
  逐条 `console.warn`，带上源文件路径 —— 与第 3 项「写错公式不弄挂整站」的口径一致。
- **五线谱（abcjs）的配色缺口补上了**（第 6 项记下的待办）：abcjs 把颜色写在 SVG 元素
  属性上，且它的配色入口在不同版本里换过名字。赌选项名不如改结果，所以
  `components/charts/abc.ts` 在画完之后**只把「近黑」的 `stroke` / `fill` 换成 `--c-ink`**
  （`fill="none"`、作者自己指定的颜色一律不碰）—— 亮色外观下画面完全不变，暗色下才看得出区别。
  主题一换 `ArticleBody` 会清空重画，所以不需要任何订阅逻辑。
- **打印**：悬浮目录（含那个开关）、**粘性标题**、进度线（滑块）、百分比、回顶、评论区都不印
  （纸上点不动、iframe 也印不出来），正文转 11pt、宽度不再受限；
  文章末尾的上下篇留着（纸上的链接可以拿去地址栏敲）。
- **零文章时**（原写法是错的，第八次构建时被证实，见第 4 节「构建失败 —— 零文章时
  `generateStaticParams()` 返回空数组」）：这一页是**动态路由**，而静态导出要求动态路由
  **至少生成一条路径** —— `generateStaticParams()` 返回空数组会让构建直接失败，
  所以零文章时保一条保留路径 `/<lang>/posts/__empty__/`（`EMPTY_POST_SLUG`，lib/article.ts），
  它渲染的是「还没有文章」那一页（`noindex`、不进 sitemap、写下第一篇后自动消失）。
  **少文章时**：只有一篇则上下篇两边都为空 → `ArticlePager` 直接不渲染（不留空框）。
- **入口**：`lib/site.ts` 的 `ARTICLE_ROUTE.status` 改成 `"ready"` ——
  首页第 2 栏与列表页的卡片标题一起变成真链接（约定第 8 条），**没有改任何卡片代码**。
- ⚠️ 未在本机跑过浏览器（见第 8 节）：悬浮目录的高亮带、进度条与回顶的手感、
  giscus 懒加载与换配色、五线谱在三套外观下的观感，都需要你本机看一眼。

### 13. 其余页面 —— 已完成 ✅

**交付物**：七个新页面 —— `app/[lang]/{tags,categories,archives,search,about,links,settings}/page.tsx`、
共用组件 `components/pages/FacetIndex.tsx`、文案与纯函数 `lib/pages.ts`、
`app/globals.css` 的「6f. 其余页面」一节；另外收尾了 `/offline/`（第 5 项建的）与 404（第 1 项建的）。

**这一项的主线是「不写第二份」**，七页里只有两处真正的新代码：

| 页面 | 新写了什么 | 复用了什么 |
| --- | --- | --- |
| 标签 | 薄壳（metadata）+ `FacetIndex` | `getTaxonomy`（第 2 项）、`facetHref`（第 10 项） |
| 分类 | 同上，`kind="category"` | 与标签页**同一个组件**，差别只在 `lib/pages.ts` 的文案 |
| 归档 | 页面本体（时间线的渲染） | `getArchive`（第 2 项）、`LIST_TEXT.card` 的置顶 / AI / 草稿小字 |
| 搜索 | 薄壳（metadata + 文案） | **列表页那个组件**（`PostList`）整份复用，只多传 `autoFocusSearch` |
| 关于 | 页面本体 | frontmatter 里 `about: true` 的文章 + 第 3 项的渲染管线 + `ArticleBody` |
| 友链 | 页面本体 | `lib/site.ts` 的 `LINKS`（**八个，已填**；空数组则显示「编辑此处」） |
| 设置 | 薄壳（metadata） | **`components/SettingsCenter`** 整份复用（第 7 项就留好的口子） |

- **标签 / 分类页**：一次列全、带篇数，字号分四档（`lib/pages.ts` 的 `facetWeight(count, max)`，
  交给 CSS 的 `.facet-chip[data-weight="…"]`；只有一个标签时全落 0 档 —— 都一样多就没有「大一号」
  的意义）。片子沿用全站「虚线 = 标签、实线 = 分类」的观感（与卡片、文章页同一套）。
  它是**服务端组件、零状态**：点一个标签就是普通链接跳到列表页，由那一页接管筛选
  ——所以 JS 挂了、爬虫、离线三种情况下这一页都还能点。
- **归档页**：年 → 月 → 文章（新的在前，顺序沿用 `getArchive`，这一页不再排一遍）。
  **月份是分组、不是筛选**（列表页筛到「年」这一档），所以只有年那一行右边有
  「看这一年的全部 →」（`?year=YYYY`），月份那一行**故意不可点** —— 点不动比点进去发现筛选没生效好。
  想要月份筛选说一声，加一个 `?month=` 就能用。
- **搜索页**：**没有第二份搜索实现**（约定第 9 条）—— 它渲染的就是列表页那个 `PostList`，
  差别只有三处：页头文案、`autoFocusSearch`（挂载后把光标放进搜索框，且**读者已经点到别处就不抢**）、
  图纸编号（07 点阵）。数据仍在构建期取，所以不搜索也能读这一页。
- **关于页**：不是另写一份静态文案，而是渲染 frontmatter 里 `about: true` 的**最新一篇**
  （第 2 项的 `getAboutPost`，每语言各一篇）。渲染走第 3 项那条管线，frontmatter 的
  `typography` 也照第 12 项那样接上了；参考文献列表与 `updated` 那行小字沿用文章页的类。
  与文章页**刻意的差别**：没有悬浮目录、进度条、回顶与评论区 —— 它是一页说明，不是一篇长文。
  没有这样的文章时是空状态 + 怎么写（约定第 2 条）。
- **友链页**：数据只有 `lib/site.ts` 的 `LINKS` 一处（**八个，已填** —— 与 wunai-Blog 的
  `my-app/lib/links.ts` 同一份名单；空数组时显示「编辑此处」与填法，不渲染空清单）。
  卡片与 wunai-Blog 的友链页一致：左头像、右名字 + 一句话介绍，整张卡片可点；
  头像**外链直引**（原生 `<img>` + `loading="lazy"` + `referrerPolicy="no-referrer"`，
  没填头像时按名称首字画占位方块），介绍取当前语言、缺则退回中文，都没有时回退显示域名。
  外链一律 `target="_blank"` + `rel="noopener noreferrer"`，
  并且**把地址印出来** —— 点不动的时候（离线 / 对方改域名）读者还能自己复制。
- **设置页**：直接放第 7 项的 `SettingsCenter`（它当时就写明了「只负责内容、不管容器」）。
  于是**同一份设置界面现在有四处在用**：顶栏外观按钮、首页第 7/8 栏、左下角抽屉、这一页。
  这一页 `robots: { index: false }` 且不进 sitemap（对搜索引擎没有价值）。
- **`lib/pages.ts`**（新）：这几页的文案与纯函数（`facetWeight` / `monthName` /
  `archiveYearHref` / `tagHref` / `categoryHref`）都在这一个文件里。放在一起的理由写在文件头：
  它们都是「清单 + 跳转」型页面，文案结构一样，拆成七份只会让改一句话要开七个文件；
  真正的独立页面（有正文的）不往这里放。
- **`facetHref()` 挪进了 `lib/list.ts`**：文章页（第 12 项）原来有一个私有的同名函数，
  第 13 项的标签 / 分类页也要用 —— 于是「跳到某一类文章」的地址**只有一处实现**，
  文章页改成调它，删掉了自己那份（这正是约定第 9 条要的效果：查询串的编解码只有一处）。
- **页头统一**：第 13 项这几页都用列表页那一套类（`.list-head` / `.list-kicker` / `.list-no` /
  `.list-rule` / `.list-title` / `.list-lead` / `.list-meta`），不再各长一套页头
  （那三个 kicker 别名当时就是为此准备的）。
- **sitemap**：新增一张 `FACET_PAGES` 小表（标签 / 分类 / 归档 / 关于 / 友链）循环生成每语言一行；
  **搜索页与设置页故意不进**（两页都 `noindex`）。文章的 `postRoutes()` 不变。
- **`ROUTES` 全部改成 `"ready"`**：顶栏七项（首页 / 文章 / 标签 / 分类 / 归档 / 搜索 / 友链）
  现在**没有一项是压暗的** —— 它们本来就走 `RouteLink`，改状态就生效，没有去动顶栏代码。
- **离线页收尾**：`/offline/` 的「已缓存，断网也能打开」清单加上两个语言的**文章列表**
  （第 10 项已经把它们放进 `sw.js` 的外壳），并写明「打开过的文章地址断网时通常也打得开」。
  `sw.js` 的 `CACHE_VERSION` **没动**（外壳清单没变，只是页面里多列了两条已有的缓存项）。
- ⚠️ 未在本机跑过浏览器（见第 8 节）：标签云的字号档与长标签换行、归档在窄屏的两行排布、
  搜索页抢焦点的时机（手机上会不会弹键盘）、友链那八张头像能不能加载出来（要联网，
  本环境跑不了浏览器 —— 头像是外链，取不到时只留一格空白，卡片其余内容照旧）。

### 14. 交付 —— 已完成 ✅（只差锁文件）

**交付物**：`README.md`（站点说明 + 上手 + 写作入口 + 部署说明 + 「需要你亲自填的地方」清单 +
验证状态）与 PROJECTS.md 这份台账；`git` 提交推送。

- **README 的写法与这份台账分工**：README 给「第一次打开仓库的人」，
  只讲四件事 —— 这是什么、怎么跑起来、怎么写第一篇、怎么部署；理由、取舍、踩过的坑
  **一律留在 PROJECTS.md**（README 每一节末尾都指向它）。所以两份文件里唯一重复的是
  「几条最容易忘的规则」，且 README 那份是短版。
- **README 里那张「需要你亲自填的地方」表**是这一项真正的交付物：
  它把散在各处的「编辑此处」收成一张六行的清单（`SITE.description` / `CONTACT` / `COMMENTS` /
  `LINKS` / 首页第 1·7·8 栏的示范文字 / 文章本体），每行都写了**留空会发生什么**
  （页脚不渲染空链接、评论区不加载任何第三方脚本）。
  表里另列两处「不是文案、是资源」的缺口：PNG 图标（192/512）与文章缩略图 —— 都说明了
  「不做会怎样」，而不是留一句待办。
- **README 第 7 节把「没验证过」写在了明处**：没有在本机跑过 `npm install` / `npm run build`、
  没在真浏览器里点过；已经真跑过的只有 Cloudflare 云构建那一串
  （`bun install` → 编译 → 类型检查 → 静态导出 14/14 页），并指向台账第 8 节的验收清单。
- **表格里对得上的事实**都核过一遍：`package.json` 的五个脚本名（`dev` / `build` / `typecheck` /
  `preview` / `deploy`）、`wrangler.toml` 那三行、`.github/workflows/deploy.yml` 用的
  `cloudflare/wrangler-action@v3` 与 `command: deploy`、`lib/site.ts` 的 `SITE.description` /
  `CONTACT` / `COMMENTS` / `LINKS`、`lib/home.ts` 的 `intro.body` / `themes.demo` / `fonts.sample`、
  以及缩略图那两级目录（`lib/content.ts` 的 `COVER_DIRS = ["thumbnails", "covers"]`）——
  写文档时顺手把这些都对齐了，没有一条是凭印象写的。
- **⚠️ 锁文件仍然没有**：`bun install` 会现生成锁文件，而本环境**没有 shell**（跑不了任何命令），
  手写一份 `bun.lock` 是不负责任的（内容依赖真实的依赖解析结果），所以这一步留给你：
  在本机 `bun install`（或 `npm install`）后把生成的锁文件提交，同时可以按需把
  `wrangler` 写进 `devDependencies` 钉住部署工具版本；之后
  `.github/workflows/deploy.yml` 里的 `bun install` 可以加 `--frozen-lockfile`。
  这条**只影响依赖版本是否被钉死，不影响站点功能** —— 现在的 workflow 已经能跑（它特意避开了
  `npm ci` / `cache: npm`，见第 4 节「顺带发现的第二个坑」）。

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

### 构建失败 —— 类型检查两处 TS7006（2026-09-30，第七次云构建）

```
✓ Compiled successfully in 42s
  Running TypeScript ...
components/list/PostList.tsx(193,18): error TS7006: Parameter 'query' implicitly has an 'any' type.
components/list/PostList.tsx(198,39): error TS7006: Parameter 'query' implicitly has an 'any' type.
Failed to type check.
```

- 位置：`components/list/PostList.tsx` 的 `loadEngine()`（第 10 项写的代码）—— 两条 `return` 里的
  `search: (query) => …` 形参。编译（Turbopack）42s 通过，挂在**类型检查**，页面构建照旧没开始。
- 原因：`loadEngine` 的返回类型写成了**联合** `Promise<Engine | "error">`，两个 `return` 返回的又是
  **对象字面量**。TypeScript 不会把联合型返回类型顺着联合传给对象字面量的属性当上下文类型，
  于是 `search` 的形参 `query` 没有类型来源 —— 打开 `noImplicitAny` 就是 TS7006。
  同样的代码如果返回类型直接写 `Engine`（不带 `"error"`），上下文类型能落到属性上，不会报错；
  是「**联合**返回类型 + 对象字面量里的**函数属性**」这个组合才丢的上下文。
- 修法（最小改动、语义不变）：两处形参自己标类型 —— `search: (query: string) => …`，
  并在原地写了注释说明为什么不能省。**没有**用 `as Engine` 断言，
  也没有把返回类型收窄成 `Engine`（`"error"` 这个哨兵值后面还要用）。
- 同类写法在仓库里**没有第二处**：`grep 'Promise<'` 与 `grep 'useCallback(async'` 都核过，
  返回联合类型的函数只有这一个（其它 `Promise<…>` 都是页面 / metadata 的标准写法）。
- 顺带确认：本次日志里 `bun install` 之后又是 `Saved lockfile` —— 锁文件仍在构建容器里现生成、
  随构建丢弃（仓库里没有锁文件），与第 14 项那条待办一致。
- 仍未验证的：修完这两处之后类型检查与静态导出是否全绿、`out/` 的产物清单，
  都要等下一次构建（或本机 `npm run typecheck && npm run build`）。

### 构建失败 —— 零文章时 `generateStaticParams()` 返回空数组（2026-09-30，第八次云构建）

```
✓ Compiled successfully in 29.2s
  Running TypeScript ...
  Finished TypeScript in 5.4s ...
  Collecting page data using 1 worker ...
Error: Page "/[lang]/posts/[...slug]" returned an empty array from "generateStaticParams()".
  With "output: export", at least one route must be generated.
  at ignore-listed frames
> Build error occurred
Error: Failed to collect page data for /[lang]/posts/[...slug]
```

**先记好消息**：上一轮那两处 `TS7006` **修好了** —— `Finished TypeScript in 5.4s`，类型检查这一关
从第 12 项落地以来第一次通过；编译 29.2s 也比上一轮快（上一轮 42s）。失败点往后退了一步，
落在「收集页面数据」。

- 原因：文章页是**动态路由**（`[...slug]`），而 `output: export` 有一条硬规则 ——
  **动态路由至少要生成一条路径**，`generateStaticParams()` 返回空数组就是构建失败。
  本站按约定第 1 条**仓库里一篇文章都没有**，于是它必然返回空数组 → 这个站按约定必须能构建，
  而 Next 的规则不允许 → 两者直接撞上。这是第 12 项台账里那句
  「零文章时 `generateStaticParams` 返回空数组即没有文章页，不影响其它页面」**写错了**：
  它只对「页面存在与否」说得通，但 Next 在构建期就把这条路堵了。本次已把那句话改掉。
- 为什么前面几次构建没暴露：那几次（第二～六次）的「14/14 页」是**第 7~13 项落地之前**的仓库，
  那时还没有 `[...slug]` 这个动态路由。文章页是这一轮才第一次真的进构建。
- 修法（保一条保留路径）：
  1. `lib/article.ts` 新增 `EMPTY_POST_SLUG = "__empty__"`，并把「为什么需要它」写在那儿
     （双下划线开头：内容加载器本来就跳过下划线开头的文件，一眼能看出是保留名）；
  2. `generateStaticParams()`：正常返回全部真实 slug；**空数组时**改成返回
     `[{ lang: SITE.defaultLang, slug: [EMPTY_POST_SLUG] }]` 这一条；
  3. 页面里这条路径渲染 `EmptyArticlePage`（同文件内的一个小组件）——
     「还没有文章」的标题与说明取自 `ARTICLE_TEXT`（新增 `emptyTitle` / `emptyLead`），
     正文那两句**复用列表页的 `LIST_TEXT.empty` / `emptyHint`**（同一句话不写第二遍）；
     外壳沿用文章页的类，所以宽度照样跟着 `--reading-*` 走；
     **不带**悬浮目录、进度条、回顶与评论区（它不是一篇文章）；
  4. `generateMetadata()` 对这条路径给标题 + 说明，并加 `robots: { index: false, follow: false }`
     —— 它是构建占位、不是内容，也不进 sitemap（sitemap 的 `postRoutes()` 来自真实文章）；
  5. 作者写下第一篇之后**这个地址自动消失**（那时 `params` 非空，不再返回它），
     不需要任何清理动作。
- 为什么不用别的办法：`notFound()` 在静态导出下对一条 prerender 的路径会产出什么
  （404 内容落到那个路径、还是干脆报错）**没有实测**，赌不起；可选 catch-all
  （`[[...slug]]`）会让 `/zh/posts/` 同时匹配列表页与文章页，是路由冲突。
  保一条保留路径是唯一「确定不会报错、也不需要作者做任何事」的做法。
- ⚠️ 仍未验证：修完这一处之后能否一路走到 `✓ Generating static pages` 与 `out/`，
  以及最后那步 `npx wrangler deploy`（`wrangler.toml` 的 `[assets]` 至今没被真跑过一次）。

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

### 顶栏改版 —— 对齐 wunai-blog 参考稿

**交付物**：`components/SiteHeader.tsx` 重写（品牌 / 友链 / 图片位三段）、新增
`components/HeaderIntro.tsx`（客户端：三段错开淡入 + 切后台暂停光标）、
`components/SiteFooter.tsx` 多两块（站内导航 + 内容统计）、`components/RouteLink.tsx` 多一个
`title` 入参、`lib/site.ts` 新增 `HEADER_IMAGE`、`app/globals.css` 新增 `--header-h` 令牌并重写
「6b. 框架 UI」里的顶栏与页脚两节。

这是一次**修订**、不是新的第 15 项：站点功能一个没变，改的是「框架长什么样、入口摆在哪里」。

- **顶栏三段（与参考稿逐段对齐）**：
  ① **品牌** `.brand`：网格两列 —— 右边大号站名 + 闪烁光标（`.cursor`，`background-color:
  currentColor`，所以跟着站名颜色走），左边是正方位的**外观按钮**（还是 `ThemeSwitcher`，
  四态循环的交互没变）；第二行是**小字行**（`grid-column: 1 / -1`，两端对齐）：
  左「wunai 是谁？ About……」、右「全部文章 →」；
  ② **友链** `.friends`：只有一个入口（图标 + 小字竖直排），`margin-left: auto` 把它顶到最右 ——
  有 auto 外边距时剩余空间会先被它吃掉，所以「右靠」与 `.navbar` 上的 `justify-content` 无关；
  ③ **图片位** `.image-placeholder`：撑满顶栏高度的一格，图由作者自己放
  （`lib/site.ts` 的 `HEADER_IMAGE`）。
- **图片位的三个决定**（写下来免得以后当 bug 改）：
  1. 留空时画**虚线空位** + 「图片位 · 编辑此处」，尺寸与有图时**完全一致** ——
     顶栏是固定高（见下面的令牌），补图那天不会让顶栏跳一下；
  2. 用**原生 `<img>`** 而不是 `next/image`：静态导出下图片本来就不优化
     （`next.config.ts` 的 `images.unoptimized`），而且这张图由作者自己放、构建期不校验文件是否存在 ——
     走 `next/image` 会因为找不到文件而让构建报错；
  3. `alt` 留空 = 它是**装饰**（整格 `aria-hidden`，与参考稿一致）；填了 `alt` 就不再当装饰。
- **导航与内容统计搬去页脚**（参考稿把「站点控制项」放页脚，本站跟着做）：
  七个页面入口 + 语言切换 + 一行内容统计（文章数 / 字数 / 最近更新，构建期读一次
  `getContentStats`）。**别把它们删掉** —— 标签、分类、归档、搜索四页除了 sitemap 就没有别的入口了。
  站内链接仍然一律过 `RouteLink`（约定第 8 条），所以「页面没做好就不给死链」的机制照旧；
  统计那一行直接复用 `lib/site.ts` 里本来就有的 `statsPosts` / `statsWords` / `statsUpdated` /
  `statsEmpty` 四条文案，没有新增第二份（第 5 节约定第 3 条）。
- **顶栏高度只有一个事实来源**：令牌 `--header-h`（宽屏 `5.5rem`、≤48rem `4.75rem`、≤30rem `4.5rem`）。
  `.navbar` 拿它当 `height`；首页的 `--home-head-room` 由它算出来
  （`calc(var(--header-h) + 0.5rem)`）；文章页标题的 `scroll-margin-top` 读的也是 `--home-head-room`。
  **改顶栏的内容（站名字号 / 小字行 / 内边距）就回来量一遍这一个值**，别再去各处调偏移。
  ⚠️ 那两条窄屏的媒体查询**必须留在令牌那一段（未分层）**：`@layer` 里的声明压不过未分层的
  `:root` 规则 —— 写进「6b. 框架 UI」那一层等于没写，表现是「手机上顶栏没变矮，也看不出为什么」。
  顺带删掉了首页窄屏那档 `--home-head-room: 8.5rem`（顶栏现在是固定高，不会再折行变高）。
  改版时顺手把**最后两处手写的顶栏偏移**收进令牌：文章页悬浮目录的固定定位
  （原 `top: 6.5rem` / `max-height: calc(100vh - 11rem)`，现在是
  `calc(var(--header-h) + 1rem)` 与 `calc(100vh - var(--header-h) - 5.5rem)`，宽屏取值与原来一样）
  与 `.article-body` 标题的兜底 `scroll-margin-top`（原写死 `5rem`，现在读 `--home-head-room`）；
  加上首页的 `scroll-padding-top` 与文章页那条，全站已经没有手写的「顶栏让位高度」了 ——
  `grep 'scroll-margin-top\|scroll-padding-top\|top: [0-9]' app/globals.css` 现在只剩百分比与
  `top: 0` 那几个（与顶栏无关）。
- **`--frame-width` 只剩页脚与 `.page` 用**：参考稿的顶栏是**通栏**（品牌在左、图片位贴右），
  不再与正文同宽，于是 `.site-header-inner` 那套「居中 + 限宽」连同 `.site-brand` / `.site-logo` /
  `.site-caret` / `.site-nav` / `.site-nav-entry` / `.site-titleblock` 一起删掉；
  语言切换那枚「小按钮」的外观改名成 `.site-footer-nav-link`（同一种样子，换了主人）。
- **入场动效是渐进增强的，顺序不能反**（`components/HeaderIntro.tsx`）：
  默认（CSS 里）**可见** → JS 就绪后才加 `.fade-ready` 把它藏起来 → 下一帧加 `.is-visible` 播过渡，
  三段各错开 90ms。写反了（默认就藏着）会让 JS 失败 / 被拦时**顶栏永久不可见**，
  这是这一块唯一的风险点；`prefers-reduced-motion: reduce` 的人一帧到位、不参与过渡。
  站名后那根光标是无限动画，标签页切到后台时挂 `.is-paused` 停掉（省电）。
- **`RouteLink` 多了 `title` 入参**：pending 态原来固定显示「这一页还没做（第 N 项落地）」，
  而友链那个入口自带一个说得更清楚的提示 —— 两者现在**拼起来**（`标题 —— 第 N 项落地`），
  而不是让自定义提示**盖掉**「还没做」这句话（那会让人以为页面已经好了、只是点不动）。
  `ROUTES` 里现在已经没有 pending，这条纯粹是留给下一批页面的。
- **两处取舍写在这里**（改回去只要删对应代码）：
  ① 站内导航与内容统计放在**页脚第一块** —— 它们原先是顶栏的第二、第三段，搬到页脚是为了
  照参考稿把顶栏留给「品牌 / 友链 / 图片位」这三段；
  ② 顶栏的站内链接仍走 `RouteLink`（没有直接写 `<Link>`），所以「页面没做好就不给死链」
  这条机制在顶栏、页脚、首页三处是同一套。
- **打印**：顶栏照印（`position: static`），但**图片位不印** —— 一格虚线空位在纸上是纯噪音，
  作者补了图之后它也只是装饰，不该在每一页的纸上都占一块；要印就删掉 `@media print` 里那一条
  `.image-placeholder { display: none }`。
- **这一项没动的**：三套颜色令牌、层序（顶栏仍是 `z-index: 20`、齿轮 40 / 遮罩 45 / 抽屉 50）、
  `.page` 与正文度量（`--reading-*`）、PWA 与构建产物、任何页面本体 —— 只碰框架件。
- ⚠️ **未在本机跑过浏览器**，请按第 8 节新增的那几条看：窄屏（320px 上下）小字行是
  `white-space: nowrap`，最值得确认的是它会不会把图片位顶出屏幕；以及入场那一下
  （渐进增强的代价是「先可见 → 再淡入」，慢设备上可能看得到这一瞬）。

### 背景改成纯色（图案层关掉）

**站长要的是「全站背景纯色」**，所以第 8 项那套「一页一张图纸」的背景图案**默认关掉了** ——
每页的 `data-decor` 都是 `plain`，纸面只剩 `<html>` 上那一层 `--c-canvas`：
没有网格、没有粗格、没有边缘淡出、没有虚线图框。

- **改法是一个开关，不是删代码**：`lib/decor.ts` 新增 `export const DECOR_PATTERNS = false;`，
  `decorate()` 里 `pattern: DECOR_PATTERNS ? PATTERNS[section] : "plain"`。
  图案表（`PATTERNS`）与 `app/globals.css` 第 5 节那七套图案**一行都没删**，
  把那个常量改成 `true` 就整套恢复（编号、图签、`data-route` 微调都跟着回来）。
- **CSS 侧补了一条**：`.blueprint[data-decor="plain"]::before { display: none }` ——
  边缘淡出那一层也关掉，这样这一层是**真的**什么都不画（否则它会在纯色上再画一遍同色渐变，
  看不出差别，但没有必要留着）。
- **还留着的东西**（不是背景，没动）：
  1. **右下角的图签**（`TOB-ZH-01` + 这一页的名字）：它随路径变，所以「哪一页印哪张图纸」这件事
     没丢 —— 想连它也去掉，删 `components/BlueprintBackground.tsx` 里那个 `.blueprint-tag`
     或给 CSS 加一条 `.blueprint-tag { display: none }` 即可（说一声我来做）；
  2. **换页时那一层 0.32s 的淡入**：图案没了之后看得见的效果只剩图签淡一下，仍然不做转场动画。
- **顺手修掉一处会因为这次改动而失效的判断**：文章页原来靠
  `.blueprint[data-decor="measure"] .blueprint-tag { display: none }` 把右下角让给回顶按钮 ——
  背景关掉后每页的 `data-decor` 都是 `plain`，这条就永远不成立了（图签会跑到回顶按钮底下）。
  判据改成 **`data-route="article"`**（这一页是哪张图纸，与图案名无关），行为回到原样。
- **验收**（也在第 8 节那组里）：随便逛几页，背景应当是一整块纯色、滚动时不变；
  右下角（文章页除外）应当只有图签那两行小字；`view-source` 里
  `data-decor="plain"`、`data-route` 仍然是 `home` / `posts` / `article`……
- ⚠️ **后来「环境色大色块」（第 8 项的扩展）在这层之上又加了一点颜色**：
  底色仍然没有图案（本节说的「纯色」指的是**没有图案**这件事，仍然成立），
  但纸面上多了三块低浓度的大色块（`--ambient-alpha` 压着，纸 0.18）。
  觉得不够纯 → 把那个令牌调小或设成 `0`（色块还在、只是看不见），
  或者删掉 `app/layout.tsx` 里的 `<AmbientBackdrop />`。见「环境色大色块 + 换页渐入」一节。

### 首页改版 —— 一栏一屏（去掉并排与卡片外壳）

**站长要的是**：首页是多栏目页面，**一个栏目占一屏**，栏目不要卡片效果，吸附不要乱。
原来的实现正好反着：八栏被拼成 5 行（宽屏两栏并排）、吸附是 `proximity`（有时吸有时不吸）、
每栏还套着 `.panel`（边框 / 圆角 / 阴影 / 面板底色）。三处都改掉了：

- **一栏一屏**：`lib/home.ts` 的 `HOME_ROWS`（带 `pair` 的二维表）换成
  `HOME_ORDER: HomeBlockId[]`（一维数组，顺序即版面），页面直接
  `HOME_ORDER.map(...)` 渲染成 8 个 `<section class="home-block">` —— 不再有 `.home-row` 这层
  包装，也**不再有并排**（并排等于把两栏塞进同一屏，与「一栏一屏」直接冲突）。
  `homeNumber()` 仍从版面推 01~08，`HOME_BLOCK_COUNT` 跟着走。
- **去掉栏目卡片效果**：`<section>` 不再带 `panel` 类 —— 没有边框、圆角、阴影、面板底色，
  整页同一个底色。一屏就是一块版面，靠「吸附 + 栏头（栏号 + 虚线）」区分，不靠框。
- **吸附改成 `mandatory`，而且每一栏都**正好一屏**：`.home-block` 自己就是吸附块
  （`height: calc(100svh - var(--home-head-room))`、`scroll-snap-align: start`），
  `html:has(.home-flow)` 用 `scroll-snap-type: y mandatory` —— 吸附点只落在整屏的位置上。
- **第二轮修的是「还不够确定」那三处**（第一轮写成 `min-height` + `scroll-snap-stop: always`，
  仍然会乱，所以又改了一遍）：
  1. `min-height` → **定高 `height` + `overflow-y: auto`**：栏比一屏高时（手机上的第 2 / 6 栏）
     原来的写法把整栏拉长，吸附区跟着比一屏高 —— 吸附区比视口高时，滚动中途没有合法停靠点，
     一松手就被拽回栏首或下一栏，这就是「混乱吸附」的根。改成定高一屏 + 内容**在栏内滚**之后，
     每个吸附区都正好一屏。栏内的滚动条**不画**（`scrollbar-width: none` + `::-webkit-scrollbar`）：
     它是实现细节，不该在版面上多一条竖线；滚到底会照常链到外层。
  2. `scroll-snap-stop: always` **去掉了**：吸附点已经是整屏，落到哪都在栏头上；
     留着它只会把一次滑动锁成一栏，手机上去最后一栏得滑七次。
  3. **页脚补一个吸附点**：`html:has(.home-flow) .site-footer { scroll-snap-align: end }`。
     吸附是给整个文档的，文档末尾没有吸附点的话，滑到页脚会被吸回最后一栏 ——
     页脚（七个入口 / 联系方式 / 版权行）就永远读不到。这是 mandatory 吸附最常见的坑，
     不是审美问题。
- **居中从 `.home-block` 挪到内层 `.home-block-body`**（`min-height: 100%` + 居中 + 0.7rem 间距）：
  直接在滚动区上写 `justify-content: center`，一旦内容溢出，栏头那一头就**永远滚不到**
  （不用 `justify-content: safe center` 那种新语法，多一层就绕开了）。页面里因此多了一个
  `<div class="home-block-body">`，八个栏目共用同一层。
- **两条容易漏的尺寸细节**：
  1. `.home-flow` 的 `gap` 与上下内边距都去掉了（留缝会让「一屏 = 一栏」算不准），
     只在顶部补一段**与吸附让位同值**的留白（`--home-head-room`）—— 顶栏是吸顶的，
     会盖住文档最上面那一截；补同值才保证「第 N 栏 = 往上翻 N − 1 屏」对每一栏都成立
     （第一轮补的是 `--header-h`，第一栏与其余七栏差 0.5rem）；
  2. 窄屏那档 `min-height: auto`（原来为了让手机上好读）**删掉了**：一栏一屏是这次的要求，
     手机上也一样。
- **文章栏的条数跟着收了一档**：`app/[lang]/page.tsx` 的 `HOME_POST_LIMIT` 6 → 4 ——
  一栏一屏之后，卡片多到超过一屏就白搭（手机上尤其明显）。想要更多，改那一个数字。
- **印刷与减少动效**：`@media print` 里 `.home-block { height: auto; min-height: 0; overflow: visible }`
  （纸上是连续文档，不然只印得出每栏的第一屏）；`prefers-reduced-motion: reduce` 的人不吸附、
  不做平滑滚动，同时也把一屏定高放开（`height: auto` + `min-height: 一屏` + `overflow: visible`）——
  没有吸附还定高，只会把人困在一栏里往下翻不动。
- **验收**（也在第 8 节那组里）：一次滑动应当正好换一栏、栏头停在顶栏下面；
  每一栏里没有框、没有底色块；手机上第 2 / 6 栏在栏内滚（滚动条不画、滚到底继续滑会换栏）；
  滚到最底部能读到整个页脚。

### 卡组页 + 新文章 404 的根因（站长报「新文章打不开」这一轮）

站长在手机上看到两件事：**新文章点不开**、**明明是卡组却只显示一篇文章**。两件都查到了根因，
都不是猜的（证据是线上 HTML 与提交记录，不是本地推演）：

1. **新文章打不开 —— 非 ASCII slug**。线上 `/zh/posts/` 的卡片是
   `<a href="/zh/posts/notes/笔记/">笔记1</a>`：`content/zh/posts/notes/笔记.md`
   的 frontmatter 里**没有 `slug`**，于是 slug 由文件路径推出 `notes/笔记` —— 一个中文 slug。
   浏览器会把 href 里的中文百分号编码成 `/zh/posts/notes/%E7%AC%94%E8%AE%B0/`，
   而静态导出的目录名是**中文原文**，Cloudflare 的静态资源在查文件前又解码一次 ——
   两边永远对不上，表现就是「卡片在、点进去 404」（实测 `/zh/posts/note-1/` 404）。
   **修法两处**（缺一不可）：
   - 内容侧：`content/zh/posts/notes/笔记.md` 补一行 `slug = "note-1"` → 地址变成
     `/zh/posts/note-1/`（ASCII）；
   - 代码侧：`lib/content.ts` 新增 `assertUrlSafeSlug()`，**slug 不是 ASCII 就让构建当场失败**
     并给出改法（改文件名，或补一行 `slug`）。理由是不让作者去线上猜「为什么打不开」：
     以前这条错只在 Cloudflare 上表现出来，构建是「成功」的。
     报错信息分成「frontmatter 里写了 slug」与「没写 slug（推出来的）」两种说法。
2. **卡组只显示成一篇**。卡组（目录）分块显示的那部分改动**只在工作区、没提交**
   （线上跑的还是上一次成功构建的产物），所以线上列表页是一列平铺的卡片，
   `notes/` 这个目录看不出是个卡组。

**这一轮同时补上的四件事**：

| 改动 | 为什么 |
| --- | --- |
| **卡组页** `/<lang>/posts/<group>/`（`app/[lang]/posts/[...slug]/page.tsx` 里的 `CardGroupPage`） | 站长的自然动作是敲目录名；以前那是 404。卡组现在有自己的一页：组名 / 说明 / 封面 / 组内卡片（复用 `PostCard`）。**与文章页共用同一个 catch-all**，因为 `notes/index.md`（目录首页）与目录 `notes/` 都会落到同一个地址 —— 拆成两条路由必然撞车，所以顺序是「先文章、后卡组」 |
| `lib/content.ts` 的 `getCardGroupRoutes()` | 卡组页的路由表只推一次：`generateStaticParams` 与 `sitemap` 都用它（排除顶层 `""`、以及被一篇文章占着的 slug） |
| 列表页的**组头变成链接**（`lib/list.ts` 的 `groupHref()`） | 组头点得进去，地址与卡组页、sitemap 同一份来源，不会各拼一遍 |
| 工具栏**默认收起、不再自动展开** | 站长原话：「都收在一块，不要展开到时候一堆标签……放一整个页面吗？」——默认只留一行「筛选 + 当前条件 + 显示几篇」；只有**专门的搜索页**（`autoFocusSearch`）才挂载后展开。带筛选条件的地址（标签页链过来的）也保持收起：条件已经写在收起那一行里，没必要摊开一整套控件 |

- 卡组页的封面走 `_index.md` 的 `cover`（缺省退回组内第一篇），CSS 里固定 `max-height: 13rem`
  + `object-fit: cover` —— 一张竖图不该把页头撑到一屏；没有封面就不渲染。
- 卡组页写死「适中」密度：密度是本机偏好（`tob:list-density`），构建期读不到（与首页第 2 栏同一取舍）。
- 验收（**都要在本机或线上重新构建之后**看，本环境无 shell）：
  1. `/zh/posts/` 里应当看到「卡组 / 笔记」组头、下面是 `笔记1` 那张卡片；
  2. 点卡片标题 → `/zh/posts/note-1/` 打得开（**不再**是 `/zh/posts/notes/笔记/`）；
  3. 点组头 → `/zh/posts/notes/` 是卡组页（组名 + 篇数 + 卡片），不再是 404；
  4. `/zh/posts/` 的工具栏默认**只有一行**，点一下才展开；`/zh/search/` 打开时是展开的；
  5. 故意写一个中文 slug（不补 `slug` 字段）—— 构建应当**当场失败**并指出改法。

### 文章页悬浮件补强 —— 目录开关 / 可拖进度 / 回顶进度环 / 粘性标题

站长这轮要的是文章页那几件悬浮件的**手感**：目录得能收起来、进度条得能拖、回顶按钮要带进度环、
正文标题得粘住。四项都落在文章页，**没有新页面**，改动集中在一个新组件与两个老组件 +「6e. 文章页」那节 CSS。

| 文件 | 改动 |
| --- | --- |
| `components/article/ArticleStickyTitle.tsx` | **新增**（粘性标题） |
| `components/article/ArticleToc.tsx` | 面板第一行加开关（收起 / 展开），窄屏改成左下角弹出的浮层 |
| `components/article/ArticleProgress.tsx` | 细线变成 `role="slider"`（可拖 + 键盘）；回顶按钮套一圈进度环 |
| `lib/article.ts` | 新增 `TOC_WIDE_QUERY` / `PROGRESS_KEY_STEP` / `STICKY_TITLE_OFFSET` 与三句文案（中英各一份） |
| `lib/icons.ts` | 补 `mdi:chevron-left`（目录开关的箭头） |
| `app/[lang]/posts/[...slug]/page.tsx` | 挂上 `<ArticleStickyTitle lang={lang} title={meta.title} />`（`<article>` 的第一个子元素） |
| `app/globals.css` | 「6e. 文章页」：粘性标题一节、目录改成可收起的面板、进度改成滑块、回顶加环；打印时四件一起不印 |

**1. 目录开关 —— 默认状态交给 CSS，JS 只管读者点过之后的选择**

面板的第一行就是那个开关（`aria-expanded` / `aria-controls` 都对着面板内容区），所以「收起」不需要
另造一个挂件的位置：收起后它就是那个挂件。

- **宽屏（≥78rem）默认展开**，位置与第 12 项落地时一模一样（左侧贴顶栏下面）。
  这是刻意的：**没有 JS 的宽屏读者照旧看得到目录**（目录本来就是一组真锚点，CSS 一层就够）；
- **窄屏默认收起**，挂件在**左下角**：左上角被吸顶顶栏占着、右下角是回顶按钮，只有左下角是空的
  —— 它正好叠在设置齿轮上面（`bottom: 3.9rem` = 齿轮的 0.85 + 2.4 + 0.65）。点开是从那里弹出的浮层
  （`max-height: min(60vh, 24rem)`，自己滚），**点其中一条目录就顺势收起**（挡住了正文就没意义了）；
- **`data-open` 不写 = 按 CSS 的默认**，只有读者点过之后才写死 `true` / `false`（本次浏览内记住）。
  这样 SSR / 无 JS 时的行为就是「宽屏展开、窄屏收起」，不会先闪一下再变；
- 组件读 `TOC_WIDE_QUERY`（= `(min-width: 78rem)`，与 CSS 那条媒体查询**同值**）只为了两件事：
  把 `aria-expanded` 说准、以及决定「点一条要不要收起」。**改断点要改两处**（代码与 CSS 的注释里都写了）；
- 断点仍取 78rem 的老理由：`(78 - 页面列宽 45) / 2 ≈ 16.5rem`，够 12rem 的目录加边距。

**2. 进度条滑块 —— 那条 2px 细线现在是个 `role="slider"`**

- **命中区放宽到 0.9rem**（触屏 0.7rem）：2px 的东西根本抓不住；视觉上仍是右边缘那一条线，
  轨道与拇指**只在悬停 / 聚焦 / 拖动时**才画出来 —— 不悬停的时候这一页看起来与以前一模一样；
- 轨道**铺满视口高度**，所以「指针纵坐标 ÷ 视口高」就是百分比，拖到哪就是哪（只有一个 `seekTo()`）；
- **先承认这是拖动、再动页面**：触屏上要先把指针移动 `DRAG_THRESHOLD = 6px` 才算拖动 ——
  手机右边缘常被拿来滚页面，一按就跳会吓人（轨道上是 `touch-action: none`，所以那一下不会同时滚页面）；
  鼠标不受这条限制：按一下轨道就跳过去，那是滚动条的手感；
- 拖动用 `setPointerCapture`：拖出轨道、拖出窗口都继续跟手；`seekTo` 会**立刻**写一次进度，
  不等 scroll 事件那一帧（差这一帧就看得见「跟不上手」）；
- **键盘也能走**：↑/↓ 或 ←/→ 一步（`PROGRESS_KEY_STEP = 5`）、PageUp/PageDown 三步、Home/End 到两头，
  `aria-orientation="vertical"`。它是个可以 Tab 到的控件，所以 CSS 里补了**自己的焦点框**
  （全局那条 `:focus-visible` 只认 a / button / input 这类元素，管不到这个 div）；
- 无 JS 时这条轨道只是躺着（拖不动）—— 与「无 JS 时百分比牌子是 0%」同一档取舍。

**3. 回顶进度环 —— 一圈 `stroke-dashoffset`，与右边那条线读同一个数**

- 按钮从 2.4rem 放到 **2.6rem** 给环留位置；SVG 是 36×36 的 viewBox、半径 16.5，
  周长在组件里算（`RING_CIRCUMFERENCE`），CSS 里 `rotate(-90deg)` 把起点挪到 12 点方向；
- 环、百分比牌子、右边缘那条线**读的是同一个 `progress`** —— 不会出现三个地方三个数；
- 按钮出现与否仍由 `BACK_TO_TOP_AFTER`（600px）决定：环是这颗按钮的一部分，不是常驻的指示器。

**4. 粘性标题 —— 零高的 sticky，贴在 `<article>` 里面**

- 容器 `position: sticky` + **`height: 0`**（不占版面：正文第一行不会被推下去），
  绝对定位的横条挂在它上面、两端各外扩 1.5rem（正好顶到 `.page` 的内边距，与正文列同宽），
  长标题一行到底 + 省略号；
- 放在 `<article>` **里面**（不是 `fixed`）：于是它**随文章一起结束** —— 滚到评论区它自己就走
  （评论不是这一篇的正文，`fixed` 的话会一直压着评论区）。顶部读令牌 `--header-h`，不手写 rem；
- 出现 / 消失用 IntersectionObserver 看正文的 `<h1>`：h1 还在视野里就藏着（它和页头是同一块信息），
  滚过去才出现，退回顶部自己消失。判定线是 `STICKY_TITLE_OFFSET`（**与目录高亮那条同值** = 顶栏下沿）；
- 它对读屏是 `aria-hidden`（那串字与 `<h1>` 一模一样，报第二遍是噪音），所以里面**不放任何能点的东西**；
- 层序 17：低于目录（18）与进度（19）—— 窗口很窄又选了大号正文时目录面板会压到它，
  那时让目录在上面（读者正在点目录）。

**验收**（都要在你本机或线上重新构建之后看，本环境无 shell）：

1. **目录**：宽窗口（≥78rem）打开文章页，目录照旧在左上角展开；点那行「目录 ‹」应当收起成一个小挂件、
   箭头翻过来指右，再点又展开。**把 JS 关掉**刷新 —— 宽屏下目录仍然在（这是刻意保住的）；
2. **窄屏**：手机上目录默认只剩左下角那个挂件（在齿轮上面、不压正文）；点开是从左下角弹出的浮层、
   自己可以滚；点其中一条目录 —— 页面跳过去**并且浮层收起**；
3. **进度滑块**：桌面把鼠标移到右边缘那条线附近，应当出现一条更亮的轨道与一颗小圆点；
   按住往下拖 —— 页面应当跟着走、跟手、不抖（拖出右边框也继续跟手）；点轨道上任意一处应当直接跳过去；
   触屏上**按一下**不该跳（要先移动一点才算拖动）；**Tab 到它**应当有焦点框，↑/↓、PageUp/PageDown、
   Home/End 都能走；
4. **回顶进度环**：滚过 600px 后右下角那颗按钮里应当有一圈短线围成的环，环的长度与右边缘那条进度线
   **同步**（读到文章底部时闭合成整圈）；点它平滑回到顶部；系统开「减少动效」时是瞬间跳转；
5. **粘性标题**：往下滚过大标题，顶栏下面应当挂出一条紧凑的标题（左边一个「正文」小字），
   滚回顶部它自己消失；滚到评论区之后它也应当没了（`<article>` 结束）；窗口很窄时标题长应当出省略号；
6. **打印预览**（Ctrl+P）：这四件（目录与它的开关、粘性标题、进度线、回顶）都不该出现在纸上；
7. 顺手看一眼三套外观（纸 / 亮 / 暗）下这四件东西的颜色 —— 全部走令牌，不该有写死的颜色。

⚠️ **本环境无 shell**：以上都只在纸面上推演过（`npm run typecheck` / `npm run build` 都没跑过）。
第 3 条（滑块的手感）与第 2 条（手机上浮层的位置）最值得你先看 —— 不满意我再调。
`ArticleProgress` 那两个常量（`DRAG_THRESHOLD` 6px、`PROGRESS_KEY_STEP` 5）与目录那个断点
（`TOC_WIDE_QUERY`）就是用来调的三颗旋钮。

### 环境色大色块 + 换页渐入（第 8 项的扩展）

**站长这轮要的是**：① 全站页面切换要有**不影响阅读的渐入**；② 每一页有**自己的大色块模糊背景
或结构覆盖**，且**不挡字**；③ 每次换页，图形要**丝滑变成另一种图形**。
中途站长又补了一句硬要求：**「不要任何格子背景，背景干净点」** —— 于是第一版那套「结构覆盖」
（同心环 / 交叉网 / 点阵 / 色带 / 弧，全是渐变线格）**整套删掉**，这一层只剩大色块。
⚠️ **别再往回加图案 / 网格 / 线**：那是被明确否掉的东西（`lib/decor.ts` 与 globals.css 第 5c 节
两处注释里都写了这一句）。

**交付物**：`lib/decor.ts` 新增 `AMBIENTS`（12 页穷尽表：每页三块大色块的颜料号 / 圆心 / 直径 /
椭圆朝向 / 浓度）与三个常量（`AMBIENT_SHIFT_MS` / `AMBIENT_BASE_VMAX` / `PAGE_FADE_MS`）；
新组件 `components/AmbientBackdrop.tsx`（环境色层）与 `components/PageIntro.tsx`（换页渐入），
都挂在 `app/layout.tsx`；`app/globals.css` 新增「5c. 环境色层」与「5d. 换页渐入」两节 +
三套外观的环境色令牌（`--ambient-tint-1…6` / `--ambient-alpha`）+ 打印不印。

- **层序**：环境色层挂在蓝图层**前面**（body 的第一个装饰层）= 画在它下面，
  两层的定位与 `z-index` 完全一样（`fixed; inset: 0; z-index: -1; pointer-events: none; aria-hidden`）。
  所以右下角图签、（将来若打开的）图纸网格都还压在大色块上面。
  **别把这一层往上层挪**：顶栏是 20、设置齿轮 40、遮罩 45、抽屉 50、加载线 60（第 4 节第 7 项那张层清单）。
- **色块怎么画**（globals.css 第 5c 节）：一个 `position: fixed` 的容器（`z-index: -1`）+ 三个
  `<span class="ambient-blob">`。每块**宽高恒定**（`36vmax`，由行内样式给），
  圆心 / 大小 / 椭圆朝向全部落在 `transform: translate(…) rotate(…) scale(sx, sy)` 上 ——
  这是这一层唯一的技术点：**换页时浏览器插值 transform 与 background-color**，就是「丝滑形变」。
  为什么不让宽高按页变：遮罩要按元素尺寸栅格化，尺寸每帧变就会发涩（手机上尤其）。
  软边用 `mask-image: radial-gradient(closest-side, …)` 而不是 `filter: blur()`：
  手机上一大片 blur 会每帧重新栅格化，遮罩是一次性的（并且 `border-radius: 50%` 兜底：
  没有 mask 的老浏览器拿到的是一块圆色斑，不是方角块）。
- **每页独特**：靠**位置 / 大小 / 椭圆朝向 / 颜料**四样一起变（相邻两页一定不一样）——
  首页暖褐大块压左上、列表页两条竖长色斑贴左右、正文页只在两个角留一点、离线页只有上下两片淡色……
  用不到的第三块写 `fade: 0.3` 那种低浓度（**不是删行**）：元素固定三块，形变才不会「跳变」。
- **可读性预算**（约定第 5 条，改数之前先读）：整层只有一处
  `opacity: var(--ambient-alpha)`（纸 0.18 / 亮 0.14 / 暗 0.22），色块边缘还是软下去的；
  正文 `--c-ink` / `--c-canvas` 对比度本来在 12:1 以上，压上这一层仍远超 AAA。
  另外**正文页整层再压到六成**（`.ambient[data-route="article"]`）、**窄屏再压一档**
  （手机上 80vmax 的色块占的视野比桌面上大得多）。这一层 `position: fixed`、不占文档流，
  所以不可能引起版面跳动（CLS）。
- **换页渐入**（第 5d 节 + `PageIntro`）：换页后 `.site-main` 从 `opacity: 0.3` 淡到 1（420ms）。
  四个刻意的取舍：
  1. **只淡不位移**：`.site-main` 上只要出现 `transform`，它就成了 fixed 后代的包含块 ——
     文章页右侧那条可拖的进度轨、左下角目录挂件会在动画期间跟着它走（肉眼看到「跳一下再归位」）；
  2. **首帧不播**：首屏是一次「已经翻开的纸」，没有「换页」这回事（与 `BlueprintBackground` 同规矩）。
     判定用「上一次播过的路径」而不是 `mounted` 布尔 —— 开发模式会把 effect 跑两遍，
     布尔会被第一次跑掉，于是首屏也淡一次；
  3. **在布局阶段挂属性**（`useLayoutEffect`，服务端用 `useEffect` 顶替以免 SSR 警告）：
     属性若在 paint 之后才挂上，新页面会先**全亮一帧**再变暗淡上来（一次闪光）——
     布局副作用在 paint 之前跑，新内容的第一帧就已经是 0.3；
  4. 连着快速换两页时先摘属性、**强制一次样式重算**再挂回去，否则浏览器认为「动画没变」，
     第二次渐入不会重新开始。
  最低只到 0.3（不是 0）：这 420ms 里字一直看得见、可读。
- **动效时长只有两个令牌**：`--ambient-shift`（1100ms，色块形变）与 `--page-fade`（420ms，正文渐入），
  组件里的毫秒数（`AMBIENT_SHIFT_MS` / `PAGE_FADE_MS`）必须与它们对齐 —— 改一处要改两处。
- **减少动效**：`prefers-reduced-motion: reduce` 下色块不做过渡（一帧到位，换页也照样换色块）、
  渐入属性根本不写、换外观那 0.18s 的浓度过渡也一起关掉。
- **打印**：`.ambient { display: none }`（纸上没有「背景气氛」这回事，半透明色块印出来只是脏色）。
- **令牌位置**：色值在三套外观的令牌块里（约定第 7 条：颜色只有一个落点），
  `lib/decor.ts` 只说「用几号颜料」；`AMBIENTS` 是 `Record<DecorSection, Ambient>`（穷尽类型），
  新加一页忘了给规格 TypeScript 会直接报错。
- **验收**（也在第 8 节那组里）：换几页看大色块是不是**挪过去**而不是整层重铺、正文底下的色
  是不是很淡、三套外观各看一遍、系统开「减少动效」后不再有过渡、打印预览里不该有色块。

### 跨项待办（做到对应项时顺手勾掉）

- **第 7 项（框架 UI / 设置中心）—— 已完成**，这条留档并转成「后续项要用到的东西」：
  1. ✅ 外观选择器走 `lib/theme.ts` 的 `setThemeChoice()` / `THEME_CHOICES` / `THEME_LABELS`，
     当前选中项读 `currentThemeChoice()`；**没有**第二份 localStorage 与 `data-theme` 读写；
     `THEME_LABELS.hint` 已从「一句中文」改成 `{ zh, en }`（英文界面不该冒中文）；
  2. ✅ 阅读偏好在 `lib/prefs.ts`：三档选项表 + 首帧脚本（`PrefsInit`）+ 写入 `--reading-*`。
     档位值就定在 `READING_WIDTHS / SIZES / LEADINGS` 里（34/42/52rem、0.98/1.0625/1.18rem、1.6/1.85/2.1）；
  3. ✅ 顶栏、页脚、抽屉全部用令牌与 `.panel`，没有写死颜色，`dark:` 变体一个也没有。
- **第 9 项（首页）—— 已完成**，这条留档并转成「后续项要用到的东西」：
  1. 首页的**版面与文案只有一个事实来源**：`lib/home.ts` 的 `HOME_ORDER`（八栏的顺序；
     首页改版前那张带「哪两栏并排」的 `HOME_ROWS` 已经不需要了，要改顺序就改这一个数组）
     与 `HOME_TEXT`（中英各一份）。`app/[lang]/page.tsx` 只负责「按顺序渲染成 <section> +
     把数据传进去」，**不要**在页面里调顺序或加栏 —— 加一栏 = 数组里加一个 id + 一个组件 +
     `blocks` 里补一条（`Record<HomeBlockId, ReactNode>` 是穷尽的，漏了 TypeScript 直接报错）；
  2. 栏号（01~08）由 `homeNumber()` 从版面表推出来，**别在文案里手写编号**；
  3. 吸附用 `html:has(.home-flow)` 那一条 CSS（不认 `<html>` 上的 class，也不需要 JS；
     首页改版后是 `y mandatory` + `.home-block` 一栏一屏）；
     要加新页面而**不想**让它吸附，什么都不用做 —— `:has()` 只认领首页那个容器；
  4. ✅ 第 11 项（文章卡片三档密度）已落地：卡片是 `components/list/PostCard.tsx`，
     `HomePostCards` 已经换成它 —— 首页用的是**适中档**（与这一栏原来的样子一致），
     不是「紧凑档」（紧凑档只有标题 + 日期 + 时长，会把这一栏的摘要去掉，所以没那么选）。
     卡片上的小字跟着卡片走（`lib/list.ts` 的 `LIST_TEXT`），`lib/home.ts` 里的
     `posts.minutes` / `articlePending` 已删，别再加回来；
  5. ✅ 第 12 项（文章页）已落地：`lib/site.ts` 的 `ARTICLE_ROUTE.status` 已经是 `"ready"`，
     首页与列表页的文章卡片**一行没改**就一起变成了真链接（约定第 8 条的那套做法）。
     以后改了 slug 规则（正文 URL 变了）就把 `app/[lang]/posts/[...slug]/page.tsx` 的
     `generateStaticParams` 与 `lib/content.ts` 的 `PostMeta.href` 一起核一遍 —— 两者必须同源；
  6. 第 13 项的 `/[lang]/settings/` 页与首页第 7/8 栏用的是同一套组件与 API，别在那边另写一份。
- **第 13 项 —— 已完成**（这一条留档并转成「后续项要用到的东西」）：
  1. ✅ 七个页面的 `ROUTES[id].status` 都已改成 `"ready"`：顶栏、页脚、`RouteLink` 的入口
     一起生效，**没有改顶栏代码**；sitemap 里新增一张 `FACET_PAGES` 小表循环生成每语言一行
     （搜索页与设置页 `noindex`，故意不进）；`/offline/` 的缓存清单补上了两个语言的列表页。
  2. 以后新加一页的**固定动作**是三处：`lib/site.ts` 的 `ROUTES` 补一条（先 `"pending"`）、
     `app/sitemap.ts` 的 `pageRoutes()` 补一行、`lib/decor.ts` 的 `PATTERNS` / `SHEETS` 各加一行
     —— 装饰层的两张表是穷尽类型，漏了 TypeScript 直接报错；
  3. 「清单 + 跳转」型的页面**不要各写一套**：标签 / 分类是同一个 `FacetIndex`，
     搜索页直接渲染列表页的 `PostList`，设置页直接放 `SettingsCenter`，
     这几页的文案与纯函数都在 `lib/pages.ts`；
  4. 页头一律用列表页那一套类（`.list-head` 系）：新页面照抄结构即可，别再定义第四套页头；
  5. 「跳到某一类文章」一律 `lib/list.ts` 的 `facetHref()`（第 12 项的文章页也已经改成用它）。
- **第 12 项（文章页）—— 已完成**，这条留档并转成「后续项要用到的东西」：
  1. 正文页的**宽度只有一个来源**：`--reading-measure`（`app/globals.css` 的
     `.article-page { max-width: calc(var(--reading-measure) + 3rem) }`），别在任何地方写死 42rem；
     度量变了连页头与评论区一起走；
  2. 正文页的一切**文案与阈值**都在 `lib/article.ts`（目录缩进 `tocIndent` / `TOC_MAX_DEPTH`、
     `BACK_TO_TOP_AFTER`、`TOC_ACTIVE_OFFSET`、`GISCUS_*`、上下篇、中英文案）。
     页面里不写文案、不排「上/下」，也不手写图纸编号（`decorate(meta.href)`）；
  3. **`lib/article.ts` 只许 `import type`**：它被客户端组件（目录 / 进度 / 评论）值导入，
     一旦值导入 `lib/markdown.ts`，整条 unified 管线会被打进浏览器包（globals.css 的一节、
     文件头注释都写了这条）；
  4. 悬浮件的层序（这一轮补强之后）：**粘性标题 17 < 目录 18 < 进度滑块与回顶 19 < 吸顶顶栏 20**
     < 设置齿轮 40 < 遮罩 45 < 抽屉 50。除非有理由，新的悬浮件不要插到 20 以上；
     文章页右下角的图签让给了回顶按钮（`[data-route="article"] .blueprint-tag { display: none }`
     —— 判据是 `data-route` 不是图案名，背景改纯色那一次已经踩过一回）；
  5. giscus 的四个值在 `lib/site.ts` 的 `COMMENTS`（**留空 = 显示「编辑此处」**），
     配色映射与消息协议在 `lib/article.ts`；这一节只在读者滚到附近才联网，
     改懒加载距离就动那个 `rootMargin: 600px`；
  6. 第 13 项的标签 / 分类页要「跳到某一类文章」时，直接用文章页那套链接
     （`/zh/posts/?tag=…` / `?cat=…`，由 `lib/list.ts` 的 `listQueryString` 生成），别另实现一遍。
- **第 13 项（设置页）—— 已完成**：`/[lang]/settings/` 直接复用了 `components/SettingsCenter.tsx`
  （它不管容器），**没有另写一套**；`ROUTES.settings.status` 也已经是 `"ready"` 了
  （这一页同时是 `noindex`、不进 sitemap）。
- **第 8 项（装饰与动效）—— 已完成**，这两条留档并转成「后续项要用到的东西」：
  1. 新增一张图纸 = `lib/decor.ts` 的 `PATTERNS` / `SHEETS` 各加一行 + `app/globals.css` 加一条
     `[data-decor="…"]`；**不要**在组件里写 `if (pathname === …)`，图签名字也别在页面里手抄；
  2. 层序：蓝图层 `-1`（装饰整层 + 右下角图签都在里面）、吸顶顶栏 `20`、齿轮 `40`、
     遮罩 `45`、抽屉 `50`、**全站加载线 `60`**（换页反馈要盖住抽屉：换页时抽屉本来也会自动关）。
     新的**装饰**层别插到 20 以上，`60` 那一层只留给「整站在换页」这一个状态；
  3. 「纸质颗粒」没做（理由见第 4 节第 8 项末条）：要加就给 `.blueprint` 补第五层背景，
     只动 `app/globals.css`，别为它引图片资源。
- **第 6 项留下的已知缺口**：
  1. ✅ **abc（五线谱）的配色缺口已由第 12 项补上**：不去赌 abcjs 的选项名，改成画完之后把
     「近黑」的 `stroke` / `fill` 换成 `--c-ink`（`components/charts/abc.ts` 的 `recolorInk()`），
     不动 `fill="none"` 与作者指定的颜色。mermaid / echarts / graphviz / smiles 早就是读令牌的，
     于是五个渲染器现在都跟主题走 —— 但**五线谱这一处仍是纸面推演**，需要你本机看一眼（见第 8 节）；
  2. 三套令牌的对比度、蓝图层在三套外观下的观感，只在纸面上推演过，需要你本机看一眼（见第 8 节）。
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
- **第 13 项（其余页面）—— 已完成**：见上面那一条（新建页面要动的三处 + 复用规则）。
- **第 14 项（交付）—— 已完成（只差锁文件）**：README 与这份台账都在仓库里了，
  提交推送也做完了。**剩下的只有一件事**，而它必须由你在有 shell 的机器上做：

  1. `bun install`（或 `npm install`）生成锁文件，把它提交进仓库；
  2. 顺手（可选）把 `wrangler` 写进 `devDependencies` —— 现在 `npm run deploy` 是
     `npx --yes wrangler deploy`，每次现下载，而 Workers Builds 只认 `package.json` 里那个版本；
  3. 有锁文件之后，`.github/workflows/deploy.yml` 里的 `bun install` 可以加 `--frozen-lockfile`。

  **别只改 `package.json` 而不提交锁文件** —— 那会让两者不一致，比现在更糟（第 4 节「顺带发现的第二个坑」）。
  另外确认一下 Cloudflare 构建设置里的 Deploy command 是默认的 `npx wrangler deploy`（第 7 节）。
  PNG 图标（192 / 512）如果不打算做，README 第 6 节已经写明「只提供 SVG 图标」，不必再动。
- `content/README.md` 新增第 9 节（原文第 9 节「常见报错」顺延为第 10 节），
  `content/{zh,en}/posts/README.md` 各加了一行指路。

---

## 5. 约定与规则（重要）

1. **仓库不含任何文章。** `content/**/posts/` 只放 `README.md`（写作规范），加载器显式跳过该文件名；不写测试文章、不写示例文章。
2. **需要作者补内容的地方统一标「编辑此处」**，包括：站点标语/描述、首页各栏文案、
   演示段落、头像与 favicon 资源位、**顶栏图片位**（`lib/site.ts` 的 `HEADER_IMAGE`，
   留空时那一格是虚线空位 + 一行小字，填了图就换成图，尺寸不变）；**第 13 项之后「关于」与「友链」
   不再写「编辑此处」在页面里** ——
   它们的来源分别是「一篇 `about: true` 的文章」与 `lib/site.ts` 的 `LINKS`
   （**八个已填**；空的时候才显示说明）。
3. **UI 文案不算文章**，由 `lib/site.ts` 的 i18n 表统一维护（中英各一份，缺一边会出现 `undefined`）。
4. 零文章、零配置时站点必须仍能构建与浏览，所有页面要有空状态。
   注意静态导出的一条硬规则：**动态路由至少要生成一条路径**（`generateStaticParams()`
   返回空数组会直接让构建失败）。文章页因此有一条**保留路径** `/<lang>/posts/__empty__/`
   （`lib/article.ts` 的 `EMPTY_POST_SLUG`），它渲染「还没有文章」那一页，
   `noindex`、不进 sitemap，作者写下第一篇后自动消失 —— **别把它当成死链删掉**。
5. 动效一律尊重 `prefers-reduced-motion`，且背景/装饰层不得影响正文可读性（`aria-hidden`、`pointer-events: none`）。
   背景装饰层（`z-index: -1` 那一层）**只许是纯色与大色块**：站长明确否掉了图案 / 网格 / 线
   （「不要任何格子背景，背景干净点」，见「环境色大色块 + 换页渐入」一节）——
   要在背景上加线条之前先问一声。另：换页渐入**只许改 `opacity`**，
   `.site-main` 上不许出现 `transform`（会变成 fixed 后代的包含块，见同一节第 2 条）。
6. **开发态自检不是内容**（**第 12 项已按这条删掉它**，留档）：`components/dev/PipelineCheck.tsx`
   只为在文章页之前验证渲染器而存在，生产构建里不渲染、不进产物；文章页落地时连同
   `app/[lang]/page.tsx` 里那三行与 `.pipeline-check` 的 CSS 一起删掉了。
   现在要验证渲染管线，就直接写一篇真文章看 `/zh/posts/<slug>/`。
7. **外观只有一个落点**（第 6 项起）：颜色只在 `app/globals.css` 的令牌里定义，页面里用语义色
   工具类（`text-ink-muted` / `bg-surface` / `border-rule` / `text-accent`）；
   不写 `dark:` 变体（三套外观，两态表达不了）、不写死色值、不动 `<html>` 上的 `data-theme`
   （要切换外观就调 `lib/theme.ts` 的 `setThemeChoice()`）。
   唯一的例外是设置中心那几颗**外观预览色块**（`.theme-chip`）：它预览的是另外两套外观，
   只能写死，改令牌时要同步那一处（见第 4 节第 7 项）。
8. **链接的可用性只有一个事实来源**（第 7 项起）：站内链接一律走 `components/RouteLink.tsx`，
   而它读 `lib/site.ts` 的 `ROUTES[id].status`。页面还没做就写 `"pending"`（渲染成不可点、悬停说明
   由第几项落地），做完改成 `"ready"` —— 不在页面里写死 href、也不留会 404 的死链。
   **第 13 项起 `ROUTES` 里已经没有 `"pending"` 了**（七个页面全部落地）；机制留着：
   以后新加一页（比如专题页）照样先写 `"pending"`，做完再改一个字。
   阅读偏好同理：只写 `--reading-*` 令牌（`lib/prefs.ts`），别在组件里直接改字体大小。
9. **列表与卡片各只有一份实现**（第 10/11 项起）：文章卡片一律用 `components/list/PostCard.tsx` 的三档
   （`data-density` 交给 CSS），新页面不要另写一份卡片；「只显示某一类文章」一律用列表页的查询串
   （`/zh/posts/?tag=…`、`?cat=…`、`?year=…`、`?sort=…`、`?density=…`），编解码只在 `lib/list.ts`
   —— 要生成这样的地址就调 `facetHref()`（第 13 项起它也在 `lib/list.ts` 里）。
   偏好与筛选分家：**筛选进地址栏**（可分享、可收藏），**偏好进 localStorage**（`tob:list-density` 等）。
10. **每一页的版面、文案与阈值都在自己的 `lib/*.ts` 里**（第 9 项起的做法：首页 `lib/home.ts`、
    列表页 `lib/list.ts`、文章页 `lib/article.ts`）：页面组件只负责把数据渲染出来，
    不在页面里排顺序、写文案、手写图纸编号，也不实现第二份阈值（`tocIndent` / `BACK_TO_TOP_AFTER` 之类）。
    被客户端组件引入的那几个 `lib/*.ts`（`list.ts` / `article.ts`）对服务端模块一律只用 `import type`，
    否则会把 `node:fs`、`unified` 之类的整条依赖拖进浏览器包。
11. **顶栏只放三段**（顶栏改版起）：品牌 / 友链 / 图片位。站内入口一律挂**页脚那一排导航**
    （`lib/site.ts` 的 `NAV`，走 `RouteLink`）—— 别往顶栏加页面入口，参考稿的顶栏就那么宽，
    加回去会把品牌区挤变形。顶栏高度只有一个事实来源：令牌 `--header-h`
    （两档窄屏值写在令牌那一段，**不能**搬进 `@layer`）；凡是「停在顶栏下沿」的东西
    （首页吸附、文章页标题锚点）一律读 `--home-head-room`，**不要手写 rem**。
    顶栏那两个动效（三段淡入、光标闪烁）只由 `components/HeaderIntro.tsx` 驱动，
    并保持「默认可见 → JS 就绪后才淡入」的顺序 —— 反过来会让禁用 JS 的读者看不到顶栏。

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
> 另注：`npm run deploy` 用的 `wrangler` 目前**没有写进 devDependencies**（`npx --yes` 会临时下载），
> 本机部署前先 `npx wrangler --version` 或全局装一个即可。把它钉进依赖是第 14 项留下的
> 那件「需要 shell 的机器」的小事（要同锁文件一起提交，见第 4 节第 14 项）。

`npm run dev` 后打开 `/zh/`：第 7 项之后**左下角有一颗齿轮**，点开就是设置中心 ——
外观（四选一）、正文宽度 / 字号 / 行距、语言切换、恢复默认都在里面，这是读者的正式路径。
下面这个 `?theme=` 调试参数仍然有效（它不写 localStorage、刷新即失效），用来快速对照三套令牌：

```bash
# 纸（默认）/ 亮 / 暗
http://localhost:3000/zh/?theme=paper
http://localhost:3000/zh/?theme=light
http://localhost:3000/zh/?theme=dark
```

外观之外，第 8 项的「一张图纸」原本也能这样对照（对照表在 `lib/decor.ts`）：
`/zh/` 整幅图纸 · `/zh/posts/` 分栏线（图签 `TOB-ZH-02`）· 文章页（`/zh/posts/<slug>/`，第 12 项）
左边缘刻度尺（图签那两行小字在这一页让给了回顶按钮）·
`/zh/tags/` 密格 · `/zh/categories/` 剖面线 · `/zh/archives/` 分栏线 · `/zh/search/` 点阵 ·
`/zh/about/` 密格 · `/zh/links/` 剖面线 · `/zh/settings/` 分栏线 · `/offline/` 空纸。
⚠️ **背景现在是纯色**（`lib/decor.ts` 的 `DECOR_PATTERNS = false`），所以这一串图案**默认看不到**、
每页都是空纸；把那个开关改成 `true` 就全部回来（十一张图纸编号 01~11 连续）。
无论开关如何，**右下角图签的编号与名字照旧随页面变**：敲一个不存在的路径（例如 `/zh/nope/`）
会落到 `out/404.html`，那一页按 `unknown` 画、图签印 `TOB-ZH-00` —— 这是预期行为。

**开发态渲染自检已经删掉了**（第 12 项落地时连同 `components/dev/PipelineCheck.tsx`、
首页里那三行、以及 `.pipeline-check` 的 CSS 一起删）。它原来的任务是把第 3 项的 GFM / 公式 /
代码高亮 / 五类图表 / 参考文献角标 / 目录抽取与第 4 项的中文排版（含 `typography: false` 的对照组）
跑一遍 —— 现在这件事由**真的文章页**承担：写一篇放进 `content/zh/posts/`，打开
`/zh/posts/<slug>/` 就能看到同一套渲染结果，而且顺带验证了目录、进度、上下篇与评论。

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
- CI：`.github/workflows/deploy.yml`，push 到 `main` 触发；`fetch-depth: 0` 留着（**兜底**，
  不是唯一来源）。更新日志在 `next build` 期间先试 GitHub API、再读 `git log`：
  **Cloudflare 自己那套云构建是浅克隆**（日志里就一句 `Cloning repository...`），
  只靠 `git log` 的话线上那份记录会缩成一条，所以参考项目当年也是优先走 API。
  两个来源都失败时构建不会失败，但这一栏（与那份 `changelog.json`）会是空的。
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
- **2026-09-30 的第七次云构建**（改用 Workers 静态资源、`package.json` 尾逗号修掉之后的第一次）：
  `bun install`（303 个包，6.8s）→ Turbopack 编译 **42s 通过** → **类型检查失败**，
  两处 `TS7006`（`components/list/PostList.tsx` 的 193 / 198 行，`search` 的形参隐式 any，
  第 10 项写的代码）；部署这一步没跑到。原因与修法见第 4 节「构建失败 —— 类型检查两处 TS7006」。
  ⚠️ 这两处**已改但未在本机验证**（本环境无 shell），下一次构建日志见分晓。
  另一件事仍未验证：`wrangler.toml` 的 `[assets]` 写法（Workers 静态资源）到底能不能把 `out/` 传上去
  —— 这几轮构建都停在部署之前，从没跑到 `npx wrangler deploy`。
- **2026-09-30 的第八次云构建**：`bun install`（302 个包，5.67s）→ Turbopack 编译 **29.2s 通过**
  → **类型检查通过**（5.4s，第 12 项落地以来第一次过这一关）→ 在
  `Collecting page data using 1 worker` 阶段失败：
  `Page "/[lang]/posts/[...slug]" returned an empty array from "generateStaticParams()"`。
  原因是**零文章 + 动态路由 + `output: export`**三者相撞（仓库按约定不含任何文章，
  而静态导出要求动态路由至少生成一条路径）。修法与理由见第 4 节
  「构建失败 —— 零文章时 `generateStaticParams()` 返回空数组」；
  第 12 项小节里那句写错的说明已一并改掉。⚠️ 这一处改完仍未在本机验证。
- **改用 Workers 静态资源（本次提交）**：`wrangler.toml` / `package.json` / workflow 三处已按第 7 节改完，
  云构建的 Deploy command 只要填回默认的 `npx wrangler deploy` 即可，**不涉及任何 token 权限改动**。
  ⚠️ 这次改动**没有在本机跑过 `wrangler deploy`**（本环境无 shell），
  首次真实上传的结果以你下一次构建日志为准；若报错请把日志贴回来。
- **第 14 项（交付）**：新增 `README.md`、本次提交同时更新本台账。两者都是**文档**，
  不碰 `app/` / `lib/` / 配置，所以**不会**影响构建与产物（仍以你本地 `npm run build` 为准）。
  README 里的事实（脚本名、wrangler 配置、workflow 的 action 与命令、`lib/site.ts` 与 `lib/home.ts`
  的字段名、缩略图目录名）逐条对着源码核过，不是凭印象写的。
  ⚠️ 唯一没做完的是**锁文件**：本环境没有 shell，生成不了 `bun.lock` / `package-lock.json`
  （手写一份等于编造依赖解析结果），留给你在本机 `bun install` 后提交，细节见第 4 节第 14 项。

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
- **第 12 项（文章页）也没在本机跑过浏览器**，而这一项牵扯的第三方（giscus）与滚动逻辑最多，
  请按顺序看这几件事（前面 1、2 条最要紧）：
  1. **构建能不能过**（最要紧）。这一项新增了一个 catch-all 路由与 `generateStaticParams`，
     `npm run typecheck && npm run build` 之后 `ls out/zh/posts` —— 应当每个 slug 一个目录
     （`out/zh/posts/<slug>/index.html`）。若构建在 `Collecting page data` 阶段报错，
     把日志发我（多半是 `dynamicParams` 与 catch-all 的组合写法问题）。
  2. **没有 JS 也能读全文**：`curl /zh/posts/<slug>/` 的 HTML 里应当有完整正文，
     标题带 `id`（第 3 项 `rehype-slug` 给的）。**禁用 JS 时**页头 / 正文 / 参考列表 / 上下篇
     都在，只有悬浮目录（宽屏才有）、进度条、回顶、评论不见 —— 这是设计如此。
  3. **悬浮目录（≥78rem 的宽窗口）**：滚到某一节时对应那条应当高亮（左边一条竖线 +
     淡淡的底色），小节之间滚动时**不应闪烁**（带里空着时保留上一次高亮）；点一条应当
     平滑滚过去、标题停在吸顶顶栏下面（`scroll-margin-top: var(--home-head-room)`）——
     如果标题被顶栏盖住，说明顶栏高度与那个令牌不一致，告诉我；
     窗口收窄到 78rem 以下，目录整块消失（那点宽度留给正文），文章末尾的上下篇仍在。
  4. **阅读进度与回顶**：右侧 2px 细线随滚动变长，宽屏（≥60rem）中部还有一个百分比小牌子；
     滚过 600px 后右下角出现圆形回顶按钮（此前它不显示、也 Tab 不到）；点它应当平滑回到顶部；
     系统开了「减少动效」时应当是瞬间跳转。
     注意它算的是**整页**比例（到底 = 100%），不是「正文读了百分之多少」—— 这是刻意的。
  5. **上下篇**：方向对不对（左 = 上一篇 = 更早，右 = 下一篇 = 更新，都带日期）；
     第一篇只应出现「下一篇」、最后一篇只应出现「上一篇」，另一格**不留空框**。
  6. **标签 / 分类片**：点一下应当到 `/zh/posts/?tag=…`（或 `?cat=…`）并在列表页里**已经选中**
     那一项 —— 这条同时验证了文章页与列表页的查询串对得上（编解码都在 `lib/list.ts`）。
  7. **giscus 现在不会加载**（`COMMENTS` 四个值是空的）：评论区应当显示「编辑此处」那段说明，
     Network 里**不应出现任何 giscus.app 的请求**。填好那四个值重新构建后再看：
     滚到评论区附近才开始加载（Network 里那一刻才出现 `client.js` 与 iframe）；
     切换外观（设置中心）时评论区配色跟着变，且**不重新加载**（评论列表不闪）。
  8. **五线谱（abcjs）的配色**：文章里放一张 ` ```abc ` 图，切到暗色 —— 谱线、符头、符干
     应当变成浅色的 `--c-ink`，连音线（`fill="none"`）不该被填成实心。
     如果暗色下仍然看不见，把那张图截图发我（我按截图改成别的手段）；
     如果亮色下一眼看着和以前不一样，也告诉我（那说明 `recolorInk()` 碰到了不该碰的属性）。
  9. **frontmatter 的 `typography`**：给某一篇写 `typography = false`（TOML）或
     `typography: false`（YAML），那一篇的中英之间就**不该再补空格**；删掉这行恢复。
     `{ spacing = false }` 这类写法只关一条 —— 规范在 `content/README.md` 第 9 节。
  10. **metadata 与 RSS 发现表**：查看源代码，`<link rel="alternate" type="application/rss+xml">`
     应当**两条都在**（zh 与 en）—— 文章页自己写了 `alternates`，把根布局那份覆盖掉过一次；
     同时 `<link rel="canonical">` 应当是文章自己的地址。
  11. **打印预览**（Ctrl+P）：悬浮目录、进度线、百分比、回顶、评论区都不应出现在纸上，
     正文转 11pt、宽度不再受限，文章末尾的上下篇留着。
- **第 12 项**改掉两处旧文案（都不是功能）：`lib/list.ts` 的 `card.fullNote` 从
  「正文在第 12 项落地后可读」改成「点标题进正文页读全文」；首页第 6 栏的「这一项已经做到的」
  最后一条从「第 12 项落地」改成「（文章页）」。仓库里如果再看到「第 12 项」被当成**待办**，
  那就是漏改的注释，告诉我一声。
- **第 13 项（其余页面）也没在本机跑过浏览器**，请按顺序看（前两条最要紧）：
  1. **产物路径**：`npm run build` 之后 `ls out/zh` 应当看到 `tags`、`categories`、`archives`、
     `search`、`about`、`links`、`settings` 七个目录（每个里有 `index.html`）；
     同时 `out/sitemap.xml` 里应当出现 `/zh/tags/`、`/zh/archives/`、`/zh/about/`、`/zh/links/`
     两类条目（**不该**出现 `/zh/search/` 与 `/zh/settings/` —— 那两页是 `noindex`）。
  2. **顶栏七项全部可点**（首页 / 文章 / 标签 / 分类 / 归档 / 搜索 / 友链）—— 第 13 项把
     `ROUTES` 里的 `"pending"` 清零了；页脚的 RSS 仍然可点。
  3. **标签页 / 分类页**：字号应当按篇数分四档（最多的那个最大），点一个标签应当跳到
     `/zh/posts/?tag=…` 且**列表页里那一项已经选中**；长标签（中文长句）应当整块换行、不溢出；
     宽屏两栏之外的窄屏应当自然堆叠。
  4. **归档页**：年月分组的顺序对不对（新的在前）；年那一行右边的「看 2024 年的全部 →」
     应当跳到列表页并筛好那一年；**月份那一行点不动是设计如此**（它是分组不是筛选）。
     置顶 / AI 的小字应当与卡片上的一模一样。
  5. **搜索页**：打开 `/zh/search/` 光标应当在搜索框里（手机上会弹键盘 —— 如果你觉得烦，
     说一声，把 `autoFocusSearch` 去掉即可）；第一次输入时 Network 里才出现
     `/search-index.json` 与 fuse.js；搜出来的结果与列表页里的筛选可以叠加。
  6. **关于页**：还没有 `about: true` 的文章时应当显示「编辑此处」那段说明；
     加一篇 about 文章后应当显示它的正文（公式 / 图表 / 参考文献都走同一套管线）。
  7. **友链页**：八个卡片应当显示各位的头像（外链，要联网）、名字、一句话介绍与印出来的地址，
     外链在新标签页打开；把 `lib/site.ts` 的 `LINKS` 清空再构建，应当回到空状态。
     逐个点开头像地址，确认对方没有换图 / 改域名。
  8. **设置页**（`/zh/settings/`）：里面的选项应当与左下角抽屉**完全同步** ——
     在这一页改外观，顶栏按钮与首页第 7/8 栏应当立刻跟着变（反之亦然）。
  9. **离线页**（`npm run preview` 后断网）：清单里应当看到两个语言的首页与列表页；
     之前打开过的文章地址直接敲也应当能打开（走的是同一个 Service Worker 缓存）。
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
- ⚠️ 上面第 2、9 条描述的是**顶栏改版之前**的形态（顶栏三段是「品牌 / 导航 / 图签」，
  导航项还没落地时压暗不可点）—— 改版后顶栏是「品牌 / 友链 / 图片位」，导航搬到了页脚，
  所以那两条按下面这一组看；其余各条（吸顶、齿轮、抽屉、阅读偏好、外观按钮、语言切换、打印）不受影响。
- **顶栏改版（对齐 wunai-blog 参考稿）也没在本机跑过浏览器**，请按顺序看：
  1. **几种宽度都要看一眼**：≥1024px、≈768px、≈480px、直到 320px。品牌区那行小字是
     `white-space: nowrap`，最要紧的是它**不会**把友链与图片位顶出屏幕；真被顶出去了告诉我
     （修法是先把 `.tagline` / `.all-posts` 的字号再收一档，或让那一行允许换行）。
  2. **顶栏高度是不是真的固定**：DevTools 里量 `.navbar` 的 `height`，宽屏应当是 88px（5.5rem）、
     ≤768px 76px（4.75rem）、≤480px 72px（4.5rem），与令牌 `--header-h` 三档一致；
     换页与滚动时不该变。
  3. **图片位**：现在是虚线空位 + 「图片位 · 编辑此处」。把一张横图放进 `public/`、
     把文件名填进 `lib/site.ts` 的 `HEADER_IMAGE.src` 重新构建 —— 那一格应当被铺满
     （`object-fit: cover`，居中裁切），**顶栏高度不变**；`alt` 留空时读屏不该读到它。
  4. **入场动效**：硬刷新时三段应当依次淡入（每段差 90ms）；系统开「减少动效」时应当直接出现。
     **把 JS 关掉再刷新，顶栏必须一直都在** —— 这就是 `HeaderIntro` 里那个顺序的意义，
     写反了顶栏会永久不可见。若你在慢设备上看到「先整块出现、再淡入」的一瞬，那是渐进增强的
     代价被看见了，说一声，我改成首帧脚本注入（代价是多一小段内联 JS）。
  5. **光标**：站名后那根竖线在允许动效时闪；切到别的标签页停留几秒再回来，它应当还在闪
     （`.is-paused` 只在后台挂着）。
  6. **页脚第一块**：七个入口 + 语言切换**全部可点**（`ROUTES` 里已经没有 pending），
     下面一行是构建期统计；零文章时是「还没有文章 —— 第一篇由你亲笔写」而不是一串 0。
     窄屏时这一排会不会挤成一团，也看一眼。
  7. **搬过位置之后仍然正常的**：语言切换（`/zh/` ↔ `/en/` 落在同一页）、外观按钮四态循环、
     顶栏吸顶与蓝图层的叠色。这三样代码没改，但顶栏结构变了，值得再确认一次。
  8. **首页吸附与文章页标题锚点**：两者读的 `--home-head-room` 现在由 `--header-h` 推出来。
     窄屏（≤48rem）滚首页、点侧边指示器、点文章目录，看栏头 / 标题是不是正好停在顶栏下沿 ——
     被盖住一截或空一大块都说明令牌与实际高度不一致，把量到的实际高度告诉我。
  9. **打印预览**（Ctrl+P）：顶栏照印（不再吸顶），**图片位不印**（那一格虚线空位在纸上是噪音，
     已在 `@media print` 里 `display: none`）；如果你希望补了图之后把它印上，说一声，删掉那一条即可。
  10. **`npm run typecheck`**：这次改动新增一个客户端组件、给 `RouteLink` 加了可选 `title` 入参、
     `SiteFooter` 多读了 `getContentStats` / `NAV` / `ROUTES` —— 先跑一遍类型检查最省事。
- **背景改成纯色（图案层关掉）也没在本机看过**，请按这几条看（前两条最要紧）：
  1. **背景是不是一整块纯色**：随便逛几页（首页 / 列表 / 文章 / 标签 / 离线页），背景应当只有
     `<html>` 那一层 `--c-canvas` —— 没有网格、没有虚线图框、边缘没有渐隐；滚动时它不动、不闪。
     三套外观各看一遍（纸 / 亮 / 暗），各是一块纯色。
  2. **右下角图签还在**（这是刻意的，它不是背景）：桌面宽屏应看到 `TOB-ZH-01` + 「首页」两行小字，
     窄于 48rem 不印；**文章页那一页不印**（右下角让给回顶按钮，判据已改成 `data-route="article"`）。
     若连图签也不想要，说一声，一行 CSS 就能去掉。
  3. **查看源代码**：那个 div 上应当是 `data-decor="plain" data-route="home"`（首页）——
     `data-route` 仍然随页面变（`posts` / `article` / `tags`…），`data-decor` 全是 `plain`。
     想恢复图案就把 `lib/decor.ts` 的 `DECOR_PATTERNS` 改成 `true`（图案与编号都还在）。
- **首页改版（一栏一屏）也没在本机看过**，请按这几条看：
  1. **一次滑动正好换一栏**：不会停在两栏之间、也不会一口气跨过好几栏；
     点右侧那个指示器（宽屏才有）或直接改地址栏的 `#home-…` 锚点，
     栏头应当停在顶栏下面那条线上（`scroll-padding-top` 管这件事）。
     连滑两下、快速甩一下也应当落在某一栏的栏头上，不会歪在半屏。
  2. **栏目里没有框、没有底色块**：整页同一个底色，只有栏头那条虚线在做分隔 ——
     这就是「栏目卡片效果去掉」的样子；如果哪里还有一块面板底色，把截图发我（那就是漏改了一处）。
     （栏**内部**的虚线小格、对比框、文章卡片是内容的一部分，不是栏目外壳，这次没动。）
  3. **每栏占一屏**：`100svh − 顶栏让位`，内容短就在这一屏里垂直居中、长就多出一屏吗 ——
     不，长的话**在栏内滚**（栏本身仍是一屏）。第一栏从顶栏下面开始、底部落在视口下沿。
     手机上（≤60rem）也一样 —— 改版前手机上是 `min-height: auto`。
  4. **手机上第 2 栏（文章）与第 6 栏（阅读改善）**：内容比一屏多，应当在栏内滚 ——
     滚动条**故意不画**（看版面上不该多一条竖线）；滚到栏底继续滑会换到下一栏。
     如果「滑不动」或者「栏内容被裁掉一截滚不出来」，把当时那一屏截图发我。
  5. **滚到最底部能读到整个页脚**（七个入口 / 联系方式 / 版权行）—— 页脚也补了一个吸附点；
     如果滑到页脚又被弹回最后一栏，说明这个浏览器的吸附实现不一样，告诉我。
  6. **系统开「减少动效」时**：不吸附、不做平滑滚动，同时也把一屏定高放开 ——
     一路自由滚，是普通的长文档（刻意如此）。
  7. **打印预览**：八栏应当是一条连续文档（`.home-block { height: auto; min-height: 0; overflow: visible }`），
     不再一屏一栏、也不该只印出每栏的第一屏。
- **第 8 项（装饰与动效）同样没在本机跑过浏览器**，图案的几何与层叠只能靠推演，请按顺序看：
  1. **十一张图纸现在都能真的看到 —— 但要先把开关打开**（`lib/decor.ts` 的 `DECOR_PATTERNS`）：
     默认是纯色背景，所以这一条现在看不到东西；打开之后编号 01~11 连续（对照表在第 6 节
     `npm run dev` 那一段）。地址栏硬敲一个不存在的路径（`/zh/nope/`）仍会落到 `out/404.html`，
     那一页按 `unknown` 画、图签印 `TOB-ZH-00` —— **这是预期，不是 bug**。
  2. **`data-decor` 是否真的落在首屏 HTML 上**：`curl` 或查看源代码，应能在那个 div 上看到
     `data-decor="plain" data-route="home"`（首页）；把开关打开后应当是 `data-decor="sheet"`。
     如果水合之后才出现属性，说明构建期那次 `usePathname()` 给了别的值 —— 把那一段 HTML 贴给我。
  3. **右下角图签**：见上面那组第 2 条（编号与名字跟着页面变，它是装饰、在 `z-index: -1` 那一层，
     与页脚重叠时被盖住是预期的）。
  4. **印刷与动效**：`prefers-reduced-motion: reduce` 下不应有任何淡入
     （顶栏三段的淡入与站名后的光标一起停）；
     打印预览里蓝图层整层不出现（第 6 项的 `@media print` 已关掉它）——
     背景改纯色之后这一条更没什么可印的了。
  5. **手机上滚动是否掉帧**：纯色之后这一项应该彻底没问题（那一层已经不画任何东西）；
     真把图案开关打开再遇到发涩，先把粗格那一层（`--bp-grid-major`）从 `.blueprint` 的
     `background-image` 里去掉 —— 那层最费。
- **2026-10-01 线上实测（「新文章打不开」这一轮，唯一一次从线上取证）**：站长报「新文章打不开」
  之后，我直接抓了线上的 `/zh/posts/`（不是本地推演）：卡片是
  `<a href="/zh/posts/notes/笔记/">笔记1</a>`，服务端 props 里 `"slug":"notes/笔记"` ——
  于是根因确定为**非 ASCII slug**（浏览器百分号编码与 Cloudflare 静态资源的解码对不上，必然 404），
  `/zh/posts/note-1/` 实测 404 也印证了这一点；同一份 HTML 里工具栏是**展开**的一整套控件、
  文章是**平铺**的一列卡片 —— 说明「卡组分块 + 工具栏折叠」那次改动当时还没提交、没上过线。
  两条修法与验收见「卡组页 + 新文章 404 的根因」一节。
  **教训**：以后报「打不开 / 显示不对」这类问题，先抓线上 HTML 与地址，再动代码 ——
  这一次本地代码看起来完全正常（工作区早就补了 `slug`），问题在「没提交」与「产物规则」。 

- **文章页悬浮件补强（目录开关 / 可拖进度 / 回顶进度环 / 粘性标题）也没在本机看过**，
  细节与理由见「**文章页悬浮件补强**」一节；这里只留最值得先看的四条：
  1. **目录的默认状态**：宽窗口（≥78rem）打开文章页，目录应当**照旧展开**；把 JS 关掉刷新 ——
     宽屏下它仍然在（这是刻意保住的）；手机上应当只剩左下角一个小挂件（在设置齿轮上面），
     点开是从左下角弹出的浮层，点其中一条就收起；
  2. **滑块的手感**（最要紧的一条）：桌面鼠标移到右边缘那条线附近 → 出现轨道与小圆点；
     按住拖动应当跟手、不抖、拖出右边框也继续跟；触屏上按一下**不该**跳（要先移动 6px）；
     Tab 到它应当有焦点框，↑/↓、PageUp/PageDown、Home/End 都能走 ——
     觉得「太灵敏 / 太钝」就调 `ArticleProgress` 顶上的 `DRAG_THRESHOLD` 与
     `lib/article.ts` 的 `PROGRESS_KEY_STEP`；
  3. **回顶进度环**：环应当与右边缘那条线同步（读到页面底闭合成整圈）；按钮没出现时它整颗都不可见、
     也 Tab 不到（这一条没改）；
  4. **粘性标题**：滚过大标题 → 顶栏下面挂一条紧凑标题（左边一个「正文」小字）；
     滚回顶部消失；滚到评论区也消失（它贴在 `<article>` 里）；窄窗口下长标题应当出省略号。
     另外**打印预览**里这四件都不该出现（`.article-sticky` 与另外三件一起列在 `@media print` 的隐藏名单里）。
- **环境色大色块 + 换页渐入（第 8 项扩展）也没在本机跑过浏览器**，请按这几条看
  （细节与理由见「**环境色大色块 + 换页渐入**」一节）：
  1. **先看「干净」这一条**（站长的要求）：任何一页的背景都**不该出现格子 / 网格 / 点阵 / 线条** ——
     只有几块**软边的大色块**。如果还看到格子，那是 `.blueprint` 那一层被打开了
     （`lib/decor.ts` 的 `DECOR_PATTERNS` 默认是 `false`，改回去才会画网格）；把截图发我。
  2. **换页时图形是不是「变过去」而不是「换过去」**：首页 → 列表页 → 文章页 →
     标签 / 分类 / 归档，大色块应当**挪位置 / 改大小 / 换颜色**（1100ms），
     而不是整层闪一下重铺。手机上若发涩，先告诉我，我把 `--ambient-alpha` 调低或把 `will-change` 去掉。
  3. **正文读起来不受影响**（最要紧的一条）：打开一篇文章读几段 —— 底色上的那点色
     不应当影响字的对比度；**文章页应当是全站最安静的一页**（整层只有六成浓度）。
     觉得还是花，就只改一个数：三套外观的 `--ambient-alpha`（纸 0.18 / 亮 0.14 / 暗 0.22）。
  4. **换页渐入**：点站内链接换页 → 新页正文应当**从略暗淡上来**（420ms），
     顶栏与页脚**不动**（只有正文那一片在淡）；**首屏刷新不该有这次淡入**。
     换页过程中右侧那条可拖的进度轨、左下角目录挂件**不该位移**（渐入只改 opacity 就是为了这个）。
  5. **三套外观各看一遍**：纸（暖褐 / 苔绿系）、亮（青蓝系）、暗（亮一档的色块）；
     换外观时色块的颜色应当**平滑过去**（0.55s），不是硬切。
  6. **系统开「减少动效」**：色块直接换（不做过渡）、换页也不再有渐入。
  7. **打印预览**：不该出现任何色块（`.ambient` 在 `@media print` 里 `display: none`）。
  8. **`npm run typecheck`**：这次新增两个客户端组件、改了 `lib/decor.ts` 的类型与 `Decor` 形状
     （`decorate()` 多返回一个 `ambient` 字段）—— 先跑一遍类型检查最省事。

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
| 2026-09-30 | 第七次云构建：`bun install` 与 Turbopack 编译（42s）通过，**类型检查报两处 `TS7006`** —— `components/list/PostList.tsx` 两条 `return` 里的 `search: (query) => …` 形参隐式 any（第 10 项的代码）。根因是「联合返回类型 `Promise<Engine \| "error">` + 对象字面量里的函数属性」拿不到上下文类型；修法是两处形参显式标 `query: string`（最小改动、语义不变，未用 `as` 断言）。台账新增该小节，第 8 节补上这次构建的结论，并注明修法与 `[assets]` 部署路径都仍未在本机验证 |
| 2026-09-30 | 第八次云构建：编译（29.2s）与**类型检查（5.4s）双双通过**（`TS7006` 修复确认生效），失败点退到 `Collecting page data` —— `Page "/[lang]/posts/[...slug]" returned an empty array from "generateStaticParams()"`：零文章 + 动态路由 + `output: export` 三者相撞（与约定第 1 条「仓库不含任何文章」直接冲突）。修法是**保一条保留路径**：`lib/article.ts` 新增 `EMPTY_POST_SLUG = "__empty__"`（含「为什么需要它」的注释），`generateStaticParams()` 在空数组时返回这一条，页面为它渲染 `EmptyArticlePage`（文案取 `ARTICLE_TEXT` 新增的 `emptyTitle` / `emptyLead`，空状态那两句复用 `LIST_TEXT`，不带目录 / 进度 / 回顶 / 评论），metadata 里加 `noindex`、不进 sitemap、作者写下第一篇后自动消失。台账三处同步：第 12 项那句「返回空数组即没有文章页」是错的，已改正并指向第 4 节新小节；第 4 节新增「构建失败 —— 零文章时 `generateStaticParams()` 返回空数组」；第 8 节补上这次构建的结论 |
| 本次提交 | **第 7 项框架 UI 完成**：顶栏（品牌 / 导航 / 图签三段，对齐 wunai-blog）、页脚（联系方式 + 版权 + 左下角齿轮）、设置中心抽屉（外观 / 阅读偏好 / 语言 / 恢复默认）。新增 `lib/icons.ts`（本地打包的 24 个图标）、`lib/prefs.ts`（宽度/字号/行距三档 + 首帧脚本 + 写 `--reading-*`）；`lib/site.ts` 扩全为「路由落地状态表 ROUTES + 顶栏导航 + 联系方式 + i18n 文案表」；新组件 `RouteLink`（按 `ROUTES.status` 决定可点/不可点）、`SiteHeader`、`SiteFooter`、`ThemeSwitcher`、`LangSwitcher`、`SettingsDock`、`SettingsCenter`、`PrefsInit`。框架挂到 `app/[lang]/layout.tsx`（第 9~13 项自动带上）；`globals.css` 新增「6b. 框架 UI」一节与 `--frame-width` 令牌，`.page` 内边距收紧到 `2.5rem 1.5rem 4rem`；`THEME_LABELS.hint` 由中文一句改成 `{ zh, en }`；约定新增第 8 条（链接可用性以 `ROUTES.status` 为唯一事实来源） |
| 本次提交 | **第 8 项装饰与动效完成**：新增 `lib/decor.ts`（路径 → 图纸的唯一事实来源：`section` / `pattern` / 两位编号 / 图签语言，纯函数 + 两张穷尽表，零依赖）；`components/BlueprintBackground.tsx` 从空 div 变成 `"use client"` 组件，用 `usePathname()` 挂 `data-decor` / `data-route`，并在换页时让纸面重铺一次（0.32s、首帧不播、尊重 `prefers-reduced-motion`）；`app/globals.css` 新增「5b. 图案随路由变」一节 —— 七套图案（sheet / columns / measure / grid / hatch / dots / plain，全是渐变，无图片、无滤镜、不动布局）+ 右下角图签（`TOB-ZH-01` 之类，窄屏不印）+ `[data-route="article"]` 的边缘淡出微调；`lib/site.ts` 新增 `isRouteId()` 与 `SITE.i18n.decor` 三条文案（图签名字复用导航文案，不重复写十二个）。这一项**未改任何颜色与令牌、未动层序**；「纸质颗粒」未做，理由见第 4 节第 8 项 |
| 本次提交 | **第 10 项列表页 + 第 11 项文章卡片（三档密度）完成**：新增 `app/[lang]/posts/page.tsx`（构建期取文章 / 标签 / 分类 / 年份，零文章出空状态且不出工具栏）、`components/list/PostList.tsx`（客户端：搜索 / 筛选 / 排序 / 密度 / 语言 / 地址栏状态）、`components/list/PostCard.tsx`（三档密度共用卡片）、`lib/list.ts`（筛选状态与默认值、三档密度与排序的选项表、纯函数、查询串读写、密度本机记忆、中英文案 —— 对 `content.ts` / `search-index.ts` 只 `import type`，故客户端可安全引入）；搜索在**第一次输入时**才读 `/search-index.json` 并动态 `import("fuse.js")`，索引读不到 / 版本不匹配时自动退回本页字段并在页面上写明；`ROUTES.posts` 改 `"ready"`（顶栏「文章」可以点了），sitemap 补两行列表页；`lib/site.ts` 新增 `feedAlternatesTypes()`（页面自写 `alternates` 会覆盖根布局那份 RSS 发现表，第 5 项记下的坑先在这里堵上，`app/layout.tsx` 同步改用）；首页第 2 栏换成共用的 `PostCard`（适中档），`lib/home.ts` 删掉 `posts.minutes` / `articlePending`；`lib/icons.ts` 补 11 个图标（筛选 / 时间 / 排序 / 三档密度 / AI / 清除搜索）；`app/globals.css` 新增「6d. 列表页与文章卡片」一节并把 `.home-kicker` 系三个类换成 `home/list` 共用，打印样式隐藏工具栏 |
| 本次提交 | **第 12 项文章页完成**：新增 `app/[lang]/posts/[...slug]/page.tsx`（构建期 `getPostWithBody` → `renderMarkdown`，正文进 HTML；`generateStaticParams` 按语言列出全部 slug、`dynamicParams = false`）、`lib/article.ts`（目录缩进档与阈值 / 上下篇 `articleNeighbors` / frontmatter 的 `typography` 翻成渲染选项 / giscus 主题与 term 映射 / 中英文案；对 `markdown.ts` 等一律只 `import type`，因为客户端组件会值导入它）、`components/article/` 四个组件（`ArticleToc` 悬浮目录 —— 真锚点 + IntersectionObserver 且底部带 compact 档上下篇；`ArticleProgress` 右侧 2px 进度线 + 宽屏百分比 + 圆形回顶；`ArticlePager` 无 hook 的上下篇，full/compact 共用；`GiscusComments` 滚到附近才加载、换外观走 postMessage 不重载）、`app/globals.css` 新增「6e. 文章页」一节（宽度 = `calc(var(--reading-measure) + 3rem)`，不写死 42rem；四个 `<head>` 系类与首页 / 列表页共用；文章页右下角图签让给回顶按钮；打印隐藏悬浮件与评论区）；`lib/site.ts` 新增 `COMMENTS` + `commentsReady()`，`ARTICLE_ROUTE.status` 改 `"ready"`（首页与列表页的卡片标题**一行没改**就变成真链接）；`lib/icons.ts` 补 5 个图标（目录 / 上下箭头 / 回顶 / 评论）；补上第 6 项留下的 abc 五线谱配色缺口（`components/charts/abc.ts` 渲染后只把近黑的 `stroke` / `fill` 换成 `--c-ink`）；删掉开发态自检 `components/dev/PipelineCheck.tsx`、首页里那三行与 `.pipeline-check` 的 CSS（约定第 6 条兑现）；`lib/list.ts` 的 `fullNote` 与首页第 6 栏的一行旧文案同步成「正文页已落地」的说法。台账同步：目录树、进度表（12/14）、新增第 12 项小节、约定第 6 条、跨项待办、第 8 节的 11 条验收清单 |
| 本次提交 | **第 13 项其余页面完成**：新增七个页面 —— `app/[lang]/{tags,categories,archives,search,about,links,settings}/page.tsx`。主线是「不写第二份」：标签 / 分类页共用 `components/pages/FacetIndex.tsx`（服务端组件、零状态，点标签就是普通链接），搜索页**整份复用** `components/list/PostList.tsx`（只多传 `autoFocusSearch`，且读者已点到别处就不抢焦点），设置页**整份复用** `components/SettingsCenter`（同一份界面现在四处共用：顶栏按钮 / 首页两栏 / 抽屉 / 这一页），关于页渲染 frontmatter 里 `about: true` 的最新一篇（走第 3 项那条渲染管线 + `ArticleBody`，`typography` 也照第 12 项接上），友链页读 `lib/site.ts` 新增的 `LINKS`（空数组则显示「编辑此处」与填法，不渲染空清单），归档页是年 → 月 → 文章的时间线（月份只分组不筛选，只有年那一行有 `?year=` 链接）。新增 `lib/pages.ts`（这几页的文案与纯函数：`facetWeight` 字号四档 / `monthName` / `archiveYearHref` / `tagHref` / `categoryHref`）；`facetHref()` 挪进 `lib/list.ts` 成为**唯一**的「跳到某一类文章」地址实现（文章页那份私有的删掉了）；`app/globals.css` 新增「6f. 其余页面」一节（标签云 / 归档时间线 / 友链 / 设置页壳，打印时 `archive-year-link` 不印、清单避免跨页断开）；`ROUTES` 七个页面全部改 `"ready"`（顶栏不再有压暗项，没动顶栏代码）；sitemap 新增 `FACET_PAGES` 小表（标签 / 分类 / 归档 / 关于 / 友链；搜索与设置 `noindex` 故意不进）；`/offline/` 的缓存清单补上两个语言的列表页并写明「打开过的文章断网时通常也打得开」。台账同步：目录树、进度表（13/14）、新增第 13 项小节、约定第 2 / 8 / 9 条、跨项待办、第 8 节的 9 条验收清单 |
| 本次提交 | **第 14 项交付（差锁文件）**：新增 `README.md` —— 站点是什么、快速开始（五个脚本 + 打开 `/zh/` 后先做的三件事）、写第一篇短文（YAML / TOML 两种 frontmatter 各一段）、部署到 Workers 静态资源（含 Cloudflare 构建设置与 GitHub Actions 的 Secrets）、目录结构概要、「需要你亲自填的地方」六行清单（每行都写了留空会发生什么）、如实说明的验证状态、三条不能破的约定（完整十条指向本台账）。README 里的事实逐条对着源码核过（脚本名 / `wrangler.toml` / workflow 的 action 与 `command: deploy` / `lib/site.ts` 的 `SITE.description`·`CONTACT`·`COMMENTS`·`LINKS` / `lib/home.ts` 的 `intro.body`·`themes.demo`·`fonts.sample` / `lib/content.ts` 的 `COVER_DIRS`）。台账：进度表第 14 项改 `[~]`（README 与提交 ✅、锁文件 ⏳）、新增「14. 交付」小节、跨项待办里那条「第 14 项」重写成「只剩一件需要 shell 的事」、第 6 节关于 wrangler 的注解与第 8 节的口径同步。**本环境无 shell，锁文件（`bun.lock` / `package-lock.json`）没有生成**，手写等于编造依赖解析结果，留你在本机 `bun install` 后提交 |
| 本次提交 | **顶栏改版 —— 对齐 wunai-blog 参考稿**（一次修订，不是新的第 15 项）：`components/SiteHeader.tsx` 重写成「品牌 / 友链 / 图片位」三段（品牌区＝外观按钮 + 大号站名 + 闪烁光标 + 两端对齐的小字行「wunai 是谁？ About…… / 全部文章 →」；友链＝图标 + 小字竖排、`margin-left: auto` 右靠；图片位＝`HEADER_IMAGE` 撑满顶栏高，留空时画虚线空位且尺寸与有图时一致）。新增 `components/HeaderIntro.tsx`（客户端：三段错开 90ms 淡入 + 标签页切后台时暂停光标；顺序是「默认可见 → JS 就绪后才淡入」，反过来会让禁用 JS 的读者看不到顶栏）。原先挂在顶栏的**七项导航、语言切换与内容统计搬到页脚**（`components/SiteFooter.tsx` 第一块；统计那行复用 i18n 里已有的 `statsPosts` / `statsWords` / `statsUpdated` / `statsEmpty`，没有第二份文案）—— 不搬就会有四个页面失去入口。`components/RouteLink.tsx` 新增可选 `title`，pending 态把自定义提示与「第 N 项落地」拼起来而不是盖掉它。`lib/site.ts` 新增 `HEADER_IMAGE`（`<img>` 而非 `next/image`：静态导出不优化图片、且构建期不校验文件存在）。`app/globals.css` 新增令牌 `--header-h`（5.5rem / ≤48rem 4.75rem / ≤30rem 4.5rem，**两档窄屏值必须留在未分层的位置**，写进 `@layer` 会被 `:root` 压过），`--home-head-room` 改成由它推导（删掉首页窄屏那档 8.5rem）；顶栏/页脚两节重写，删掉 `.site-header-inner` / `.site-brand` / `.site-logo` / `.site-caret` / `.site-nav` / `.site-nav-entry` / `.site-titleblock`，`--frame-width` 只剩页脚与 `.page` 用。台账同步：进度表下加「追加的一次修订」说明、目录树、第 7 项小节加改版指引、第 9 项里 `--home-head-room` 与「内容统计在哪」两处、新增「顶栏改版」一节、约定新增第 11 条（顶栏只放三段 + 高度只有 `--header-h` 一个来源 + 动效顺序不能反）并扩了第 2 条（图片位）、第 8 节新增 10 条验收清单（并修掉第 8 项验收里那句「只有两张图纸能对照」的过时说法）、第 9 节本行。README 同步：图片位进「需要你亲自填的地方」表、「完整的十条约定」改成十一条并加了指向「顶栏改版」一节的指引（第 1 节「只读文字」那一行的措辞后来又跟着「背景改成纯色」那次再改了一遍） |
| 本次提交 | **背景改成纯色（图案层关掉）**（站长的要求）：`lib/decor.ts` 新增 `DECOR_PATTERNS = false`，`decorate()` 一律返回 `plain` —— 每页的 `data-decor` 都是 `plain`，纸面只剩 `<html>` 的 `--c-canvas`：没有细格 / 粗格、没有边缘淡出、没有虚线图框。七套图案与 `PATTERNS` 表**一行没删**（开关改成 `true` 即整套恢复）。CSS 补 `.blueprint[data-decor="plain"]::before { display: none }`（连边缘淡出也关掉，这一层真的什么都不画）。顺手修掉一处会被这次改动弄坏的判断：文章页右下角「图签让给回顶按钮」原来判 `data-decor="measure"`，纯色下永远不成立，已改成 **`data-route="article"`**。右下角图签（编号 + 页名）与换页那 0.32s 淡入**保留**（不是背景，随路径变的映射还在）。台账同步：第 8 项小节加「默认已关闭」指引、新增「背景改成纯色（图案层关掉）」一节、第 6 节的图纸对照表与第 8 节验收清单改写（第 8 项验收里那句「十一张图纸都能看到」改成「要先把开关打开」）、本行。README：第 1 节「只读文字」那一行改成「背景是一整块纯色」 |
| 本次提交 | **环境色大色块 + 换页渐入（第 8 项的一次扩展）**（站长的要求：① 全站换页要有不影响阅读的渐入；② 每页要有自己的大色块模糊背景或结构覆盖、且不挡字；③ 每次换页图形要丝滑变成另一种图形。中途追加一句硬要求：**「不要任何格子背景，背景干净点」**）。`lib/decor.ts` 新增 `AMBIENTS` 穷尽表（12 页：每页三块大色块的颜料号 / 圆心 / 直径 / 椭圆朝向 / 浓度）与三个常量（`AMBIENT_SHIFT_MS` 1100 / `AMBIENT_BASE_VMAX` 36 / `PAGE_FADE_MS` 420），`decorate()` 多返回一个 `ambient` 字段；新增 `components/AmbientBackdrop.tsx`（`fixed; z-index: -1`、`aria-hidden`、`pointer-events: none`，三块 `<span class="ambient-blob">`：**宽高恒定、几何全在 `transform: translate/rotate/scale` 上**，所以换页时浏览器插值 transform 与 background-color = 丝滑形变；软边用 `mask-image: radial-gradient(closest-side, …)` 而不是 `filter: blur()`——手机上一大片 blur 每帧重栅格化，遮罩是一次性的）与 `components/PageIntro.tsx`（换页后给 `<html>` 挂 `data-page-in`，`.site-main` 从 `opacity: 0.3` 淡到 1；**只改 opacity 不加位移**——`.site-main` 上出现 transform 会变成 fixed 后代的包含块，文章页那条可拖的进度轨会跟着走；**首帧不播**且判定用「上次播过的路径」而不是 `mounted` 布尔，免得开发模式跑两遍 effect 把首屏也淡一次；属性在**布局阶段**挂上，新内容第一帧就是 0.3，不会先全亮再变暗；连换两页时先摘属性 + 强制重算再挂回），两个组件挂在 `app/layout.tsx`（环境色层在蓝图层**前面** = 画在它下面，所以右下角图签仍压在色块上）。`app/globals.css` 新增三套外观的环境色令牌（`--ambient-tint-1…6` + `--ambient-alpha`：纸 0.18 / 亮 0.14 / 暗 0.22；正文页整层压到六成、窄屏再压一档）与「5c. 环境色层」「5d. 换页渐入」两节，打印时 `.ambient` 不印，`prefers-reduced-motion: reduce` 下色块不做过渡、也不写渐入属性。**第一版做过的「结构覆盖」（同心环 / 交叉网 / 点阵 / 色带 / 弧，全是渐变线格）整套已删** —— 站长那句「不要任何格子背景」否的就是它；`lib/decor.ts` 与 globals.css 第 5c 节两处都留了「别再往回加」的注释。台账同步：进度表第 8 项、目录树三行、第 8 项小节加指引、「背景改成纯色」一节补一句（底色仍然没有图案，现在多了低浓度色块）、新增「环境色大色块 + 换页渐入（第 8 项的扩展）」一节、约定第 5 条扩写（背景装饰层只许纯色与大色块；换页渐入只许改 opacity）、第 8 节新增 8 条验收、本行。⚠️ **本环境无 shell、跑不了浏览器**，形变是否顺滑、色块会不会影响阅读、渐入有没有闪烁，都要等下一次构建在浏览器里看 |
| 本次提交 | **卡组页 + 非 ASCII slug 的构建期拦截 + 工具栏默认收起**（站长报「新文章打不开」「明明是卡组却只显示一篇文章」「筛选菜单别摊开」）。根因两条，都有线上证据：① `content/zh/posts/notes/笔记.md` 没写 `slug`，slug 被推成中文 `notes/笔记`，浏览器把 href 编码成 `%E7%AC%94%E8%AE%B0` 而静态产物是中文目录名，Cloudflare 一解码就命不中 → 「卡片在、点进去 404」；② 卡组分块显示的改动当时只在工作区、没提交，线上是平铺的一列卡片。修法：内容侧补 `slug = "note-1"`（地址变成 `/zh/posts/note-1/`），代码侧 `lib/content.ts` 新增 `assertUrlSafeSlug()`（非 ASCII 的 slug 让**构建当场失败**并给出「改文件名 / 补 slug」两种改法，别让作者去线上猜）；新增**卡组页** `/<lang>/posts/<group>/`（`app/[lang]/posts/[...slug]/page.tsx` 的 `CardGroupPage`，与文章页共用 catch-all、顺序「先文章后卡组」，于是 `notes/index.md` 那种目录首页写法不会撞车），路由表由 `lib/content.ts` 的 `getCardGroupRoutes()` 一次推出、`app/sitemap.ts` 与 `generateStaticParams` 共用，列表页组头用 `lib/list.ts` 新增的 `groupHref()` 链过去；列表页工具栏改成**默认收起且不再因筛选自动展开**（只有 `/search/` 挂载后展开），组头可点、卡组封面固定 13rem 居中裁切。文档：`content/README.md` 第 1 / 5 节写明卡组页与「谁更具体谁优先」，台账新增「卡组页 + 新文章 404 的根因」一节与 5 条验收。⚠️ 本环境无 shell，以上都要等下一次构建（本机或 Cloudflare）才作数 |
| 本次提交 | **首页改版 —— 一栏一屏**（站长的要求：一个栏目占一屏、去掉栏目卡片、吸附别乱）：`lib/home.ts` 的 `HOME_ROWS`（带 `pair` 的二维表）换成 `HOME_ORDER: HomeBlockId[]`（一维数组），页面直接按它渲染 8 个 `<section class="home-block">` —— 去掉 `.home-row` 包装、**去掉并排**、`<section>` 不再带 `panel`（没有边框 / 圆角 / 阴影 / 面板底色）。`.home-block` 自己就是吸附块（`min-height: calc(100svh - var(--home-head-room))` + `scroll-snap-align: start` + `scroll-snap-stop: always`），`html:has(.home-flow)` 的吸附从 `y proximity` 改成 **`y mandatory`**；`.home-flow` 去掉 `gap` 与上下内边距、顶部补一段 `--header-h` 的留白（顶栏吸顶会盖住文档最上面一截），窄屏那档 `min-height: auto` 删掉（手机上也一栏一屏）。`HOME_POST_LIMIT` 6 → 4（卡片多了会超过一屏）。`HomeIndex` / `page.tsx` / `lib/home.ts` 的注释与台账同步；打印仍把八栏摊成连续文档。台账：进度表第 9 项、目录树、第 9 项小节加改版指引与两处内联纠偏、新增「首页改版 —— 一栏一屏」一节、跨项待办里首页那条改成 `HOME_ORDER`、第 8 节新增 7 条验收清单。**同一提交内又修了一轮**（第一轮还是不够确定，会长说「混乱吸附」）：`.home-block` 从 `min-height` 改成**定高 `height: calc(100svh - var(--home-head-room))` + `overflow-y: auto`** —— 吸附区比视口高时滚动中途没有合法停靠点，一松手就被拽回去，这才是「吸附乱」的根；栏内滚动条不画。去掉 `scroll-snap-stop: always`（吸附点已经是整屏，留着只会把一次滑动锁成一栏）。补 `html:has(.home-flow) .site-footer { scroll-snap-align: end }`：文档末尾没有吸附点的话，mandatory 会把页脚吸回去、永远读不到。页面里每栏多一层 `<div class="home-block-body">`：居中挪进这一层 —— 在滚动区自身上写居中，溢出的那一头（栏头）会永远滚不到。`.home-flow` 顶部留白从 `--header-h` 改成 `--home-head-room`（与吸附让位同值，「第 N 栏 = 往上翻 N − 1 屏」才对每一栏成立）。`@media print` 与 `prefers-reduced-motion: reduce` 两处都放开定高与栏内滚动。台账同步：第 9 项那一节、第 8 节那 7 条验收按新做法改写、本行 |
| 本次提交 | **文章页悬浮件补强 —— 目录开关 / 可拖进度 / 回顶进度环 / 粘性标题**（站长这轮要的是那几件悬浮件的手感）。新增 `components/article/ArticleStickyTitle.tsx`：零高（`height: 0`）的 `position: sticky` 容器贴在 `<article>` **里面**，大标题滚出视野后由 IntersectionObserver（判定线 `STICKY_TITLE_OFFSET`，与目录高亮那条同值 = 顶栏下沿）在吸顶顶栏下面挂一条同名标题，两端外扩 1.5rem 与正文列同宽、长标题省略号，对读屏 `aria-hidden` 且里面不放可点的东西。`ArticleToc` 的面板第一行改成开关（`aria-expanded` / `aria-controls`）：**默认状态交给 CSS**（`data-open` 不写 = 宽屏展开、窄屏收起），读者点过之后才写死 —— 于是**没有 JS 的宽屏读者照旧看得到目录**，而窄屏默认只剩左下角那个挂件（`bottom: 3.9rem`，叠在设置齿轮上面；左上角被顶栏、右下角是回顶按钮），点开是左下角弹出的浮层、点一条目录顺势收起；断点 `(min-width: 78rem)` 与 CSS 同值，落成 `lib/article.ts` 的 `TOC_WIDE_QUERY`（组件读它把 `aria-expanded` 说准）。`ArticleProgress` 的右边缘细线变成 `role="slider"`：命中区放宽到 0.9rem（触屏 0.7rem）、轨道铺满视口高度（所以「指针纵坐标 ÷ 视口高」就是百分比），拖动用 `setPointerCapture` 且**触屏先要移动 6px 才算拖动**（手机右边缘常被拿来滚页面，`touch-action: none` 保证那一下不会同时滚页面）、鼠标按一下轨道即跳（滚动条手感）、键盘 ↑/↓ 一步 / PageUp·PageDown 三步 / Home·End 两头，并为这个 div 补了它自己的 `:focus-visible` 焦点框；回顶按钮从 2.4rem 放到 2.6rem 并套上一圈 `stroke-dashoffset` 进度环（与右边那条线、百分比牌子读同一个 `progress`）。`lib/article.ts` 新增三个常量与三句文案（中英各一份），`lib/icons.ts` 补 `mdi:chevron-left`，`app/[lang]/posts/[...slug]/page.tsx` 挂上新组件。`app/globals.css` 的「6e. 文章页」新增粘性标题一节并重写目录 / 进度两节，层序落成 **粘性标题 17 < 目录 18 < 进度与回顶 19 < 顶栏 20**；打印时这四件一起不印。台账：目录树、进度表第 12 项、跨项待办里那条层序、新增「文章页悬浮件补强」一节与第 8 节 4 条验收、本行。⚠️ 本环境无 shell，以上都要等下一次构建（本机或 Cloudflare）才作数 |
| 本次提交 | **友链页填上八个友链 + 头像（与 wunai-Blog 一致）**（站长的要求）：`lib/site.ts` 的 `LINKS` 从空数组变成**八个**（哈康 / 摩尔 / 阿卡迪亚 / 并非懒得喷 / subear / GTMC / 戈登 / Ryan100c）—— 名字、地址、头像、一句话介绍逐条对着 wunai-Blog 的 `my-app/lib/links.ts` 抄，连「谁的简介取自哪里」的注释也一并带过来；数据形状从 `{ name, url, note? }` 扩成 `FriendLink { name, url, avatar?, note?: { zh, en } }`（新增 `FriendLink` 接口与两个纯函数：`friendNote()` 取当前语言、缺则退回中文，`friendHost()` 去掉协议与末尾斜杠，做介绍缺失时的回退文案）。`app/[lang]/links/page.tsx` 的卡片改成与 wunai-Blog 的友链页同构：**整张卡片可点**，左头像（原生 `<img>` + `loading="lazy"` + `decoding="async"` + `referrerPolicy="no-referrer"`，不走 `next/image` —— 静态导出不优化图片、`remotePatterns` 也管不到任意域名；没填头像时按名称首字画占位方块，不留碎图）、右名字 + 介绍 + **仍然印出来的地址**（本站自己的取舍，参考稿没有这一行，留着是为了点不动时能复制）。`app/globals.css` 的友链一节重写（`.links-card` / `.links-avatar` / `.links-avatar-fallback` / `.links-body`，颜色一律令牌，不写 dark: 变体），打印清单补上 `.links-item { break-inside: avoid }`。`lib/pages.ts` 的 `links.lead` 与 `emptyHint`（中英各一份）改成新形状。README / 台账同步：README 的「需要你亲自填的地方」那行、目录树、进度表下第 13 项小节里的友链页一段、第 8 节验收第 7 条、约定第 2 条、本行。⚠️ 头像是**外链**（八个里六个走 GitHub 头像，subear 与 GTMC 用对方站点自己的图 / favicon，与参考稿一致）—— 这是全站唯一一处会主动向第三方取图的地方，也是 README 第 1 节「只读文字」那条取舍的例外（已写进这一页的文件头注释）；**本环境无 shell、也跑不了浏览器**，八张图能不能加载出来要等下一次构建（本机或 Cloudflare）在联网环境里看 |
| 本次提交 | **全站加载动画 + 卡片动画 + 文章/笔记卡片细分 + 顶栏外观按钮去边框**（站长的四项要求）。① **加载动画**：新增 `components/RouteLoading.tsx`（客户端，挂在 `app/layout.tsx`）—— 静态导出没有服务端流式渲染、`loading.tsx` 在这种模式下不生效，换页时读者看不出「点了、正在过去」，于是补一条画在**视口最上沿**的描线（`z-index: 60`，比抽屉 50 还高；`pointer-events: none` + `aria-hidden`）。三条真实触发路径：document 捕获阶段的 click（外链 / `target` / `download` / 修饰键 / 点当前页都跳过，不给每个 `<a>` 挂 onClick）、popstate、以及首屏 `readyState !== "complete"` 时的 `load`；「完成」的信号是 `usePathname()` 变了（App Router 渲染完才变），所以进度不是定时器编的 —— CSS 里 `scaleX(0.88)` 爬到 88% 停住等，收尾那 12% 由换页完成触发；减少动效的人不爬升（只淡入淡出）。② **卡片动画**：新增 `components/CardIntro.tsx`（客户端，同样挂在根布局）给 `.post-card` 加 `data-card-ready` 与 `--card-delay`，样式全在 CSS —— 卡片**默认可见**，只有被观察器认领过的才先藏起来再揭（禁用 JS 时卡片一直在，绝不出现「内容永远隐形」），同一屏最多错开 8 张 × 45ms，用 `animation` + `backwards` 填充（不用 forwards：动画跑完要交还控制权，否则 `:hover` 的抬升会被动画的 transform 压死）；只对当前这一页的首次出现生效，客户端筛选换出的新卡片不再播（每敲一个字整屏重冒是干扰）；悬停抬 2px + 描边加深 + 一层淡投影（投影颜色也走令牌）。③ **文章 / 笔记两种卡片**：`components/list/PostCard.tsx` 新增 `data-kind`（`group === ""` = 文章，在卡组目录里 = 笔记），笔记卡改成「草稿纸」语言 —— 虚线描边 + 画布底色 + 一枚「笔记 · 卡组名」角标（`mdi:folder-outline`，卡组名等宽小字）、标题小一档，悬停由虚转实并染强调色；文章保持实线 + 面底色。文案进 `lib/list.ts`（`card.note` / `card.noteHint(group)`，中英各一份）。④ **顶栏外观按钮去掉边框**：`.brand-switch .icon-button { border-color: transparent }`，悬停反馈改成底色（`--c-accent-soft`），尺寸 / 底色不变（删 width/height 会让顶栏高度跳一下）；只对顶栏那一颗生效，抽屉关闭按钮与列表页工具栏按钮照旧有框。`app/globals.css` 另加：加载线一节 + 打印时不印；卡片入场 / 悬停 / 笔记版式三组 + `prefers-reduced-motion: reduce` 下的显式降级（`animation: none`、不位移）。台账同步：目录树两行、层序清单（新增 60 那一层）、本行。⚠️ **本环境无 shell、跑不了浏览器**，四项都要等下一次构建并在浏览器里看：加载线的时机（尤其首屏缓存命中时不该闪）、卡片入场与筛选时的表现、笔记卡在暗色外观下的对比度、顶栏那颗按钮去框后的可点感 |
| 本次提交 | **首页更新日志做成 wunai-Blog 的样子**（站长的要求）。样式与交互照参考项目首页 `.ah-updates` / `.ah-update` 那一块搬过来：一列「等宽日期 + 提交主题 + 最新那条一枚「新」标记」的行，默认只有一圈透明描边、悬停时描边与底色浮出来，**整行点开是这条提交在 GitHub 上的页面**（新标签页 + `rel="noopener noreferrer"`），`title` 挂完整哈希。`components/home/HomeChangelog.tsx` 重写（新增 `.home-updates` / `.home-update` / `-date` / `-title` / `-tag` 五个类，`app/globals.css` 的「6c. 首页」一节新增这一组，颜色全走令牌；`.home-item-date` / `.home-item-hash` 两条只服务旧版更新日志的规则删掉，第 6 栏用的 `.home-list` / `.home-item` 原样保留）；`HOME_TEXT.changelog` 新增 `newTag`（中英各一份）并把 `note` / `empty` 改写成「先 API 后 git」的口径。**同一提交里把数据来源也换成了参考项目那套**：`lib/changelog.ts` 现在先试 **GitHub REST API**（`CONTACT.repo` 里抠 `owner/repo`，`per_page` 多要几条以过滤合并提交）再退回 `git log`，两条都失败才返回空数组 —— 理由是 Cloudflare 自己那套云构建是**浅克隆**（构建日志里只有一句 `Cloning repository...`），只靠 `git log` 线上那一栏会缩成孤零零一条，参考项目的 `scripts/generate-changelog.mjs` 当年就是为此改的；同时每条记录多带一个 `url`（GitHub 上的提交地址），首页那一栏才点得动。函数改成异步（`getChangelog()` / `loadChangelog()` 返回 Promise，`app/[lang]/page.tsx` 与 `app/changelog.json/route.ts` 同步改），`/changelog.json` 多一个 `source` 字段（`github` / `git` / `none`）方便排查「为什么只有一条」。⚠️ 那一处 `fetch` 必须用 `cache: "force-cache"`，**不能** `no-store` —— 静态导出下 `no-store` 会把页面标记成动态渲染、构建当场失败（已写进代码注释）。文档同步：README 与 workflow 的 `fetch-depth: 0` 注解改成「兜底」、台账第 5 项的更新日志一段与第 9 项第 4 栏一段、目录树两行。**本环境无 shell**，`next build` 与 GitHub API 那一跳都要等下一次构建才作数 |
| 本次提交 | **README 补「本地部署」一节**（站长的要求）：插入 `## 3. 本地部署（自己的一台机器 / 内网）` —— 一句话说清「本地部署 = 把 `out/` 交给任意静态服务器，不需要 Node 运行时 / 数据库 / 环境变量」，前置条件只有 Node ≥ 20.9，然后是三条路径：3.1 本机当线上跑（`npm run preview` + `out/` 里该有什么 + Service Worker 只在生产构建 / HTTP 下生效 + 离线怎么验）、3.2 交给 nginx（含一段 `try_files … =404` + `error_page 404 /404.html` 的配置）与四条容易踩的（尾斜杠别抹掉、没配 `basePath`·`assetPrefix` 所以只能挂根路径否则白屏、404 要交给 `out/404.html`、Service Worker 需要 HTTPS 或 `localhost`）、3.3 与 Cloudflare 那一套的关系（同一份 `out/`，线上只能选一处，换子路径要重新构建）。原第 3~8 节顺次挪成第 4~9 节；README 里的节号引用都指向 `content/README.md` / `PROJECTS.md`（已 grep 确认没有内指，挪号不会把谁指错）。事实逐条对着源码核过：`next@16.3.1` 的 `engines.node`（取自 npm registry 的包元数据）、`package.json` 的 `preview` = `npx --yes serve out -l 4173`、`next.config.ts` 的 `output: "export"` + `trailingSlash: true` + 无 `basePath`、`components/ServiceWorkerRegistrar.tsx` 的「只在生产构建注册」与 `public/sw.js` 的外壳清单、`lib/changelog.ts` 的「GitHub API → `git log` → 空」三步且**不阻塞构建**。⚠️ **本环境无 shell**：那段 nginx 配置与两条临时服务器命令是通用写法，没有在本机跑过，示例域名 / 路径按自己的机器改 |
| 本次提交 | **中文里的 `**` / `~~` 修正（站长报「我写的 md 渲染有问题」）**。站长指的是《医药学笔记》里那几处加粗失效 —— 去线上把 HTML 抓回来看（`/zh/posts/pharmacy-note-1/`），根因**不是站点 bug、也不是作者写错**，而是 CommonMark 的既定行为（commonmark-spec#650，中日韩文本的强调标记问题）：闭合定界符的**内侧是标点**、**外侧既不是空白也不是标点**时不算「右翼定界符」。现场证据正好把这条规则证出来 —— 坏的四处（`**抗生素(antibiotic)**的定义`、`**亚历山大·弗莱明[…]**发现`、`*青霉素(Penicillin)*开始`、`**钱恩[…]**利用`）与好的三处（`**抗生素(antibiotic)**，`、`**弗洛里[…]**, `、`**弗莱明**与`）的差别只有「外侧那个字是标点还是汉字」。修法是**渲染层**（站长选的）：`package.json` 加 `remark-cjk-friendly@^2.3.2` + `remark-cjk-friendly-gfm-strikethrough@^2.3.1`（版本与入口点取自 npm registry 的包元数据：两者都有 `/parseOnly` 导出，都是 ESM-only、Node ≥ 18、peer 只要 `unified@^11`，本站全满足），`lib/markdown.ts` 在 `remark-gfm` 之后挂上这两个（`remark-cjk-friendly-gfm-strikethrough` 必须排在 `remark-gfm` 之后，插件自己的要求）、文件头注释写清「与第 4 项的 `remarkCjkTypography` 不是一回事」（那个改 text 节点的值，这个决定解析阶段认不认定界符）。同时把《笔记1》里的 `1.有序` / `2.有序` 改成 `1. 有序` / `2. 有序` —— 有序列表标记后面必须有空格（CommonMark 硬要求，GitHub 同样如此），这条渲染器修不了。台账：第 3 项小节补一段（管线清单同步）。⚠️ **本环境无 shell，装不了包也跑不了 `npm run build`**：验证得靠本机或 Cloudflare 云构建（`bun install` 会按 package.json 装新依赖），上线后对照 `/zh/posts/pharmacy-note-1/` 那四处是否变成 `<strong>` / `<em>` |
| 本次提交 | **新笔记补 slug + 有序列表标记**（站长写《微时序笔记1》那一轮）。站长新写的 `content/zh/posts/minecraft_notes/微时序笔记1.md` 文件名是中文却没写 `slug` —— 这正是上一轮被 `lib/content.ts` 的 `assertUrlSafeSlug()` 拦下来的那种写法（非 ASCII slug 线上必 404），已补 `slug = "micro-timing-note-1"`，地址是 `/zh/posts/micro-timing-note-1/`（卡组页仍是 `/zh/posts/minecraft_notes/`）。正文里 13 处 `1.世界边界检查` 补上标记后的空格（→ `1. 世界边界检查`）：**有序列表标记后面必须有空格**，缺了它只是一个「以 1. 开头的普通段落」，而这条渲染器不会替你补（`remark-cjk-friendly` 修的是强调定界符，不是列表标记）—— 作者在《笔记1》里已经漏过一次同一处，所以顺手把这条写进 `content/README.md` 第 9 节的「写之前要知道的」清单（原文「两点要知道」改成「三点」），免得再犯。⚠️ 本环境无 shell：要等下一次构建（本机或 Cloudflare）才能确认 `/zh/posts/micro-timing-note-1/` 打得开、那个 13 项是有序列表而不是 13 个段落 |
| 本次提交 | **台账状态变更 + 第 15 项现行规范（几何实体与手绘草稿）**（站长的判断：框架已经出来了，这份台账属于项目前期的东西）。**§1~§9 全部转为「历史档案」** —— 追溯与查证用，不再要求逐条遵守（新代码不必照它们的措辞写注释，也不必再提「第 N 项落地」）；**文件开头新增【现行】一节**作为唯一要严格遵守的规范。站长对八个追问的答复逐条落成规格：① **C：每页 1 主实体 + 1 小卫星**（元素数量恒定，用不上的写 `fade: 0` 而不是删行）；② 实体**允许跨过正文列**（「穿插在正文里」），正文列**不加**不透明底；③ **实体永远放在文字后面** —— 整层永远 `z-index: -1`、没有前景装饰层；④ **八色颜料表**（朱 / 暖褐 / 陶土 / 芥黄 / 苔绿 / 青 / 群青 / 紫），**浅底（纸 / 亮）用重色、深底（暗）用浅色**，整层浓度由 `--figure-alpha` 收着（历史里「文章页压到六成」那条取消：文章页的实体是主角）；⑤ **不做指针跟随**（只留「换页形变 + 滚动联动」两件互动）；⑥ 草稿线**做细（0.6~1px）、只跟着实体**、四类（轮廓双线 / 构造线 / 排线 / 标注，V1 做前两类）、**不做满页网格**；⑦ **图签合并进实体**（`TOB-ZH-03` + 页名变成实体的注解，`BlueprintBackground.tsx` 与 `.blueprint-tag` 删除、`data-route` 挪到实体层）；⑧ **分两批**（V1 / V2 清单见 §15.6）。技术取舍也写进去了：去掉 `mask-image` 之后**允许直接 transition `width` / `height`**（整层 `fixed`、不占文档流，不会引起 CLS）、手绘路径必须**确定性**（种子来自路径，禁止 `Math.random()`，否则 hydration 不一致）、滚动**只读**且位移上限 ±8vh（实体必须留在视野里）。**本节显式替代历史两处**：约定第 5 条「背景只许纯色与大色块、加线先问一声」→ 改为「细线可以，但只许跟着实体、不许满页网格」；软边大色块 → 硬边带描边的几何实体。另外记下参考站取证（阿卡迪亚 `arcadia.moe` 只借「跨场景持续色块的声明式 morph」，不借指针跟随的小圆、满页 12 栏网格、`blur` 入场与噪点）。⚠️ **本次只改了这份台账，`app/` `components/` `lib/` 一行没动** —— 代码留到 V1 那一轮；届时 `grep -rn "data-decor\|blueprint\|ambient"` 应当为空 |
