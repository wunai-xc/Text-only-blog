"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react/offline";

import LangSwitcher from "./LangSwitcher";
import { icons, type IconName } from "@/lib/icons";
import { SITE, type Lang } from "@/lib/site";
import {
  CUSTOM_FONT_ENABLED,
  READING_DEFAULTS,
  READING_KEYS,
  READING_VARS,
  readingOptions,
  readingValue,
  readReadingPrefs,
  resetReadingPrefs,
  setReadingPrefs,
  type ReadingKey,
  type ReadingPrefs,
} from "@/lib/prefs";
import {
  LocalFontError,
  deleteLocalFont,
  formatFontSize,
  readLocalFontMeta,
  saveLocalFont,
  subscribeLocalFont,
  type LocalFontErrorCode,
  type LocalFontMeta,
} from "@/lib/local-font";
import {
  DEFAULT_THEME_CHOICE,
  THEME_CHIP_DOTS,
  THEME_CHOICES,
  THEME_LABELS,
  currentThemeChoice,
  setThemeChoice,
  subscribeTheme,
  type ThemeChoice,
} from "@/lib/theme";

/**
 * 设置中心（第 7 项）
 *
 * 四块内容，全部只影响**读者自己的浏览器**（localStorage），站点是纯静态的，
 * 这些偏好与内容无关、也不上传：
 *   1. 外观：跟随系统 / 纸 / 亮 / 暗 —— 直接调 lib/theme.ts 的 setThemeChoice()，
 *      不在这里碰 localStorage 与 data-theme（约定第 7 条）；
 *   2. 阅读偏好：正文字体 / 宽度 / 字号 / 行距 / 首行缩进 —— 写到 `--reading-*` 令牌上
 *      （lib/prefs.ts），正文已经在读它们，所以改完立刻生效、不需要通知任何组件；
 *   3. 语言：中英切换（与页脚的导航栏共用 components/LangSwitcher.tsx）；
 *   4. 恢复默认：清掉偏好键 + 移除行内 CSS 变量。
 *
 * 首帧与主题按钮同理：先按默认值渲染（服务端与浏览器算出来的一样），挂载后再读真实值，
 * 否则 React 会报水合不一致。
 *
 * 这个组件只负责**内容**，不管容器：抽屉在 components/SettingsDock.tsx，
 * 第 13 项的 /[lang]/settings/ 页面直接把它放进一个 .page 里即可，样式是同一套。
 */

type ReadingLabelKey =
  | "readingFont"
  | "readingWidth"
  | "readingSize"
  | "readingLeading"
  | "readingIndent";

/** 各组的标签与图标：标签文案在 lib/site.ts 的 I18N 里，图标在这里。
    「首行缩进」是唯一的两档开关（关 / 两格），其余四组都是三档。 */
const GROUP_META: Record<ReadingKey, { label: ReadingLabelKey; icon: IconName }> = {
  font: { label: "readingFont", icon: "mdi:format-font" },
  width: { label: "readingWidth", icon: "mdi:arrow-expand-horizontal" },
  size: { label: "readingSize", icon: "mdi:format-size" },
  leading: { label: "readingLeading", icon: "mdi:format-line-spacing" },
  indent: { label: "readingIndent", icon: "mdi:format-indent-increase" },
};

/* 外观预览色块的格数共用 lib/theme.ts 的 THEME_CHIP_DOTS（第 9 项起首页也用这一份） */

export default function SettingsCenter({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const [choice, setChoice] = useState<ThemeChoice | null>(null);
  const [prefs, setPrefs] = useState<ReadingPrefs | null>(null);
  // 读者上传的自定义字体（lib/local-font.ts）：元信息、正在读写、上一次的错误
  const [localFont, setLocalFont] = useState<LocalFontMeta | null>(null);
  const [fontBusy, setFontBusy] = useState(false);
  const [fontError, setFontError] = useState<LocalFontErrorCode | null>(null);

  useEffect(() => {
    setChoice(currentThemeChoice());
    setPrefs(readReadingPrefs());
    const unsubscribeTheme = subscribeTheme(() => setChoice(currentThemeChoice()));
    const unsubscribeFont = subscribeLocalFont((meta) => setLocalFont(meta));

    // 已经有哪一份字体（只读元信息；注册 FontFace 的活归 components/LocalFontSync.tsx）
    let alive = true;
    void readLocalFontMeta().then((meta) => {
      if (alive) setLocalFont(meta);
    });

    return () => {
      alive = false;
      unsubscribeTheme();
      unsubscribeFont();
    };
  }, []);

  const activeChoice = choice ?? DEFAULT_THEME_CHOICE;
  const activePrefs = prefs ?? READING_DEFAULTS;

  function pickTheme(value: ThemeChoice) {
    setThemeChoice(value);
    setChoice(value);
  }

  function pickReading(key: ReadingKey, id: string) {
    // 只给变的那一项：先落到 Partial<ReadingPrefs>（计算键写成 as 断言不够明确）
    const patch: Partial<ReadingPrefs> = {};
    patch[key] = id;
    setPrefs(setReadingPrefs(patch));
  }

  /** 上传失败的原因 → 对应文案（lib/local-font.ts 只给代号，文案在 lib/site.ts） */
  function fontErrorText(code: LocalFontErrorCode): string {
    if (code === "type") return t.localFontErrType;
    if (code === "size") return t.localFontErrSize;
    if (code === "store") return t.localFontErrStore;
    return t.localFontErrRead;
  }

  async function onPickFontFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setFontBusy(true);
    setFontError(null);
    try {
      setLocalFont(await saveLocalFont(file));
      // 传完直接切到「自定义」那一档：读者刚做的事就是想用它
      setPrefs(setReadingPrefs({ font: "local" }));
    } catch (error) {
      setFontError(error instanceof LocalFontError ? error.code : "read");
    } finally {
      setFontBusy(false);
      // 清空要放在**读完之后**：先清空会把这份 File 一起废掉（size 变 0），
      // 清空是为了让读者连着选同一个文件也能再次触发 change
      input.value = "";
    }
  }

  async function onRemoveFont() {
    setFontBusy(true);
    setFontError(null);
    try {
      await deleteLocalFont();
      setLocalFont(null);
      // 这一档已经没有字体可用了，退回默认黑体，免得界面停在「自定义」而实际是黑体
      setPrefs(setReadingPrefs({ font: READING_DEFAULTS.font }));
    } finally {
      setFontBusy(false);
    }
  }

  function resetAll() {
    resetReadingPrefs();
    setThemeChoice(DEFAULT_THEME_CHOICE);
    setPrefs(READING_DEFAULTS);
    setChoice(DEFAULT_THEME_CHOICE);
  }

  // 把当前各令牌的**实际取值**显示出来：调完能立刻看到 rem / 倍率 / 字体栈变成了什么
  const tokenLine = READING_KEYS.map(
    (key) => `${READING_VARS[key]}: ${readingValue(key, activePrefs[key])}`,
  ).join(" · ");

  return (
    <div className="settings">
      <p className="settings-hint">{t.settingsIntro}</p>

      {/* ① 外观 */}
      <section className="panel settings-group">
        <p className="settings-group-label">
          <Icon icon={icons["mdi:palette-outline"]} width="1em" height="1em" />
          {t.appearance}
        </p>
        <div className="settings-row">
          {THEME_CHOICES.map((value) => {
            const active = activeChoice === value;
            return (
              <button
                key={value}
                type="button"
                className="settings-opt"
                aria-pressed={active}
                onClick={() => pickTheme(value)}
                title={THEME_LABELS[value].hint[lang]}
              >
                <Icon
                  icon={icons["mdi:check"]}
                  className="opt-check"
                  width="1em"
                  height="1em"
                />
                <span className="theme-chip" data-chip={value} aria-hidden="true">
                  {Array.from({ length: THEME_CHIP_DOTS[value] }, (_, index) => (
                    <span key={index} />
                  ))}
                </span>
                <span>{THEME_LABELS[value][lang]}</span>
              </button>
            );
          })}
        </div>
        <p className="settings-hint">{THEME_LABELS[activeChoice].hint[lang]}</p>
      </section>

      {/* ② 阅读偏好 */}
      <section className="panel settings-group">
        <p className="settings-group-label">
          <Icon icon={icons["mdi:format-size"]} width="1em" height="1em" />
          {t.reading}
        </p>
        <p className="settings-hint">{t.readingHint}</p>

        {READING_KEYS.map((key) => {
          const meta = GROUP_META[key];
          return (
            <div className="settings-field" key={key}>
              <span className="settings-field-label">
                <Icon icon={icons[meta.icon]} width="1em" height="1em" />
                {t[meta.label]}
              </span>
              <div className="settings-row">
                {readingOptions(key).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="settings-opt"
                    aria-pressed={activePrefs[key] === option.id}
                    onClick={() => pickReading(key, option.id)}
                    title={option.value}
                  >
                    <Icon
                      icon={icons["mdi:check"]}
                      className="opt-check"
                      width="1em"
                      height="1em"
                    />
                    <span>{option[lang]}</span>
                    {/* 字体那一组不给数值角标：字体栈是一长串名字，而档位标签（黑体 / 宋体…）
                        已经说清是哪一个；**整个页面就是它的预览** —— 点一下全站文字立刻换字体 */}
                    {key === "font" ? null : (
                      <span className="settings-opt-value">{option.value}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* 「自定义」那一档的上传区（选它之前也能先传：传完会自动切过去）。
                  只在这份开关打开时出现，见 lib/prefs.ts 的 CUSTOM_FONT_ENABLED */}
              {key === "font" && CUSTOM_FONT_ENABLED ? (
                <div className="settings-upload">
                  <div className="settings-upload-row">
                    <Icon icon={icons["mdi:upload"]} width="1em" height="1em" />
                    {localFont ? (
                      <>
                        <span className="settings-upload-name" title={localFont.name}>
                          {localFont.name}
                        </span>
                        <span className="settings-upload-size">{formatFontSize(localFont.size)}</span>
                      </>
                    ) : (
                      <span className="settings-upload-name">{t.localFontEmpty}</span>
                    )}
                    {/* 原生 label + 隐藏的 file input：点它就能开系统选文件框，
                        不用 ref 去 .click()（少一处命令式代码，键盘也照样能操作） */}
                    <label className="settings-opt settings-upload-pick">
                      {localFont ? t.localFontReplace : t.localFontUpload}
                      <input
                        type="file"
                        className="settings-upload-input"
                        accept=".woff2,.woff,.ttf,.otf,.ttc,font/woff2,font/woff,font/ttf,font/otf"
                        onChange={onPickFontFile}
                      />
                    </label>
                    {localFont ? (
                      <button
                        type="button"
                        className="settings-opt"
                        disabled={fontBusy}
                        onClick={onRemoveFont}
                      >
                        <Icon icon={icons["mdi:delete-outline"]} width="1em" height="1em" />
                        {t.localFontRemove}
                      </button>
                    ) : null}
                  </div>
                  {fontError ? (
                    <p className="settings-upload-error">{fontErrorText(fontError)}</p>
                  ) : null}
                  <p className="settings-hint">{t.localFontHint}</p>
                </div>
              ) : null}
            </div>
          );
        })}

        <p className="settings-tokens">
          {t.readingCurrent}：{tokenLine}
        </p>
      </section>

      {/* ③ 语言 */}
      <section className="panel settings-group">
        <p className="settings-group-label">
          <Icon icon={icons["mdi:translate"]} width="1em" height="1em" />
          {t.language}
        </p>
        <p className="settings-hint">{t.languageHint}</p>
        <div className="settings-row">
          <LangSwitcher lang={lang} className="settings-opt" />
        </div>
      </section>

      {/* ④ 恢复默认 */}
      <section className="settings-group">
        <button type="button" className="settings-opt settings-reset" onClick={resetAll}>
          <Icon icon={icons["mdi:restore"]} width="1em" height="1em" />
          {t.reset}
        </button>
        <p className="settings-hint">{t.resetHint}</p>
      </section>
    </div>
  );
}
