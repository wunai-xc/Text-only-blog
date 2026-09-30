/**
 * lib/theme.ts —— 主题与设计令牌（第 6 项：设计系统）
 *
 * 三套外观（`Theme`）：**纸 paper（默认，护眼暖白）/ 亮 light（冷白）/ 暗 dark**。
 * 具体颜色不在这里，在 app/globals.css 的三套 `--c-*` 令牌里（那里是唯一事实来源）。
 * 这个文件只做四件事：
 *
 *   1. 定义「读者的选择」（`ThemeChoice` = system | paper | light | dark）与解析规则：
 *      `system` 在浅色系统下解析成「纸」，深色系统下解析成「暗」—— 也就是说
 *      「纸」是本站的浅色，而不是又一套需要读者手动挑的外观；
 *   2. 首帧内联脚本 `THEME_INIT_SCRIPT`：在 body 一开始就写好 `<html data-theme>`，
 *      暗色读者不会看到一闪的白底（FOUC）。这个文件零依赖，服务端/浏览器都能 import；
 *   3. 浏览器端 API：applyTheme / setThemeChoice / watchSystemTheme / subscribeTheme /
 *      readThemeTokens —— 第 7 项（设置中心）与第 12 项（文章图表）直接复用，
 *      别在组件里再写一遍 localStorage 与 data-theme 的读写；
 *   4. 给渲染器与构建期用的「颜色镜像」：`THEME_CHROME`（底色）与 `readThemeTokens()`。
 *
 * ⚠️ 三处必须同步改的地方（CSS 变量与 TS 值之间没有桥梁）：
 *   - `THEME_CHROME`：三套主题的底色，给 manifest.webmanifest 与 meta theme-color 用
 *     （构建期拿不到浏览器里的 CSS 变量）；改了 globals.css 的 `--c-canvas` 就一起改；
 *   - `THEME_INIT_SCRIPT` 与 `applyTheme()`：同一套判定逻辑的两种写法
 *     —— 一个必须内联、同步、无依赖，一个是给设置中心调用的 API。
 *     新增主题（比如「蓝图纸」）时两处都要改，否则首帧会闪或切换不生效；
 *   - `FALLBACK_TOKENS`：只在读不到 CSS 变量时兜底，值等于「纸」。
 */

export type Theme = "paper" | "light" | "dark";

/** 读者的选择：三套外观 + 「跟随系统」 */
export type ThemeChoice = Theme | "system";

/** 外观清单（顺序即设置中心里的显示顺序：默认的纸在最前） */
export const THEMES: Theme[] = ["paper", "light", "dark"];

export const THEME_CHOICES: ThemeChoice[] = ["system", "paper", "light", "dark"];

/** 没存过选择时的默认值：跟随系统（浅色系统 → 纸，深色系统 → 暗） */
export const DEFAULT_THEME_CHOICE: ThemeChoice = "system";

/** 没有 JS 或脚本还没跑时用的外观 —— 就是 `:root` 那一套「纸」 */
export const DEFAULT_THEME: Theme = "paper";

export const THEME_STORAGE_KEY = "tob:theme";

/** 主题真的变了才派发（同一套外观重复 apply 不派发） */
export const THEME_EVENT = "tob:themechange";

/** 设置中心（第 7 项）用的文案，中英各一份；`hint` 是一句话说明（也是中英各一份） */
export const THEME_LABELS: Record<
  ThemeChoice,
  { zh: string; en: string; hint: { zh: string; en: string } }
> = {
  system: {
    zh: "跟随系统",
    en: "System",
    hint: {
      zh: "系统是浅色时用「纸」，深色时用「暗」",
      en: "Paper on a light system, Dark on a dark one",
    },
  },
  paper: {
    zh: "纸（护眼）",
    en: "Paper",
    hint: {
      zh: "默认。暖白纸质底色，长文阅读用",
      en: "Default. Warm paper tone, made for long reads",
    },
  },
  light: {
    zh: "亮色",
    en: "Light",
    hint: {
      zh: "冷白底色，偏「屏幕上的文档」",
      en: "Cool white, closer to a document on screen",
    },
  },
  dark: {
    zh: "暗色",
    en: "Dark",
    hint: {
      zh: "夜间用；代码块本来就是深色，不会突变",
      en: "For night; code blocks are dark already, so nothing jumps",
    },
  },
};

/**
 * 外观预览色块的格数（设置中心与首页「外观切换」栏共用，第 7 / 9 项）：
 * `system` 用两格表示「浅色一套 / 深色一套」，其余三套各三格（底 / 字 / 重点）。
 * 色值写在 app/globals.css 的 `.theme-chip[data-chip="…"]` 里 —— 那是全站唯一允许
 * 写死颜色的地方（它预览的是另外两套外观，引用当前令牌就四套长得一样了）。
 */
export const THEME_CHIP_DOTS: Record<ThemeChoice, number> = {
  system: 2,
  paper: 3,
  light: 3,
  dark: 3,
};

/**
 * 三套主题的**底色**（与 globals.css 的 `--c-canvas` 一一对应）。
 * 只镜像这一个颜色：manifest 与 meta theme-color 必须在构建期就有值。
 */
export const THEME_CHROME: Record<Theme, string> = {
  paper: "#f1ece0",
  light: "#f4f6f6",
  dark: "#0e1416",
};

/** 渲染器（图表）需要的站点令牌；值就是从 CSS 变量读出来的字符串 */
export interface ThemeTokens {
  canvas: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  rule: string;
  ruleStrong: string;
  surface: string;
  surface2: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
  danger: string;
}

/** 令牌名 → CSS 变量名（与 app/globals.css 的「三套令牌」一节一一对应） */
const TOKEN_VARS: Record<keyof ThemeTokens, string> = {
  canvas: "--c-canvas",
  ink: "--c-ink",
  inkMuted: "--c-ink-muted",
  inkSubtle: "--c-ink-subtle",
  rule: "--c-rule",
  ruleStrong: "--c-rule-strong",
  surface: "--c-surface",
  surface2: "--c-surface-2",
  accent: "--c-accent",
  accentSoft: "--c-accent-soft",
  accentInk: "--c-accent-ink",
  danger: "--c-danger",
};

/** 读不到 CSS 变量时的兜底（值 = 「纸」；样式表正常加载时永远用不到） */
const FALLBACK_TOKENS: ThemeTokens = {
  canvas: "#f1ece0",
  ink: "#23201c",
  inkMuted: "#6a6255",
  inkSubtle: "#9a8f7c",
  rule: "#d9d3c3",
  ruleStrong: "#b8ae95",
  surface: "#faf7ee",
  surface2: "#e9e2d2",
  accent: "#8a6a3b",
  accentSoft: "#efe6d2",
  accentInk: "#fffaf0",
  danger: "#b23a2b",
};

export interface ThemeChangeDetail {
  theme: Theme;
  choice: ThemeChoice;
}

export function isTheme(value: unknown): value is Theme {
  return value === "paper" || value === "light" || value === "dark";
}

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "system" || isTheme(value);
}

/** 任何来路不明的值（旧版存的、手改的 localStorage）一律回落到默认选择 */
export function normalizeThemeChoice(value: unknown): ThemeChoice {
  return isThemeChoice(value) ? value : DEFAULT_THEME_CHOICE;
}

/** 选择 + 系统的深浅色 → 实际渲染的外观 */
export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): Theme {
  if (choice !== "system") return choice;
  return prefersDark ? "dark" : "paper";
}

export function isDarkTheme(theme: Theme): boolean {
  return theme === "dark";
}

/** 系统是否偏好深色（SSR 下没有 window，保守返回 false） */
function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

/** 读读者存下来的选择；隐私模式 / 未存过 → 默认值 */
export function readStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") return DEFAULT_THEME_CHOICE;
  try {
    return normalizeThemeChoice(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_CHOICE; // 隐私模式下 localStorage 会抛
  }
}

/** 当前实际外观：优先信任已经写在 <html data-theme> 上的值（首帧脚本写的） */
export function currentTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const attr = document.documentElement.dataset.theme;
  if (isTheme(attr)) return attr;
  return resolveTheme(readStoredTheme(), systemPrefersDark());
}

/** 当前「选择」（设置中心的高亮项从它取；?theme= 调试参数也算一次选择） */
export function currentThemeChoice(): ThemeChoice {
  if (typeof document === "undefined") return DEFAULT_THEME_CHOICE;
  const attr = document.documentElement.dataset.themeChoice;
  if (isThemeChoice(attr)) return attr;
  return readStoredTheme();
}

/** meta theme-color 跟着底色走（浏览器地址栏 / 状态栏的颜色） */
function syncChromeColor(theme: Theme): void {
  if (typeof document === "undefined") return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.removeAttribute("media"); // viewport 里那条不带 media，这里防御一下
  meta.setAttribute("content", THEME_CHROME[theme]);
}

/**
 * 把外观写到 <html> 上（data-theme / data-theme-choice / color-scheme / theme-color meta），
 * 并且**只有在真的换了外观时**派发 THEME_EVENT —— 图表等订阅者据此重绘，不做无用功。
 */
export function applyTheme(theme: Theme, choice: ThemeChoice = theme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const changed = root.dataset.theme !== theme;

  root.dataset.theme = theme;
  root.dataset.themeChoice = choice;
  // 让表单控件、滚动条、系统 UI 跟着走（比 CSS 里写 color-scheme 更即时）
  root.style.colorScheme = isDarkTheme(theme) ? "dark" : "light";
  syncChromeColor(theme);

  if (changed) {
    const detail: ThemeChangeDetail = { theme, choice };
    window.dispatchEvent(new CustomEvent<ThemeChangeDetail>(THEME_EVENT, { detail }));
  }
}

/** 设置中心（第 7 项）用这个：存下选择 + 立即生效 */
export function setThemeChoice(choice: ThemeChoice): void {
  const normalized = normalizeThemeChoice(choice);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
  } catch {
    /* 隐私模式：这次会话内生效，刷新丢失，可接受 */
  }
  applyTheme(resolveTheme(normalized, systemPrefersDark()), normalized);
}

/**
 * 跟随系统的深浅色变化（只在选择是 `system` 时重新解析）。
 * 由 components/ThemeSync.tsx 在客户端挂上；返回的函数用来解绑。
 */
export function watchSystemTheme(): () => void {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (!media) return () => {};

  const onChange = () => {
    if (currentThemeChoice() !== "system") return;
    applyTheme(resolveTheme("system", media.matches), "system");
  };

  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** 订阅「外观被换了」（系统切换、设置中心切换都算）；返回解绑函数 */
export function subscribeTheme(listener: (detail: ThemeChangeDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<ThemeChangeDetail>).detail;
    if (detail && isTheme(detail.theme)) listener(detail);
    else listener({ theme: currentTheme(), choice: currentThemeChoice() });
  };

  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}

/** 从 CSS 变量读当前外观的令牌（图表渲染器用；别在渲染器里写死颜色） */
export function readThemeTokens(): ThemeTokens {
  if (typeof document === "undefined" || typeof getComputedStyle !== "function") {
    return FALLBACK_TOKENS;
  }

  const style = getComputedStyle(document.documentElement);
  const tokens = { ...FALLBACK_TOKENS };

  for (const key of Object.keys(TOKEN_VARS) as Array<keyof ThemeTokens>) {
    const value = style.getPropertyValue(TOKEN_VARS[key]).trim();
    if (value) tokens[key] = value;
  }

  return tokens;
}

/**
 * 首帧内联脚本：写在 `<html>` 上，必须在任何内容之前执行（components/ThemeInit.tsx
 * 把它放在 body 的第一个子元素）。它和 applyTheme() 是同一套逻辑的「无依赖版本」。
 *
 * 另外它支持一个调试参数：`?theme=paper|light|dark` —— 不动 localStorage，只是把这一页
 * 按指定外观渲染，方便在第 7 项设置中心做出来之前逐个验收三套令牌。
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var d=document,r=d.documentElement;
var KEY=${JSON.stringify(THEME_STORAGE_KEY)};
var CHROME=${JSON.stringify(THEME_CHROME)};
var VALID=["system","paper","light","dark"];
function stored(){try{var v=localStorage.getItem(KEY);if(VALID.indexOf(v)>-1)return v}catch(e){}return ${JSON.stringify(DEFAULT_THEME_CHOICE)}}
function prefersDark(){return !!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)}
var override="";
try{override=new URLSearchParams(location.search).get("theme")||""}catch(e){}
if(VALID.indexOf(override)<0)override="";
var choice=override||stored();
var theme=choice==="system"?(prefersDark()?"dark":"paper"):choice;
r.setAttribute("data-theme",theme);
r.setAttribute("data-theme-choice",choice);
r.style.colorScheme=theme==="dark"?"dark":"light";
var meta=d.querySelector('meta[name="theme-color"]');
if(!meta){meta=d.createElement("meta");meta.setAttribute("name","theme-color");d.head.appendChild(meta)}
if(CHROME[theme])meta.setAttribute("content",CHROME[theme]);
}catch(e){}})();`;
