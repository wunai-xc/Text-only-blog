/**
 * lib/prefs.ts —— 阅读偏好（第 7 项：设置中心）
 *
 * 四组选项：**正文字体 / 宽度 / 字号 / 行距**。落点是第 6 项就准备好的四个令牌
 * （app/globals.css 的 `:root`）：`--reading-font` / `--reading-measure` / `--reading-size` /
 * `--reading-leading` —— 正文（.article-body）已经在读它们，所以设置中心不需要通知任何组件，
 * 改完 CSS 变量，页面上已经渲染的文字立刻跟着变。
 *
 * 「字体」那一组与另外三组有两处不一样，都写在 READING_FONTS 上头：换的是字体族不是数值，
 * 而且第五档「自定义」默认藏着（要站长先放字体文件）。
 *
 * 三个设计决定：
 *   1. **存的是档位 id（narrow / normal / wide…），不是 rem 值。** 以后想把「宽」从
 *      52rem 调到 56rem，只改这里一行，读者已存的偏好不用迁移，也不会有人还停在旧值上；
 *   2. **写到 `<html>` 的行内样式上**（不是 stylesheet）：行内样式一定赢过 `:root` 的规则，
 *      不用给三套外观各写一份、也不用跟 CSS 层叠较劲。「恢复默认」是把行内变量
 *      **移除**（不是设回默认值），这样 CSS 里的初值重新说了算；
 *   3. 与 lib/theme.ts 同构：一份首帧内联脚本（`READING_INIT_SCRIPT`）+ 一套浏览器端 API。
 *      脚本从上面的选项表**生成**（JSON.stringify），不手抄一份，避免两边漂移。
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

export type ReadingKey = "font" | "width" | "size" | "leading";

/** 四组的顺序（设置中心里从上到下、脚本里遍历都用它） */
export const READING_KEYS: ReadingKey[] = ["font", "width", "size", "leading"];

export const READING_WIDTHS: ReadingOption[] = [
  { id: "narrow", value: "34rem", zh: "窄", en: "Narrow" },
  { id: "normal", value: "42rem", zh: "适中", en: "Normal" },
  { id: "wide", value: "52rem", zh: "宽", en: "Wide" },
];

export const READING_SIZES: ReadingOption[] = [
  { id: "small", value: "0.98rem", zh: "小", en: "Small" },
  { id: "normal", value: "1.0625rem", zh: "中", en: "Normal" },
  { id: "large", value: "1.18rem", zh: "大", en: "Large" },
];

export const READING_LEADINGS: ReadingOption[] = [
  { id: "tight", value: "1.6", zh: "紧凑", en: "Tight" },
  { id: "normal", value: "1.85", zh: "适中", en: "Normal" },
  { id: "loose", value: "2.1", zh: "宽松", en: "Loose" },
];

/**
 * 「自定义」那一档要不要摆出来。**默认 false** —— 放字体文件是站长的活，
 * 文件还没放就把这一档摆出来，读者选中它只会落回黑体，白高兴一场（还多一个 404）。
 *
 * 怎么打开：把一份 woff2 放到 `public/fonts/custom.woff2`，再把这里改成 true。
 * 字体族名两边是**写死配对**的 —— 这一档的值是 `"Text Local", …`，
 * 对应的 @font-face 在 app/globals.css 的「1. 字体」一节（它用 `local()` 打头：
 * 读者机器上真装了这个名字的字体就直接用本地的，一个字节都不下载）。
 */
export const LOCAL_FONT_READY = false;

/**
 * 正文字体（第 8 项）。四档预设**全部是设备上已有的字体** —— 这一站到现在一个 webfont
 * 都没有，字体切换不该开这个口子：选哪一档都发不出一个网络请求，离线与国内可用性不受影响。
 *
 * 每档写的是完整字体栈，中文名在前、西文名在后（正文里中文占多数，西文名跟在后面兜数字
 * 与英文的观感）；栈尾**接回 @theme 里那三个 --font-* 令牌**，而不是把同一串名字再抄一遍 ——
 * 3 套栈的兜底顺序只有 app/globals.css 一份事实来源。
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
    value: '"Text Local", var(--font-sans)',
    zh: "自定义",
    en: "Custom",
  },
];

export const READING_GROUPS: Record<ReadingKey, ReadingOption[]> = {
  font: READING_FONTS,
  width: READING_WIDTHS,
  size: READING_SIZES,
  leading: READING_LEADINGS,
};

/**
 * 给界面用的一档列表：与 READING_GROUPS 只差「还没准备好的档不摆出来」。
 * 归一化（normalizeReadingId）读的仍是完整的表 —— 站长把 LOCAL_FONT_READY 关回去时，
 * 读者存过的 "local" 不该变成一个坏 id，只是这一档不再出现在按钮里。
 */
export function readingOptions(key: ReadingKey): ReadingOption[] {
  const options = READING_GROUPS[key];
  return key === "font" && !LOCAL_FONT_READY
    ? options.filter((option) => option.id !== "local")
    : options;
}

export interface ReadingPrefs {
  /** READING_FONTS 里的 id */
  font: string;
  /** READING_WIDTHS 里的 id */
  width: string;
  /** READING_SIZES 里的 id */
  size: string;
  /** READING_LEADINGS 里的 id */
  leading: string;
}

/** 默认档：与 app/globals.css 的 `:root` 四个 --reading-* 初值一一对应 */
export const READING_DEFAULTS: ReadingPrefs = {
  font: "sans",
  width: "normal",
  size: "normal",
  leading: "normal",
};

export const READING_STORAGE_KEYS: Record<ReadingKey, string> = {
  font: "tob:reading-font",
  width: "tob:reading-width",
  size: "tob:reading-size",
  leading: "tob:reading-leading",
};

export const READING_VARS: Record<ReadingKey, string> = {
  font: "--reading-font",
  width: "--reading-measure",
  size: "--reading-size",
  leading: "--reading-leading",
};

/** 偏好变了才派发（供第 12 项的文章页 / 阅读进度之类需要响应的东西订阅） */
export const READING_EVENT = "tob:prefschange";

function findOption(key: ReadingKey, id: unknown): ReadingOption | null {
  if (typeof id !== "string" || id === "") return null;
  return READING_GROUPS[key].find((option) => option.id === id) ?? null;
}

/** 档位 id → CSS 变量值；不认识的 id 回落到默认档（手改过 localStorage 也不至于弄坏版面） */
export function readingValue(key: ReadingKey, id: string): string {
  const option = findOption(key, id) ?? findOption(key, READING_DEFAULTS[key]);
  return option ? option.value : "";
}

/** 任何来路不明的 id → 默认档 id */
export function normalizeReadingId(key: ReadingKey, id: unknown): string {
  const option = findOption(key, id);
  return option ? option.id : READING_DEFAULTS[key];
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null; // 隐私模式下访问 localStorage 会抛
  }
}

/** 读读者存下来的三档偏好；没存过 / 存坏了都是默认档 */
export function readReadingPrefs(): ReadingPrefs {
  const store = storage();
  const read = (key: ReadingKey): string => {
    let raw: string | null = null;
    try {
      raw = store ? store.getItem(READING_STORAGE_KEYS[key]) : null;
    } catch {
      raw = null;
    }
    return normalizeReadingId(key, raw);
  };
  return { font: read("font"), width: read("width"), size: read("size"), leading: read("leading") };
}

function writeVars(prefs: ReadingPrefs, root: HTMLElement): void {
  for (const key of READING_KEYS) {
    const value = readingValue(key, prefs[key]);
    if (value) root.style.setProperty(READING_VARS[key], value);
  }
}

/** 设置中心用：存下改动（可只给一项）+ 立即生效 + 派发事件；返回归一化后的完整偏好 */
export function setReadingPrefs(patch: Partial<ReadingPrefs>): ReadingPrefs {
  const current = readReadingPrefs();
  const normalized: ReadingPrefs = {
    font: normalizeReadingId("font", patch.font ?? current.font),
    width: normalizeReadingId("width", patch.width ?? current.width),
    size: normalizeReadingId("size", patch.size ?? current.size),
    leading: normalizeReadingId("leading", patch.leading ?? current.leading),
  };

  const store = storage();
  for (const key of READING_KEYS) {
    try {
      store?.setItem(READING_STORAGE_KEYS[key], normalized[key]);
    } catch {
      /* 写盘失败（隐私模式）：这次会话内仍然生效 */
    }
  }

  if (typeof document !== "undefined") writeVars(normalized, document.documentElement);
  dispatchChange(normalized);
  return normalized;
}

/** 恢复默认：清掉存储键 + **移除**行内变量（让 globals.css 的初值重新说了算） */
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

/** 档位表 → { width: { narrow: "34rem", … }, … }，给内联脚本用 */
function optionValues(): Record<string, Record<string, string>> {
  const map: Record<string, Record<string, string>> = {};
  for (const key of READING_KEYS) {
    const values: Record<string, string> = {};
    for (const option of READING_GROUPS[key]) values[option.id] = option.value;
    map[key] = values;
  }
  return map;
}

/**
 * 首帧内联脚本：必须在任何内容之前执行（components/PrefsInit.tsx 把它放在
 * body 的第二个元素，紧跟主题脚本）。不这么做的话，存了「窄 + 大字号 + 宽松」的读者
 * 会先看到一帧默认版面的文字，再跳到他的设置上（CLS 那种跳动，比闪白更烦人）。
 *
 * 它不做归一——存的 id 不在表里就不写这个变量（CSS 初值兜底）。
 */
export const READING_INIT_SCRIPT = `(function(){try{
var KEYS=${JSON.stringify(READING_STORAGE_KEYS)};
var VARS=${JSON.stringify(READING_VARS)};
var VALUES=${JSON.stringify(optionValues())};
var root=document.documentElement;
for(var k in KEYS){
var id=null;try{id=localStorage.getItem(KEYS[k])}catch(e){}
var table=VALUES[k];
var value=id&&table?table[id]:"";
if(value)root.style.setProperty(VARS[k],value);
}
}catch(e){}})();`;
