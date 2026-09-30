import ArticleBody from "@/components/ArticleBody";
import { renderMarkdown } from "@/lib/markdown";

/**
 * 渲染管线自检（**只给开发用**，不属于站的任何页面内容）
 *
 * 为什么会存在：本仓库不放任何文章（见 PROJECTS.md 第 5 节），
 * 但第 3 项的渲染器又必须在文章页（第 12 项）之前就能验证。
 * 所以这里内置一小段样例，`npm run dev` 时挂在首页上，用来肉眼确认：
 * GFM 表格 / 任务列表 / 代码高亮 / KaTeX（含宏与 mhchem）/ 五类图表 /
 * 参考文献角标（含「缺定义」的报错路径）/ 目录抽取 / 中文排版优化（第 4 项，含「关闭后」的样子），
 * 都还能正常工作。
 *
 * 生产构建里整块不会出现（app/[lang]/page.tsx 用 NODE_ENV 判断后才 import 本文件），
 * 确认完之后删掉这个文件与首页里的那三行即可。
 *
 * 样例用 `~~~` 围栏而不是三个反引号，是为了能直接写在模板字符串里（省掉转义）。
 * String.raw 保证 \ce、\mathrm 这些反斜杠原样传给 KaTeX。
 */
const TICK = "`"; // String.raw 会把 \` 里的反斜杠一起留下，所以内联代码用拼接

const FIXTURE = String.raw`
## 自检：GFM

**加粗**、*斜体*、~~删除线~~、${TICK}行内代码${TICK}，以及一个裸链接 https://nextjs.org。

| 能力 | 状态 |
| --- | --- |
| 表格 | 正常 |
| 任务列表 | 见下 |

- [x] 已完成
- [ ] 未完成

> 引用块：换行在 remark-breaks 下会保留。

## 自检：公式

行内：$E = mc^2$，自定义宏：$\RR^n$ 上的 $\dd x$、$\abs{x - 1}$，化学式 $\ce{2H2 + O2 -> 2H2O}$。

$$
\int_0^1 x^2 \,\mathrm{d}x = \frac{1}{3},
\qquad \Var(X) = \E[(X - \mu)^2]
$$

## 自检：代码高亮

~~~ts
export function greet(name: string): string {
  return "你好，" + name; // monokai
}
~~~

## 自检：五类图表

~~~mermaid title="管线示意"
flowchart LR
  A[Markdown] --> B[unified]
  B --> C[HTML]
  C --> D[浏览器]
~~~

~~~echarts title="柱状图"
{
  "xAxis": { "type": "category", "data": ["一", "二", "三"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [3, 1, 4] }]
}
~~~

~~~graphviz title="有向图"
digraph G {
  rankdir = LR;
  a -> b -> c;
  a -> c;
}
~~~

~~~abc title="小星星"
X:1
T:小星星
M:4/4
L:1/4
K:C
C C G G | A A G2 |
~~~

~~~smiles title="苯"
c1ccccc1
~~~

## 自检：参考文献角标

已定义：[reference:1]，也支持非数字 id：[reference:note]。
故意引用一条没有定义的：[reference:404]（应当显示成红色提示，并出现在下面的警告里）。

## 自检：中文排版（第 4 项）

这段话故意写得很糙:中文English混排,数字2024年,标点全用半角,末尾也是半角.
手打的三点...应当变成中文省略号;也试一下括号(像这样)。

以下三处**不该**被动到：${TICK}中文English${TICK}（行内代码）、$\text{中文English}$（公式）、
以及[中文English链接](https://example.com/中文English) 的地址 —— 链接**文字**会被排版，地址不会。
`;

const FIXTURE_REFERENCES = [
  {
    id: "1",
    title: "KaTeX 支持的命令",
    url: "https://katex.org/docs/supported.html",
    site: "katex.org",
  },
  {
    id: "note",
    title: "unified 官方文档",
    url: "https://unifiedjs.com",
    site: "unifiedjs.com",
    note: "本仓库的渲染管线就是它串起来的",
  },
];

/**
 * 关掉排版优化时的对照组（`typography: false`）。
 * 同一段文字在这里应当**原样**输出：半角标点、没有空格。
 */
const TYPO_OFF_FIXTURE = String.raw`
### 自检：中文排版（typography: false）

这段话应当原样输出:中文English混排,数字2024年,末尾半角.
`;

export default async function PipelineCheck() {
  const [main, typoOff] = await Promise.all([
    renderMarkdown(FIXTURE, { references: FIXTURE_REFERENCES }),
    renderMarkdown(TYPO_OFF_FIXTURE, { typography: false }),
  ]);
  const { html, toc, referencesHtml, warnings, typography } = main;

  return (
    <details className="pipeline-check" open>
      <summary>
        渲染管线自检（仅开发环境显示 / 不是文章 / 确认完可删）
      </summary>

      <p className="pipeline-check-note">
        {warnings.length === 0
          ? "没有警告。"
          : `${warnings.length} 条警告：${warnings.join("；")}`}
      </p>

      <p className="pipeline-check-note">
        目录抽取：{toc.length} 个顶层标题
        {toc.map((entry) => ` ${entry.depth}·${entry.text}(${entry.children.length})`).join("")}
      </p>

      <p className="pipeline-check-note">
        中文排版（第 4 项）：检查了 {typography.texts} 个含中文的文本节点，补空格{" "}
        {typography.spaces} 处、换标点 {typography.punctuation} 个、全角括号{" "}
        {typography.parentheses} 个、省略号 {typography.ellipses} 处。
      </p>

      <ArticleBody html={html} />

      <div className="article-body" dangerouslySetInnerHTML={{ __html: typoOff.html }} />

      {referencesHtml ? (
        <div className="article-body" dangerouslySetInnerHTML={{ __html: referencesHtml }} />
      ) : null}
    </details>
  );
}
