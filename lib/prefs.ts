/**
 * lib/prefs.ts —— 阅读偏好（第 7 项：设置中心）
 *
 * 五组：**正文字体 / 宽度 / 字号 / 行距 / 首行缩进**。落点是第 6 项就准备好的五个令牌
 * （app/globals.css 的 `:root`）：`--reading-font` / `--reading-measure` /
 * `--reading-size` / `--reading-leading` / `--reading-indent` —— 正文（.article-body）
 * 已经在读它们，所以设置中心不需要通知任何组件，改完 CSS 变量，页面上已经渲染的
 * 文字立刻跟着变。
 *
 * 五组分两类，区别只在「读者选的是什么」：
 *   - **选项组**（`font` / `indent`）：选的是**档位**，存的是档位 id（sans / on…）。
 *     想挪某一档的量（比如把「宋体」那一档的字体栈改掉）不会碰到读者存下的东西；
 *   - **滑块组**（`width` / `size` / `leading`）：选的是**数字**，存的就是数字
 *     （rem 值 / 无单位的倍数），能拖到的两端写在下面的 READING_SLIDERS 里。
 *
 * 「首行缩进」是唯一一个**开关**（只有「关 / 开」两档），所以它看起来和别的组不一样 ——
 * 这是有意的，缩进本就是一件「要或不要」的事。
 *
 * 「字体」那一组与另外几组有两处不一样，都写在 READING_FONTS 上头：换的是字体族不是数值，
 * 而且第五档「自定义」默认藏着（要站长先放字体文件）。
 *
 * 三个设计决定：
 *   1. **写进 CSS 变量的永远是最终值**（`44rem` / `1.1rem` / `1.85`），不是档位 id 或
 *      「第几档」—— 令牌那一层不认识「narrow」「normal」这种词；
 *   2. **写到 `<html>` 的行内样式上**（不是 stylesheet）：行内样式一定赢过 `:root` 的规则，
 *      不用给三套外观各写一份、也不用跟 CSS 层叠较劲。**没拖过滑块就不写**：宽度 / 字号 /
 *      行距的默认值在 app/globals.css 里由媒体查询按屏幕大小给（屏幕越大越宽、字号越大），
 *      存的是空串，于是行内变量不存在、CSS 的默认值说了算 —— 换台设备、转个屏自动跟着变。
 *      「恢复默认」也是把行内变量**移除**（不是设回某个值），同一个道理；
 *   3. 与 lib/theme.ts 同构：一份首帧内联脚本（`READING_INIT_SCRIPT`）+ 一套浏览器端 API。
 *      脚本从上面的表**生成**（JSON.stringify），不手抄一份，避免两边漂移。
 *
 * 零依赖：服务端与浏览器都能 import（`Lang` 不从 lib/site.ts 引，文案跟着选项走，
 * 与 lib/theme.ts 的 THEME_LABELS 做法一致）。
 */

export interface ReadingOption {
  /** 存进 localStorage 的是这个 —— 档位标识符，改数值不动它 */
  id: string;
  /** 写进 CSS 变量的值 */
  value: string;
  zh: string;
  en: string;
}

export type ReadingOptionKey = "font" | "indent";
export type ReadingSliderKey = "width" | "size" | "leading";
export type ReadingKey = ReadingOptionKey | ReadingSliderKey;

/** 五组的顺序（设置中心里从上到下、脚本里遍历都用它） */
export const READING_KEYS: ReadingKey[] = ["font", "width", "size", "leading", "indent"];

/** 这一组是滑块还是档位？（渲染与归一化都要分这两条路） */
export function isSliderKey(key: ReadingKey): key is ReadingSliderKey {
  return key === "width" || key === "size" || key === "leading";
}

export interface ReadingSliderSpec {
  /** 拖到最左 / 最右写进 CSS 的值 */
  min: number;
  max: number;
  /** 拖动步长（浏览器按 min 对齐取值，所以 min + n×step 就是全部落点） */
  step: number;
  /** 拼在数字后面的单位（宽度与字号是 rem，行距是无单位倍数） */
  unit: string;
  /** 保留几位小数 */
  digits: number;
}

/**
 * 三个滑块的量程。**故意留得宽**：宽度 24rem ～ 72rem，字号 0.9rem（约 14px）～
 * 1.75rem（约 28px），行距 1.3 ～ 2.8 倍。读者改的是自己浏览器里的版面、只影响他自己，
 * 没必要替他守着「好看」的窄区间 —— 真拖到极端的读者，是他自己想要那样；
 * 而「恰好能用」的窄量程反而会让人拖不到想要的位置。
 *
 * 步长：宽度 1rem（它本来就是「一行放多少字」，1rem 已经是看得见的差别），
 * 字号 0.05rem（≈0.8px）、行距 0.05 —— 再细就只剩抖动了。
 *
 * ⚠️ 这三个 min / max 与 app/globals.css 里那几条媒体查询给的默认值必须落在同一套落点上
 * （默认值 = min + n×step），否则滑块一开始会显示在与令牌不一致的位置上。
 */
export const READING_SLIDERS: Record<ReadingSliderKey, ReadingSliderSpec> = {
  width: { min: 24, max: 72, step: 1, unit: "rem", digits: 0 },
  size: { min: 0.9, max: 1.75, step: 0.05, unit: "rem", digits: 2 },
  leading: { min: 1.3, max: 2.8, step: 0.05, unit: "", digits: 2 },
};

/**
 * 滑块的**首帧兜底**：服务端（以及挂载后的第一帧）不知道读者的屏幕多大，拿不到 CSS 里
 * 按媒体查询算出来的那个数，先用最小那一档渲染，挂载后再读真实令牌回填
 * （见 currentReadingNumbers）—— 与主题按钮先按默认外观渲染是同一个道理，
 * 不这么做 React 会报水合不一致。
 *
 * ⚠️ 三个数要与 app/globals.css 里**不带媒体查询**的那一档（手机）对得上。
 */
export const READING_SLIDER_BASE: Record<ReadingSliderKey, number> = {
  width: 34,
  size: 1,
  leading: 1.75,
};

/**
 * 正文段落的首行缩进（开关）。中文排版的惯例是每段首行空两格，
 * 但英文正文、或者满篇链接 / 代码的短段落缩进反而难读，所以做成读者自己说了算的一档。
 *
 * 值就是 `text-indent` 本身：**2em** 跟着正文字号走，中文下一个字约等于一个 em，
 * 所以「2em」正好是两格 —— 读者把字号调大，缩进跟着变大，比例不变（写 2rem 就死了）。
 * 关掉是 `0`，不是一个只把规则关掉的 class：与另外几组一样，落点只有一个 CSS 变量。
 */
export const READING_INDENTS: ReadingOption[] = [
  { id: "off", value: "0", zh: "关闭", en: "Off" },
  { id: "on", value: "2em", zh: "两格", en: "2 em" },
];

/**
 * 「自定义」那一档要不要摆出来。**默认 true** —— 这一档现在是**读者自己上传字体文件**
 * （lib/local-font.ts：文件在浏览器里读成 FontFace，存 IndexedDB，不上传服务器），
 * 不依赖站长准备任何文件，所以默认可用。
 *
 * 想藏起来就改成 false：这一档不再出现在按钮里。读者之前存过的 "local" 不会变成坏 id
 * （归一化读的仍是完整表，见下面的 readingOptions），只是按钮没了。
 */
export const CUSTOM_FONT_ENABLED = true;

/**
 * 正文字体（第 8 项）。前四档**全是设备上已有的字体** —— 这一站一个 webfont 都不发：
 * 选哪一档都发不出一个网络请求，离线与国内可用性不受影响。第五档「自定义」用的是
 * **读者自己上传的字体文件**（lib/local-font.ts，存在浏览器里），同样不走网络。
 *
 * 每档写的是完整字体栈，中文名在前、西文名在后（正文里中文占多数，西文名跟在后面兜数字
 * 与英文的观感）；栈尾**接回 @theme 里那三个 --font-* 令牌**，而不是把同一串名字再抄一遍 ——
 * 3 套栈的兜底顺序只有 app/globals.css 一份事实来源。
 *
 * 「自定义」那一档的栈头 "Text Local Upload" 是 lib/local-font.ts 注册上传字体时
 * **写死的族名** —— 两处是一对，改要一起改。读者还没传（或传的那份载入失败）就掉到
 * 系统黑体。这里**故意不接一个 url() 兜底字体**：没上传时若还去取某个文件，
 * 每次选中这一档都会白打一个 404。
 */
export const READING_FONTS: ReadingOption[] = [
  {
    id: "sans",
    value: "var(--font-sans)",
    zh: "黑体",
    en: "Sans",
  },
  {
    id: "song",
    value: '"Songti SC", "SimSun", var(--font-serif)',
    zh: "宋体",
    en: "Song",
  },
  {
    id: "kai",
    value: '"Kaiti SC", "KaiTi", "STKaiti", var(--font-serif)',
    zh: "楷体",
    en: "Kai",
  },
  {
    id: "mono",
    value: '"Sarasa Mono SC", "Noto Sans Mono CJK SC", var(--font-mono)',
    zh: "等宽",
    en: "Mono",
  },
  {
    id: "local",
    value: '"Text Local Upload", var(--font-sans)',
    zh: "自定义",
    en: "Custom",
  },
];

/** 只有选项组有档位表；滑块组的值是一段区间，写在 READING_SLIDERS 里 */
export const READING_GROUPS: Record<ReadingOptionKey, ReadingOption[]> = {
  font: READING_FONTS,
  indent: READING_INDENTS,
};

/**
 * 给界面用的一档列表：与 READING_GROUPS 只差「关掉的档不摆出来」。
 * 归一化（normalizeReadingValue）读的仍是完整的表 —— 把 CUSTOM_FONT_ENABLED 关回去时，
 * 读者存过的 "local" 不该变成一个坏 id，只是这一档不再出现在按钮里。
 */
export function readingOptions(key: ReadingOptionKey): ReadingOption[] {
  const options = READING_GROUPS[key];
  return key === "font" && !CUSTOM_FONT_ENABLED
    ? options.filter((option) => option.id !== "local")
    : options;
}

export interface ReadingPrefs {
  /** READING_FONTS 里的 id */
  font: string;
  /** 宽度的数字文本（rem 值，如 "44"）；"" = 没拖过滑块，用按屏幕算的默认值 */
  width: string;
  /** 字号的数字文本（rem 值，如 "1.10"）；"" = 同上 */
  size: string;
  /** 行距的数字文本（倍数，如 "1.85"）；"" = 同上 */
  leading: string;
  /** READING_INDENTS 里的 id（正文首行缩进开关） */
  indent: string;
}

/** 默认档：选项组是档位 id，滑块组是空串（= 交给 app/globals.css 按屏幕给） */
export const READING_DEFAULTS: ReadingPrefs = {
  font: "sans",
  width: "",
  size: "",
  leading: "",
  // 默认**开着**：中文博客的正文缩进是惯例，不想缩进的读者自己关掉
  indent: "on",
};

export const READING_STORAGE_KEYS: Record<ReadingKey, string> = {
  font: "tob:reading-font",
  width: "tob:reading-width",
  size: "tob:reading-size",
  leading: "tob:reading-leading",
  indent: "tob:reading-indent",
};

export const READING_VARS: Record<ReadingKey, string> = {
  font: "--reading-font",
  width: "--reading-measure",
  size: "--reading-size",
  leading: "--reading-leading",
  indent: "--reading-indent",
};

/** 偏好变了才派发（供第 12 项的文章页 / 首页第 8 栏之类需要响应的东西订阅） */
export const READING_EVENT = "tob:prefschange";

function findOption(key: ReadingOptionKey, id: unknown): ReadingOption | null {
  if (typeof id !== "string" || id === "") return null;
  return READING_GROUPS[key].find((option) => option.id === id) ?? null;
}

/** 滑块数字 → 存进 localStorage 的文本（`44` / `1.10` / `1.85`） */
export function readingNumberText(key: ReadingSliderKey, value: number): string {
  return value.toFixed(READING_SLIDERS[key].digits);
}

/** 滑块数字 → 显示用 / 写进 CSS 的文本（`44rem` / `1.10rem` / `1.85`） */
export function formatReadingNumber(key: ReadingSliderKey, value: number): string {
  const spec = READING_SLIDERS[key];
  return `${readingNumberText(key, value)}${spec.unit}`;
}

/** 滑块：数字文本 → 夹进量程、对齐步长的数字文本；认不出来就是 ""（= 交给 CSS 默认） */
function normalizeSlider(key: ReadingSliderKey, raw: unknown): string {
  if (typeof raw !== "string" || raw === "") return "";
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return "";
  const spec = READING_SLIDERS[key];
  const clamped = Math.min(spec.max, Math.max(spec.min, value));
  // 对齐步长：量程以后变窄了，读者存下的旧值也不会落在一根「半个格」的位置上
  const snapped = spec.min + Math.round((clamped - spec.min) / spec.step) * spec.step;
  return readingNumberText(key, snapped);
}

/**
 * 任何来路不明的值 → 归一化后的值（手改过 localStorage 也不至于弄坏版面）。
 * 选项组认不出就回落到默认档的 id；滑块认不出 / 没设过就是 ""（用屏幕默认）。
 */
export function normalizeReadingValue(key: ReadingKey, raw: unknown): string {
  if (isSliderKey(key)) return normalizeSlider(key, raw);
  const option = findOption(key, raw);
  return option ? option.id : READING_DEFAULTS[key];
}

/** 存下的值 → 写进 CSS 变量的最终值；"" 表示「这个变量别写」（CSS 的初值说了算） */
export function readingValue(key: ReadingKey, stored: string): string {
  if (isSliderKey(key)) {
    const value = Number.parseFloat(stored);
    return Number.isFinite(value) ? formatReadingNumber(key, value) : "";
  }
  const option = findOption(key, stored) ?? findOption(key, READING_DEFAULTS[key]);
  return option ? option.value : "";
}

/**
 * 三个滑块**当前生效**的数值：读 `<html>` 上那几个令牌算出来的实际值 ——
 * 读者拖过就是他拖到的数，没拖过就是 app/globals.css 里按屏幕算出来的默认值。
 * 滑块的起始位置、读数与「当前取值」那一行都用它，所以三者不会各说一套。
 *
 * 只能在浏览器里调（服务端拿不到媒体查询的结果，给首帧兜底值）。
 */
export function currentReadingNumbers(): Record<ReadingSliderKey, number> {
  const read = (key: ReadingSliderKey): number => {
    if (typeof document === "undefined") return READING_SLIDER_BASE[key];
    const raw = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(READING_VARS[key]);
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : READING_SLIDER_BASE[key];
  };
  return { width: read("width"), size: read("size"), leading: read("leading") };
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null; // 隐私模式下访问 localStorage 会抛
  }
}

/** 读读者存下来的偏好；没存过 / 存坏了都是默认值（滑块则是「没设过」） */
export function readReadingPrefs(): ReadingPrefs {
  const store = storage();
  const read = (key: ReadingKey): string => {
    let raw: string | null = null;
    try {
      raw = store ? store.getItem(READING_STORAGE_KEYS[key]) : null;
    } catch {
      raw = null;
    }
    return normalizeReadingValue(key, raw);
  };
  return {
    font: read("font"),
    width: read("width"),
    size: read("size"),
    leading: read("leading"),
    indent: read("indent"),
  };
}

/**
 * 存盘 + 写到 `<html>` 的行内变量。
 *
 * 空串 = 「没设过」：**删键、移除变量**，而不是存一个空串进去 —— 读的时候两者等价，
 * 但存着空串会让人以为「设过」，也会挡住 CSS 里按屏幕给的默认值。
 */
function persist(prefs: ReadingPrefs): void {
  const store = storage();
  const root = typeof document === "undefined" ? null : document.documentElement;

  for (const key of READING_KEYS) {
    const stored = prefs[key];
    try {
      if (stored) store?.setItem(READING_STORAGE_KEYS[key], stored);
      else store?.removeItem(READING_STORAGE_KEYS[key]);
    } catch {
      /* 写盘失败（隐私模式）：这次会话内仍然生效 */
    }

    if (!root) continue;
    const value = readingValue(key, stored);
    if (value) root.style.setProperty(READING_VARS[key], value);
    else root.style.removeProperty(READING_VARS[key]);
  }
}

/** 设置中心用：存下改动（可只给一项）+ 立即生效 + 派发事件；返回归一化后的完整偏好 */
export function setReadingPrefs(patch: Partial<ReadingPrefs>): ReadingPrefs {
  const current = readReadingPrefs();
  const normalized: ReadingPrefs = {
    font: normalizeReadingValue("font", patch.font ?? current.font),
    width: normalizeReadingValue("width", patch.width ?? current.width),
    size: normalizeReadingValue("size", patch.size ?? current.size),
    leading: normalizeReadingValue("leading", patch.leading ?? current.leading),
    indent: normalizeReadingValue("indent", patch.indent ?? current.indent),
  };

  persist(normalized);
  dispatchChange(normalized);
  return normalized;
}

/** 恢复默认：清掉存储键 + **移除**行内变量（让 globals.css 那边的默认值重新说了算） */
export function resetReadingPrefs(): ReadingPrefs {
  const store = storage();
  for (const key of READING_KEYS) {
    try {
      store?.removeItem(READING_STORAGE_KEYS[key]);
    } catch {
      /* 忽略 */
    }
    if (typeof document !== "undefined") {
      document.documentElement.style.removeProperty(READING_VARS[key]);
    }
  }
  dispatchChange(READING_DEFAULTS);
  return READING_DEFAULTS;
}

export interface ReadingChangeDetail {
  prefs: ReadingPrefs;
}

function dispatchChange(prefs: ReadingPrefs): void {
  if (typeof window === "undefined") return;
  const detail: ReadingChangeDetail = { prefs };
  window.dispatchEvent(new CustomEvent<ReadingChangeDetail>(READING_EVENT, { detail }));
}

/** 订阅偏好变化；返回解绑函数 */
export function subscribeReadingPrefs(listener: (prefs: ReadingPrefs) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<ReadingChangeDetail>).detail;
    listener(detail?.prefs ?? readReadingPrefs());
  };
  window.addEventListener(READING_EVENT, handler);
  return () => window.removeEventListener(READING_EVENT, handler);
}

/** 选项表 → { font: { sans: "var(--font-sans)", … }, indent: { … } }，给内联脚本用 */
function optionValues(): Record<string, Record<string, string>> {
  const map: Record<string, Record<string, string>> = {};
  for (const key of READING_KEYS) {
    if (isSliderKey(key)) continue;
    const values: Record<string, string> = {};
    for (const option of READING_GROUPS[key]) values[option.id] = option.value;
    map[key] = values;
  }
  return map;
}

/** 滑块组 → { width: "rem", size: "rem", leading: "" }，给内联脚本拼单位用 */
function sliderUnits(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of READING_KEYS) {
    if (isSliderKey(key)) map[key] = READING_SLIDERS[key].unit;
  }
  return map;
}

/**
 * 首帧内联脚本：必须在任何内容之前执行（components/PrefsInit.tsx 把它放在
 * body 的第二个元素，紧跟主题脚本）。不这么做的话，存了「窄 + 大字号 + 宽松」的读者
 * 会先看到一帧默认版面的文字，再跳到他的设置上（CLS 那种跳动，比闪白更烦人）。
 *
 * 它不做归一 —— 存的档位 id 不在表里、存的数字不像数字，就都不写这个变量
 * （CSS 的默认值兜底）。归一化只发生在写盘那一次（setReadingPrefs）。
 */
export const READING_INIT_SCRIPT = `(function(){try{
var KEYS=${JSON.stringify(READING_STORAGE_KEYS)};
var VARS=${JSON.stringify(READING_VARS)};
var OPTIONS=${JSON.stringify(optionValues())};
var UNITS=${JSON.stringify(sliderUnits())};
var root=document.documentElement;
for(var k in KEYS){
var stored=null;try{stored=localStorage.getItem(KEYS[k])}catch(e){}
if(!stored)continue;
var value="";
var table=OPTIONS[k];
if(table){value=table[stored]||""}
else{var n=parseFloat(stored);if(isFinite(n))value=n+(UNITS[k]||"")}
if(value)root.style.setProperty(VARS[k],value);
}
}catch(e){}})();`;
