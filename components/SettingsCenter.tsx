"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";

import LangSwitcher from "./LangSwitcher";
import { icons, type IconName } from "@/lib/icons";
import { SITE, type Lang } from "@/lib/site";
import {
  READING_DEFAULTS,
  READING_GROUPS,
  READING_KEYS,
  READING_VARS,
  readingValue,
  readReadingPrefs,
  resetReadingPrefs,
  setReadingPrefs,
  type ReadingKey,
  type ReadingPrefs,
} from "@/lib/prefs";
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
 *   2. 阅读偏好：正文宽度 / 字号 / 行距 —— 写到 `--reading-*` 三个令牌上（lib/prefs.ts），
 *      正文已经在读它们，所以改完立刻生效、不需要通知任何组件；
 *   3. 语言：中英切换（与顶栏共用 components/LangSwitcher.tsx）；
 *   4. 恢复默认：清掉偏好键 + 移除行内 CSS 变量。
 *
 * 首帧与主题按钮同理：先按默认值渲染（服务端与浏览器算出来的一样），挂载后再读真实值，
 * 否则 React 会报水合不一致。
 *
 * 这个组件只负责**内容**，不管容器：抽屉在 components/SettingsDock.tsx，
 * 第 13 项的 /[lang]/settings/ 页面直接把它放进一个 .page 里即可，样式是同一套。
 */

type ReadingLabelKey = "readingWidth" | "readingSize" | "readingLeading";

/** 三组的标签与图标：标签文案在 lib/site.ts 的 I18N 里，图标在这里 */
const GROUP_META: Record<ReadingKey, { label: ReadingLabelKey; icon: IconName }> = {
  width: { label: "readingWidth", icon: "mdi:arrow-expand-horizontal" },
  size: { label: "readingSize", icon: "mdi:format-size" },
  leading: { label: "readingLeading", icon: "mdi:format-line-spacing" },
};

/* 外观预览色块的格数共用 lib/theme.ts 的 THEME_CHIP_DOTS（第 9 项起首页也用这一份） */

export default function SettingsCenter({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const [choice, setChoice] = useState<ThemeChoice | null>(null);
  const [prefs, setPrefs] = useState<ReadingPrefs | null>(null);

  useEffect(() => {
    setChoice(currentThemeChoice());
    setPrefs(readReadingPrefs());
    return subscribeTheme(() => setChoice(currentThemeChoice()));
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

  function resetAll() {
    resetReadingPrefs();
    setThemeChoice(DEFAULT_THEME_CHOICE);
    setPrefs(READING_DEFAULTS);
    setChoice(DEFAULT_THEME_CHOICE);
  }

  // 把当前三个令牌的**实际取值**显示出来：调完能立刻看到 rem / 倍率变成了多少
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
                {READING_GROUPS[key].map((option) => (
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
                    <span className="settings-opt-value">{option.value}</span>
                  </button>
                ))}
              </div>
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
