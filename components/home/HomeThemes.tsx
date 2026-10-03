"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";

import HomeBlockHead from "./HomeBlockHead";
import { icons } from "@/lib/icons";
import { HOME_TEXT } from "@/lib/home";
import type { Lang } from "@/lib/lang";
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
 * 第 7 栏：外观切换展示（第 9 项）
 *
 * 与设置中心的「外观」用的是**同一套 API**（lib/theme.ts 的 setThemeChoice /
 * subscribeTheme / currentThemeChoice）和**同一套样式**（.settings-opt + .theme-chip
 * 预览色块）—— 约定第 7 条：外观只有一个落点，这里不重写一遍 localStorage 与 data-theme。
 *
 * 首帧按默认值渲染（服务端与浏览器算出来的一样），挂载后再读真实值，
 * 否则 React 会报水合不一致（与 components/SettingsCenter.tsx 同一个做法）。
 *
 * 下面那段示范文字走 `.home-demo`：它读 --reading-size / --reading-leading，
 * 所以第 8 栏改了字号行距，这里会一起变 —— 两栏本来就是同一件事的两面。
 */
export default function HomeThemes({ lang }: { lang: Lang }) {
  const t = HOME_TEXT[lang].themes;
  const [choice, setChoice] = useState<ThemeChoice | null>(null);

  useEffect(() => {
    setChoice(currentThemeChoice());
    return subscribeTheme(() => setChoice(currentThemeChoice()));
  }, []);

  const active = choice ?? DEFAULT_THEME_CHOICE;

  return (
    <>
      <HomeBlockHead id="themes" lang={lang} />
      <p className="home-note">{t.lead}</p>
      <div className="settings-row">
        {THEME_CHOICES.map((value) => (
          <button
            key={value}
            type="button"
            className="settings-opt"
            aria-pressed={active === value}
            title={THEME_LABELS[value].hint[lang]}
            onClick={() => {
              setThemeChoice(value);
              setChoice(value);
            }}
          >
            <Icon icon={icons["mdi:check"]} className="opt-check" width="1em" height="1em" />
            <span className="theme-chip" data-chip={value} aria-hidden="true">
              {Array.from({ length: THEME_CHIP_DOTS[value] }, (_, index) => (
                <span key={index} />
              ))}
            </span>
            <span>{THEME_LABELS[value][lang]}</span>
          </button>
        ))}
      </div>
      <p className="home-note">{THEME_LABELS[active].hint[lang]}</p>
      <p className="home-demo">{t.demo}</p>
    </>
  );
}
