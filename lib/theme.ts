/**
 * lib/theme.ts —— 主题与设计令牌（第 6 项：设计系统）
 *
 * 外观（`Theme`）：**纸 paper（默认，护眼暖白）/ 亮 light（冷白）/ 暗 dark /
 * 蓝图纸 blueprint / 森林绿 forest / 夜幕暖光 ember / 高对比 contrast / 自定义 custom**。
 * 有固定调色板的七套，颜色不在这里，在 app/globals.css 的 `--c-*` 令牌里（唯一事实来源）；
 * `custom` 没有固定颜色 —— 读者在设置中心里挑一套预设当起点、再微调四个关键色，
 * 种子由本文件写成 `<html>` 上的行内变量，派生令牌在 globals.css 里由它们算出来。
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
 *   - `THEME_CHROME`：七套预设的底色，给 manifest.webmanifest 与 meta theme-color 用
 *     （构建期拿不到浏览器里的 CSS 变量）；改了 globals.css 的 `--c-canvas` 就一起改；
 *   - `THEME_INIT_SCRIPT` 与 `applyTheme()`：同一套判定逻辑的两种写法
 *     —— 一个必须内联、同步、无依赖，一个是给设置中心调用的 API。
 *     新增主题时两处都要改（脚本里那份 CHROME / VALID 已从常量 JSON 化，别手抄），
 *     否则首帧会闪或切换不生效；
 *   - `FALLBACK_TOKENS`：只在读不到 CSS 变量时兜底，值等于「纸」。
 */

export type Theme =
  | "paper"
  | "light"
  | "dark"
  | "blueprint"
  | "forest"
  | "ember"
  | "contrast"
  | "custom";

/** 有固定调色板的外观（`custom` 的颜色由读者自己定，不在这里） */
export type FixedTheme = Exclude<Theme, "custom">;

/** 读者的选择：所有外观 + 「跟随系统」 */
export type ThemeChoice = Theme | "system";

/** 读者的选择清单（顺序即设置中心与首页里的显示顺序：默认的「跟随系统」在最前） */
export const THEME_CHOICES: ThemeChoice[] = [
  "system",
  "paper",
  "light",
  "dark",
  "blueprint",
  "forest",
  "ember",
  "contrast",
  "custom",
];

/**
 * 顶栏那一颗「点一下切下一套」的按钮循环哪些外观：与 THEME_CHOICES 只差**去掉 `custom`**。
 * 自定义配色要先在设置中心里调出来，轮流切到它没有意义（切过去只是一套默认色）。
 */
export const THEME_CYCLE: ThemeChoice[] = THEME_CHOICES.filter((choice) => choice !== "custom");

/** 自定义配色可以「从哪一套开始」—— 有固定调色板的七套 */
export const PRESET_THEMES: FixedTheme[] = [
  "paper",
  "light",
  "dark",
  "blueprint",
  "forest",
  "ember",
  "contrast",
];

/** 深底外观（`color-scheme: dark` 那一档；`custom` 看读者存的 `dark`） */
const DARK_THEMES: FixedTheme[] = ["dark", "blueprint", "forest", "ember"];

/** 全部外观值（首帧脚本与 isTheme 共用一份，别在两处各写一份字符串数组） */
const THEMES: Theme[] = [...PRESET_THEMES, "custom"];

/** 没存过选择时的默认值：跟随系统（浅色系统 → 纸，深色系统 → 暗） */
export const DEFAULT_THEME_CHOICE: ThemeChoice = "system";

/** 没有 JS 或脚本还没跑时用的外观 —— 就是 `:root` 那一套「纸」 */
export const DEFAULT_THEME: Theme = "paper";

export const THEME_STORAGE_KEY = "tob:theme";

/** 自定义配色的存档键（与上面那个分开放：换回预设外观时读者的调色不该被抹掉） */
export const CUSTOM_THEME_STORAGE_KEY = "tob:theme-custom";

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
  blueprint: {
    zh: "蓝图纸",
    en: "Blueprint",
    hint: {
      zh: "深蓝底 + 浅色线，工程蓝图的调子",
      en: "Deep blue with pale lines — the drafting-table look",
    },
  },
  forest: {
    zh: "森林绿",
    en: "Forest",
    hint: {
      zh: "低饱和墨绿底 + 米白字，安静、耐看",
      en: "Desaturated deep green with cream text; quiet and easy",
    },
  },
  ember: {
    zh: "夜幕暖光",
    en: "Ember",
    hint: {
      zh: "深棕底 + 暖橙重点，比纯黑更柔和的夜间外观",
      en: "Warm dark brown with amber accents; softer than pure black",
    },
  },
  contrast: {
    zh: "高对比",
    en: "High contrast",
    hint: {
      zh: "纯黑白 + 高饱和链接，给强光环境或视力不便者",
      en: "Pure black and white with vivid links, for bright rooms or low vision",
    },
  },
  custom: {
    zh: "自定义配色",
    en: "Custom",
    hint: {
      zh: "先挑一套做起点，再微调底色 / 文字 / 重点色",
      en: "Start from a preset, then fine-tune background, text and accent",
    },
  },
};

/**
 * 外观预览色块的格数（设置中心与首页「外观切换」栏共用，第 7 / 9 项）：
 * `system` 用两格表示「浅色一套 / 深色一套」，其余各三格（底 / 字 / 重点）。
 * 色值写在 app/globals.css 的 `.theme-chip[data-chip="…"]` 里 —— 那是全站唯一允许
 * 写死颜色的地方（它预览的是一套尚未生效的外观，引用当前令牌就全都长得一样了）。
 */
export const THEME_CHIP_DOTS: Record<ThemeChoice, number> = {
  system: 2,
  paper: 3,
  light: 3,
  dark: 3,
  blueprint: 3,
  forest: 3,
  ember: 3,
  contrast: 3,
  custom: 3,
};

/**
 * 有固定调色板那七套的**底色**（与 globals.css 的 `--c-canvas` 一一对应）。
 * 只镜像这一个颜色：manifest 与 meta theme-color 必须在构建期就有值。
 * `custom` 不在这里 —— 它的底色是读者存的 `canvas`，运行时读（见 customChrome）。
 */
export const THEME_CHROME: Record<FixedTheme, string> = {
  paper: "#f1ece0",
  light: "#f4f6f6",
  dark: "#0e1416",
  blueprint: "#0f2740",
  forest: "#16241d",
  ember: "#1a1410",
  contrast: "#ffffff",
};

/* ============================================================
   自定义配色（`custom`）：预设方案 + 微调
   ------------------------------------------------------------
   读者的调色存成一个对象（CUSTOM_THEME_STORAGE_KEY）。做法与阅读偏好同构：
   存档里放的是**最终值**，运行时由 applyTheme 写成 `<html>` 上的行内变量；
   其余「面 / 线 / 弱字」由 app/globals.css 的 `[data-theme="custom"]` 那两块
   用 color-mix 从这几个种子推出来 —— 所以读者只挑几个关键色，整套仍然协调。

   只暴露**四个**色盘（底 / 字 / 重点 / 警示）+ 一个「从哪套预设开始」：
   暴露全部十二个令牌看着更自由，实际只会让读者调出读不清的配色。
   ============================================================ */

/** 四个可调色 + 起点 + 深浅。`accentInk`（重点色上的字）由 accent 自动推，读者不用管 */
export interface CustomTheme {
  /** 从哪一套预设开始（只用于高亮「起点」按钮，颜色本身已经落在下面几个字段里） */
  base: FixedTheme;
  /** 深底还是浅底：决定 color-scheme 与 CSS 里那两块派生令牌用哪一块 */
  dark: boolean;
  canvas: string;
  ink: string;
  accent: string;
  /** 重点色上的文字色（按钮 / 选中态）；随 accent 自动算，见 autoAccentInk */
  accentInk: string;
  danger: string;
}

/** 每套预设的「起点色」= 那一套的 --c-canvas / --c-ink / --c-accent / --c-danger 等 */
export const CUSTOM_PRESET_SEEDS: Record<FixedTheme, Omit<CustomTheme, "base">> = {
  paper: {
    dark: false,
    canvas: "#f1ece0",
    ink: "#23201c",
    accent: "#8a6a3b",
    accentInk: "#fffaf0",
    danger: "#b23a2b",
  },
  light: {
    dark: false,
    canvas: "#f4f6f6",
    ink: "#16201f",
    accent: "#1d4f63",
    accentInk: "#ffffff",
    danger: "#c0392b",
  },
  dark: {
    dark: true,
    canvas: "#0e1416",
    ink: "#e4ebe9",
    accent: "#7fc3da",
    accentInk: "#05262f",
    danger: "#ff8b7a",
  },
  blueprint: {
    dark: true,
    canvas: "#0f2740",
    ink: "#e8f0f7",
    accent: "#7fd4e6",
    accentInk: "#06283a",
    danger: "#ff9a8a",
  },
  forest: {
    dark: true,
    canvas: "#16241d",
    ink: "#e6efe7",
    accent: "#9ecfa8",
    accentInk: "#0d2417",
    danger: "#ff9a86",
  },
  ember: {
    dark: true,
    canvas: "#1a1410",
    ink: "#f0e6da",
    accent: "#e8a15c",
    accentInk: "#2a1808",
    danger: "#ff8f7a",
  },
  contrast: {
    dark: false,
    canvas: "#ffffff",
    ink: "#000000",
    accent: "#0000ee",
    accentInk: "#ffffff",
    danger: "#cc0000",
  },
};

/** 没调过时的自定义配色 = 以「纸」为起点 */
export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  base: "paper",
  ...CUSTOM_PRESET_SEEDS.paper,
};

/** 十六进制色值（#rgb / #rrggbb）—— 只认这一种，色盘给的就是它 */
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

/** #rgb → #rrggbb（统一成六位，color-mix 与 <input type="color"> 都要六位） */
function expandHex(hex: string): string {
  const value = hex.trim().toLowerCase();
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
}

/**
 * 重点色上的文字该用深色还是浅色：按 sRGB 相对亮度选，保证按钮上那行字看得清。
 * 读者换了 accent 就跟着重算 —— 所以界面上不需要再摆第五个色盘。
 */
export function autoAccentInk(accent: string): string {
  const hex = expandHex(accent);
  const channel = (offset: number) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.4 ? "#0b0f10" : "#ffffff";
}

/** 以某套预设为起点（换起点时把四个可调色一起换掉；读者之后的微调会再覆盖） */
export function customThemeFromPreset(base: FixedTheme): CustomTheme {
  return { base, ...CUSTOM_PRESET_SEEDS[base] };
}

/** 任何来路不明的存档 → 一份能用的自定义配色（缺项用「纸」的起点补齐） */
export function normalizeCustomTheme(value: unknown): CustomTheme {
  if (!value || typeof value !== "object") return DEFAULT_CUSTOM_THEME;
  const raw = value as Partial<CustomTheme>;
  const base = PRESET_THEMES.includes(raw.base as FixedTheme)
    ? (raw.base as FixedTheme)
    : DEFAULT_CUSTOM_THEME.base;
  const seeds = CUSTOM_PRESET_SEEDS[base];
  const pick = (candidate: unknown, fallback: string) =>
    isHexColor(candidate) ? expandHex(candidate) : fallback;
  return {
    base,
    dark: typeof raw.dark === "boolean" ? raw.dark : seeds.dark,
    canvas: pick(raw.canvas, seeds.canvas),
    ink: pick(raw.ink, seeds.ink),
    accent: pick(raw.accent, seeds.accent),
    accentInk: pick(raw.accentInk, seeds.accentInk),
    danger: pick(raw.danger, seeds.danger),
  };
}

/** 读读者存的配色（隐私模式 / 没存过 → 默认「纸」起点） */
export function readCustomTheme(): CustomTheme {
  if (typeof window === "undefined") return DEFAULT_CUSTOM_THEME;
  try {
    const raw = window.localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    return raw ? normalizeCustomTheme(JSON.parse(raw)) : DEFAULT_CUSTOM_THEME;
  } catch {
    return DEFAULT_CUSTOM_THEME; // 隐私模式会抛，存档坏了也走这条
  }
}

/**
 * 写自定义配色：与当前存档合并后落盘，并且**如果当前外观就是 `custom`** 立刻重画。
 * 换 accent 时顺带重算 accentInk（除非调用方自己指定了）—— 界面上只有四个色盘，
 * 第五个值不该让读者去管。
 */
export function setCustomTheme(patch: Partial<CustomTheme>): CustomTheme {
  const next = normalizeCustomTheme({ ...readCustomTheme(), ...patch });
  if (patch.accent !== undefined && patch.accentInk === undefined) {
    next.accentInk = autoAccentInk(next.accent);
  }
  try {
    window.localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* 隐私模式：这次会话内生效，刷新丢失 */
  }
  if (currentThemeChoice() === "custom") applyTheme("custom", "custom");
  return next;
}

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
  return typeof value === "string" && (THEMES as string[]).includes(value);
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

/**
 * 是不是深底外观。`custom` 的深浅由读者存的那一位决定 —— 首帧脚本 / applyTheme
 * 把它写在 `<html data-custom-dark>`，这里读回来（存档要在服务端读不到，不能靠它）。
 */
export function isDarkTheme(theme: Theme): boolean {
  if (theme === "custom") {
    if (typeof document === "undefined") return false;
    return document.documentElement.dataset.customDark === "true";
  }
  return DARK_THEMES.includes(theme);
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

/**
 * 自定义配色的**种子变量名**：app/globals.css 的 `[data-theme="custom"]` 就是读这几个
 * 推出来的。名字与首帧脚本里那份必须一致（改要一起改）。
 */
const CUSTOM_SEED_VARS: Array<[keyof CustomTheme, string]> = [
  ["canvas", "--seed-canvas"],
  ["ink", "--seed-ink"],
  ["accent", "--seed-accent"],
  ["accentInk", "--seed-accent-ink"],
  ["danger", "--seed-danger"],
];

/**
 * 把自定义配色写成 `<html>` 上的行内变量 + `data-custom-dark`。
 * 变量写在 html 上而不是某个 class 里，是为了让**已经渲染的内容**立刻跟着变
 * （与阅读偏好同一套做法，见 lib/prefs.ts）。
 */
function writeCustomSeeds(root: HTMLElement, config: CustomTheme): void {
  for (const [key, cssVar] of CUSTOM_SEED_VARS) {
    root.style.setProperty(cssVar, config[key] as string);
  }
  root.dataset.customDark = config.dark ? "true" : "false";
}

/** 当前外观的底色：预设查表，`custom` 读读者的 canvas（地址栏 / 状态栏用） */
function chromeColor(theme: Theme, config: CustomTheme): string {
  return theme === "custom" ? config.canvas : THEME_CHROME[theme];
}

/** meta theme-color 跟着底色走（浏览器地址栏 / 状态栏的颜色） */
function syncChromeColor(color: string): void {
  if (typeof document === "undefined") return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.removeAttribute("media"); // viewport 里那条不带 media，这里防御一下
  meta.setAttribute("content", color);
}

/**
 * 把外观写到 <html> 上（data-theme / data-theme-choice / color-scheme / theme-color meta，
 * `custom` 还要写那几个种子变量），并且**只有在真的换了外观时**派发 THEME_EVENT ——
 * 图表等订阅者据此重绘，不做无用功。
 */
export function applyTheme(theme: Theme, choice: ThemeChoice = theme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const changed = root.dataset.theme !== theme;

  // custom 的种子要在算深浅之前写好：isDarkTheme("custom") 读的是 data-custom-dark
  const config = theme === "custom" ? readCustomTheme() : DEFAULT_CUSTOM_THEME;
  if (theme === "custom") writeCustomSeeds(root, config);

  root.dataset.theme = theme;
  root.dataset.themeChoice = choice;
  // 让表单控件、滚动条、系统 UI 跟着走（比 CSS 里写 color-scheme 更即时）
  root.style.colorScheme = isDarkTheme(theme) ? "dark" : "light";
  syncChromeColor(chromeColor(theme, config));

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
 * 把它放在 body 的第一个子元素）。它和 applyTheme() 是同一套逻辑的「无依赖版本」——
 * 所以 CHROME / DARKSET / 种子变量名这三样都从上面的常量 JSON 化进来，别在这里手抄。
 *
 * `custom` 那一路：读自定义配色的存档，把种子写成行内变量（与 writeCustomSeeds 一致），
 * 这样读者的自定义外观也是**首帧就到位**、不会先闪一下「纸」。
 *
 * 另外它支持一个调试参数：`?theme=<外观 id>` —— 不动 localStorage，只是把这一页
 * 按指定外观渲染，方便逐个验收各套令牌（含 `?theme=custom`）。
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var d=document,r=d.documentElement;
var KEY=${JSON.stringify(THEME_STORAGE_KEY)};
var CKEY=${JSON.stringify(CUSTOM_THEME_STORAGE_KEY)};
var VALID=${JSON.stringify([...THEME_CHOICES])};
var CHROME=${JSON.stringify(THEME_CHROME)};
var DARKSET=${JSON.stringify(DARK_THEMES)};
var SEEDS=${JSON.stringify(CUSTOM_SEED_VARS.map(([key, cssVar]) => [key, cssVar]))};
function stored(){try{var v=localStorage.getItem(KEY);if(VALID.indexOf(v)>-1)return v}catch(e){}return ${JSON.stringify(DEFAULT_THEME_CHOICE)}}
function custom(){try{var c=JSON.parse(localStorage.getItem(CKEY));if(c&&typeof c==="object")return c}catch(e){}return null}
function prefersDark(){return !!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)}
var override="";
try{override=new URLSearchParams(location.search).get("theme")||""}catch(e){}
if(VALID.indexOf(override)<0)override="";
var choice=override||stored();
var theme=choice==="system"?(prefersDark()?"dark":"paper"):choice;
var chrome=CHROME[theme];
var dark=DARKSET.indexOf(theme)>-1;
if(theme==="custom"){
var c=custom();
if(c){
for(var i=0;i<SEEDS.length;i++){var v=c[SEEDS[i][0]];if(typeof v==="string"&&v)r.style.setProperty(SEEDS[i][1],v)}
if(typeof c.canvas==="string"&&c.canvas)chrome=c.canvas;
}
dark=!!(c&&c.dark===true);
r.setAttribute("data-custom-dark",dark?"true":"false");
}
r.setAttribute("data-theme",theme);
r.setAttribute("data-theme-choice",choice);
r.style.colorScheme=dark?"dark":"light";
var meta=d.querySelector('meta[name="theme-color"]');
if(!meta){meta=d.createElement("meta");meta.setAttribute("name","theme-color");d.head.appendChild(meta)}
if(chrome)meta.setAttribute("content",chrome);
}catch(e){}})();`;
