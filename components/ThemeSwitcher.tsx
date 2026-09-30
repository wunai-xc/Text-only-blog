"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";

import { icons, type IconName } from "@/lib/icons";
import { SITE, type Lang } from "@/lib/site";
import {
  DEFAULT_THEME_CHOICE,
  THEME_CHOICES,
  THEME_LABELS,
  currentThemeChoice,
  setThemeChoice,
  subscribeTheme,
  type ThemeChoice,
} from "@/lib/theme";

/**
 * 顶栏外观按钮（第 7 项；对齐 wunai-blog 顶栏那「一个位置一颗按钮」的做法）
 *
 * 点一下切到下一套：跟随系统 → 纸 → 亮 → 暗 → 跟随系统。图标与提示都跟着当前选择走，
 * 悬停时能读到这套外观的一句话说明（文案来自 lib/theme.ts 的 THEME_LABELS）。
 *
 * 落点是 lib/theme.ts 的 setThemeChoice()（写 localStorage + 改 <html data-theme>），
 * **不在这里碰 localStorage 与 data-theme**（约定第 7 条）。
 * 想精确挑某一套外观、或者调阅读偏好，走左下角的设置中心。
 *
 * 首帧渲染用默认选择（跟随系统），挂载后再读真实选择 —— 否则服务端与浏览器算出来的
 * 图标不同，React 会报水合不一致。
 */
const CHOICE_ICONS: Record<ThemeChoice, IconName> = {
  system: "mdi:theme-light-dark",
  paper: "mdi:book-open-outline",
  light: "mdi:weather-sunny",
  dark: "mdi:weather-night",
};

export default function ThemeSwitcher({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const [choice, setChoice] = useState<ThemeChoice | null>(null);

  useEffect(() => {
    setChoice(currentThemeChoice());
    // 系统在浏览过程中换深浅色（ThemeSync）、或其他地方改了外观，这里跟着更新
    return subscribeTheme(() => setChoice(currentThemeChoice()));
  }, []);

  const active = choice ?? DEFAULT_THEME_CHOICE;
  const label = THEME_LABELS[active][lang];

  function cycle() {
    const index = THEME_CHOICES.indexOf(active);
    const next = THEME_CHOICES[(index + 1) % THEME_CHOICES.length];
    setThemeChoice(next);
    setChoice(next);
  }

  return (
    <button
      type="button"
      className="icon-button"
      onClick={cycle}
      title={`${t.appearance}：${label} —— ${THEME_LABELS[active].hint[lang]}`}
      aria-label={`${t.appearance}：${label}`}
    >
      <Icon icon={icons[CHOICE_ICONS[active]]} width="1.15em" height="1.15em" />
    </button>
  );
}
