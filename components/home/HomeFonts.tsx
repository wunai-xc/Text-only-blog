"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";

import HomeBlockHead from "./HomeBlockHead";
import { icons, type IconName } from "@/lib/icons";
import { HOME_TEXT } from "@/lib/home";
import {
  READING_DEFAULTS,
  READING_VARS,
  readingOptions,
  readReadingPrefs,
  readingValue,
  setReadingPrefs,
  subscribeReadingPrefs,
  type ReadingKey,
  type ReadingPrefs,
} from "@/lib/prefs";
import { SITE, type Lang } from "@/lib/site";

/**
 * 第 8 栏：字体设置展示（第 9 项）
 *
 * 四组选项（字体 / 宽度 / 字号 / 行距）直接取 lib/prefs.ts 的选项表与写入 API ——
 * 与设置中心是同一套东西，变量落点还是那四个 --reading-* 令牌（约定第 8 条：
 * 阅读偏好只写令牌，不在组件里改字号）。这里额外做的只有一件事：
 * 当场放一段示范文字（.home-demo 读同样四个令牌），让读者不用等文章页就能看见效果。
 * 「字体」那一组的预览是**整页文字**：选一下，这一栏乃至全站立刻换字体。
 *
 * 四组的名字复用 lib/site.ts 的 readingFont / readingWidth / readingSize / readingLeading
 * （不另写一份），图标名走 lib/icons.ts（本地打包，运行时不发请求）。
 */
const GROUP_ICON: Record<ReadingKey, IconName> = {
  font: "mdi:format-font",
  width: "mdi:arrow-expand-horizontal",
  size: "mdi:format-size",
  leading: "mdi:format-line-spacing",
};

export default function HomeFonts({ lang }: { lang: Lang }) {
  const t = HOME_TEXT[lang].fonts;
  const site = SITE.i18n[lang];
  const [prefs, setPrefs] = useState<ReadingPrefs | null>(null);

  useEffect(() => {
    setPrefs(readReadingPrefs());
    return subscribeReadingPrefs((next) => setPrefs(next));
  }, []);

  const active = prefs ?? READING_DEFAULTS;

  const groups: { key: ReadingKey; label: string }[] = [
    { key: "font", label: site.readingFont },
    { key: "width", label: site.readingWidth },
    { key: "size", label: site.readingSize },
    { key: "leading", label: site.readingLeading },
  ];

  // 当前四个令牌的实际取值（rem / 倍率 / 字体栈）—— 调完能当场看到数字变化
  const tokenLine = groups
    .map((group) => `${READING_VARS[group.key]}: ${readingValue(group.key, active[group.key])}`)
    .join(" · ");

  return (
    <>
      <HomeBlockHead id="fonts" lang={lang} />
      <p className="home-note">{t.lead}</p>

      {groups.map((group) => (
        <div className="home-field" key={group.key}>
          <span className="home-field-label">
            <Icon icon={icons[GROUP_ICON[group.key]]} width="1em" height="1em" />
            {group.label}
          </span>
          <div className="settings-row">
            {readingOptions(group.key).map((option) => (
              <button
                key={option.id}
                type="button"
                className="settings-opt"
                aria-pressed={active[group.key] === option.id}
                title={option.value}
                onClick={() => {
                  // 只给变的那一项：先落到 Partial<ReadingPrefs>，避免用 as 断言（同一段逻辑见 SettingsCenter）
                  const patch: Partial<ReadingPrefs> = {};
                  patch[group.key] = option.id;
                  setPrefs(setReadingPrefs(patch));
                }}
              >
                <Icon icon={icons["mdi:check"]} className="opt-check" width="1em" height="1em" />
                <span>{option[lang]}</span>
                {/* 字体那一组不挂数值角标（字体栈太长），标签本身已经说清是哪一个 */}
                {group.key === "font" ? null : (
                  <span className="settings-opt-value">{option.value}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="home-demo">{t.sample}</p>
      <p className="home-tokens">
        {site.readingCurrent}：{tokenLine}
      </p>
    </>
  );
}
