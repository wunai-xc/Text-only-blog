/**
 * lib/typography.ts —— 中文排版优化（第 4 项）
 *
 * 目标：写中文时不必手工在「中文 English」「2024 年」之间敲空格，也不必纠结该敲半角标点
 * 还是全角标点 —— 渲染期按中文排版的惯例统一收拾干净，正文里保留作者最顺手的那种写法。
 *
 * 四条规则（都能单独关掉，见 TypographyOptions）：
 *
 *   1. 空隙 spacing：汉字 / 假名 / 谚文 与**半角**字母数字相邻时补一个空格。
 *      `中文English` → `中文 English`；`2024年` → `2024 年`；两边本来就有空白的不动。
 *      补的是普通空格 U+0020（和 pangu.js 一致，不用窄空格，避免「看起来有空格但复制不出来」）。
 *   2. 标点 punctuation：**前一个字符是中文**时，半角 `, . ; : ! ?` 换成 `，。；：！？`。
 *      `他说,好` → `他说，好`；`中文.` → `中文。`。
 *   3. 省略号 punctuation 的一部分：中文语境里手打的 `...` 换成 `……`。
 *   4. 括号 parentheses（跟随 punctuation 的开关）：**成对的**半角括号只要有一侧贴着中文，
 *      两边一起换成全角。`中文(test)` → `中文（test）`；`f(x)` 不动（左边是字母）。
 *      必须成对：只换半边会得到 `中文（test）` 这样的错配，所以用栈配对，落单的括号一律不碰。
 *
 * 刻意**不碰**的东西（都是「碰了会出事」的）：
 *
 *   - 代码块 / 行内代码 / 公式：它们在 mdast 里是 `code` / `inlineCode` / `math` /
 *     `inlineMath` 节点的 `value`，不是 `text`；本插件只处理 text 节点，天然躲开；
 *   - 链接地址、图片地址、内联 HTML：同上（链接的**文字**是 text，会照常处理，这是想要的）；
 *   - 数字与英文单词内部的标点：`1,000`、`3.14`、`v1.2.3`、`example.com`、`a.ts` 的标点
 *     左边不是中文，规则 2 不命中；`.` 后面还跟着字母数字或 `/` 时也主动跳过；
 *   - 引号：半角 `"` `'` 一律不转（英文引号、代码、缩写里误伤率太高，中文引号请直接写 “ ”）；
 *   - 跨节点的相邻：`**中文**English` 在 mdast 里是三个节点，渲染期看不出它们贴在一起
 *     （作者自己敲个空格即可）。
 *
 * 本文件**零依赖**：纯字符串函数 + 一个 remark 插件，不 import 任何包。
 * 因此它既能被 lib/markdown.ts 用在构建期，也能单独 import 出来跑测试。
 */

/* ------------------------------- 字符分类 ------------------------------- */

/** 汉字（含扩展 A/B~F）、假名、谚文 —— 需要补空格、算「中文语境」的那一侧 */
const CJK_PATTERN =
  /[\u2E80-\u2EFF\u3005\u3006\u303B\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]|[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]|[\u{20000}-\u{2FA1F}]/u;

/** 半角字母数字（含拉丁扩展、希腊、西里尔）；剔除 ×(U+00D7) ÷(U+00F7) 这类其实是符号的码位 */
const ALNUM_PATTERN =
  /[0-9A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u0370-\u03FF\u0400-\u04FF]/;

/** 中文标点：它们左边也算「中文语境」，这样 `。.`、`？?` 这种连打能被收拾 */
const CJK_PUNCTUATION = "、。，．；：？！…—～·「」『』【】〔〕（）《》〈〉“”‘’〝〞";

function isCjk(char: string): boolean {
  return char !== "" && CJK_PATTERN.test(char);
}

function isAlnum(char: string): boolean {
  return char !== "" && ALNUM_PATTERN.test(char);
}

function isCjkPunctuation(char: string): boolean {
  return char !== "" && CJK_PUNCTUATION.includes(char);
}

/** 「中文语境」：汉字 / 假名 / 谚文 / 中文标点 */
function isCjkLike(char: string): boolean {
  return isCjk(char) || isCjkPunctuation(char);
}

function isWhitespace(char: string): boolean {
  return char !== "" && /\s/.test(char);
}

/* --------------------------------- 类型 --------------------------------- */

export interface TypographyCounts {
  /** 补上的空格数 */
  spaces: number;
  /** 半角 → 全角的句读标点数（，。；：！？） */
  punctuation: number;
  /** 半角 → 全角的括号数（一对算 2；落单的括号不换，不会计入） */
  parentheses: number;
  /** `...` → `……` 的处数 */
  ellipses: number;
}

export interface TypographyStats extends TypographyCounts {
  /** 检查过的、含中文的文本节点数（纯英文段落不计入，它们被直接跳过） */
  texts: number;
}

export interface TypographyOptions {
  /** 规则 1：中文与半角字母数字之间补空格（默认 true） */
  spacing?: boolean;
  /** 规则 2、3：半角标点转全角、`...` 转 `……`（默认 true） */
  punctuation?: boolean;
  /** 规则 4：成对半角括号转全角（缺省时跟随 punctuation） */
  parentheses?: boolean;
  /** 统计回调：插件把「这次处理了什么」交给调用方（开发态自检 / 构建日志用） */
  onStats?: (stats: TypographyStats) => void;
}

/* ------------------------------ 单条规则 ------------------------------ */

/**
 * 半角标点 → 全角。只看「前一个字符是不是中文语境」，这是防误伤的关键：
 * `1,000` 的前一个字符是数字、`example.com` 的 `.` 前面是字母，都不命中。
 * 返回 null 表示「这个字符不动」。
 */
function convertPunctuation(
  char: string,
  prev: string,
  next: string,
  counts: TypographyCounts,
): string | null {
  if (!isCjkLike(prev)) return null;

  switch (char) {
    case ",":
      counts.punctuation += 1;
      return "，";
    case ".":
      if (next === "." || prev === "…") return null; // 点串 / 已经转过的省号
      if (isAlnum(next) || next === "/" || next === "\\") return null; // 文件名、路径、域名
      counts.punctuation += 1;
      return "。";
    case ";":
      counts.punctuation += 1;
      return "；";
    case ":":
      if (next === "/" || next === ":") return null; // http:// 之类
      counts.punctuation += 1;
      return "：";
    case "!":
      counts.punctuation += 1;
      return "！";
    case "?":
      counts.punctuation += 1;
      return "？";
    default:
      return null;
  }
}

/**
 * 括号配对：返回「该换的字符下标 → 全角字符」。
 * 使用栈，只有配成对的括号才进表；只要有一侧贴着中文语境就整对换。
 */
function matchParentheses(chars: string[]): Map<number, string> {
  const convert = new Map<number, string>();
  const stack: number[] = [];

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    if (char === "(") {
      stack.push(index);
      continue;
    }
    if (char !== ")") continue;

    const open = stack.pop();
    if (open === undefined) continue; // 落单的右括号：不碰

    const before = open > 0 ? chars[open - 1] : "";
    const after = index + 1 < chars.length ? chars[index + 1] : "";
    if (isCjkLike(before) || isCjkLike(after)) {
      convert.set(open, "（");
      convert.set(index, "）");
    }
  }

  return convert; // 栈里剩下的左括号没人配对，自然不进表
}

/* ------------------------------ 主转换函数 ------------------------------ */

/**
 * 对一个文本节点的内容做排版整理。纯函数，可直接单测：
 *
 * ```ts
 * transformCjkText("中文English,2024年.").text  // "中文 English，2024 年。"
 * ```
 *
 * 不含任何中文的字符串原样返回（英文文章因此零开销、零改动）。
 */
export function transformCjkText(
  source: string,
  options: TypographyOptions = {},
): { text: string; counts: TypographyCounts } {
  const counts: TypographyCounts = { spaces: 0, punctuation: 0, parentheses: 0, ellipses: 0 };
  const spacing = options.spacing !== false;
  const punctuation = options.punctuation !== false;
  const parentheses = options.parentheses ?? punctuation;

  if (!spacing && !punctuation && !parentheses) return { text: source, counts };

  // 按码点切分：汉字扩展区是代理对，用 text[i] 会把它劈成两半
  const chars = Array.from(source);
  if (!chars.some(isCjkLike)) return { text: source, counts };

  const parens = parentheses ? matchParentheses(chars) : new Map<number, string>();
  const out: string[] = [];

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const prev = index > 0 ? chars[index - 1] : "";
    const next = index + 1 < chars.length ? chars[index + 1] : "";

    // 规则 3：省略号 —— 先于单点判断，把整串点一次吃掉（`....` 也只出一个 ……）
    if (punctuation && char === ".") {
      let run = 1;
      while (chars[index + run] === ".") run += 1;
      if (run >= 3) {
        const after = chars[index + run] ?? "";
        if (isCjkLike(prev) || isCjkLike(after)) {
          counts.ellipses += 1;
          out.push("……");
          index += run - 1;
          continue;
        }
      }
    }

    // 规则 4：成对括号（只换配对成功的）
    const swapped = parens.get(index);
    if (swapped !== undefined) {
      counts.parentheses += 1;
      out.push(swapped);
      continue;
    }

    // 规则 2：半角标点
    let emit = char;
    if (punctuation) {
      emit = convertPunctuation(char, prev, next, counts) ?? char;
    }

    // 规则 1：空隙 —— 看的是源文本里相邻的两个字符，不受上面替换的影响。
    // 之所以要求「紧挨着」，是为了尊重作者自己排的版（已经敲了空格/换行就不再动）。
    if (spacing && !isWhitespace(prev) && !isWhitespace(char)) {
      if ((isCjk(prev) && isAlnum(char)) || (isAlnum(prev) && isCjk(char))) {
        counts.spaces += 1;
        out.push(" ");
      }
    }

    out.push(emit);
  }

  return { text: out.join(""), counts };
}

/** 这段文字里有没有中文语境（没有就完全不需要处理） */
export function hasCjkContext(text: string): boolean {
  return Array.from(text).some(isCjkLike);
}

/* ------------------------------- remark 插件 ------------------------------- */

/** 只用到 mdast 的这两个字段，不引入 @types/mdast，免得插件升级时类型路径变动 */
interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
}

/**
 * remark 插件：逐个 text 节点做排版整理（改的是 node.value，节点结构不动）。
 *
 * 位置在 lib/markdown.ts 的管线里、`remarkCitations` 之前：
 * 引用角标 `[reference:1]` 这时候还只是普通文本，但它左边的字符是中文标点、
 * `:` 左边的字符是字母 `e`，所以规则 2 不会去动它（也有专门的注释在 markdown.ts 里）。
 */
export function remarkCjkTypography(options: TypographyOptions = {}) {
  return (tree: MdastNode): void => {
    const stats: TypographyStats = {
      texts: 0,
      spaces: 0,
      punctuation: 0,
      parentheses: 0,
      ellipses: 0,
    };

    const visit = (node: MdastNode): void => {
      if (node.type === "text" && typeof node.value === "string") {
        if (!hasCjkContext(node.value)) return;
        stats.texts += 1;

        const { text, counts } = transformCjkText(node.value, options);
        node.value = text;
        stats.spaces += counts.spaces;
        stats.punctuation += counts.punctuation;
        stats.parentheses += counts.parentheses;
        stats.ellipses += counts.ellipses;
        return;
      }

      const children = node.children;
      if (!children) return;
      for (const child of children) visit(child);
    };

    visit(tree);
    options.onStats?.(stats);
  };
}
