"use client";

import { READING_SLIDERS, formatReadingNumber, type ReadingSliderKey } from "@/lib/prefs";

/**
 * 阅读偏好里的滑块（宽度 / 字号 / 行距）—— 设置中心与首页第 8 栏共用这一个，
 * 免得两处各画一套、改了一处忘了另一处。
 *
 * 长什么样：**一条 1px 细导轨 + 一个圆形滑块**，与全站的细线语言一致。导轨上还画两样：
 *   1. 均分的刻度（TRACK_DIVISIONS 段）—— 拖到哪一段、一格有多大，看得见；
 *   2. 一个固定的空心小圆环 = **屏幕默认值**的位置。读者把滑块拖走后它留在原处，
 *      一眼就能看出自己偏离默认多少（默认值怎么来的见 lib/prefs.ts 的
 *      currentReadingDefaults：它读的是 CSS 里按屏幕宽度算的那一条，不受读者设置影响）。
 *
 * 吸附：靠原生 range 的 `step` —— 每个 step 就是一个节点，浏览器保证滑块落在节点上，
 * 不必自己算（步长在 lib/prefs.ts 的 READING_SLIDERS 里）。导轨左右各内缩半个滑块，
 * 于是滑块圆心的行程正好等于导轨长度，百分比（刻度 / 默认点）与圆心一一对上，
 * 具体见 app/globals.css 的 .settings-track / .settings-rail 那一段。
 *
 * 画的这一层（.settings-rail）整体 pointer-events: none，点击与拖动都落到 input 上，
 * 所以「默认点」不会挡住点它附近的位置。
 */
const TRACK_DIVISIONS = 8;

export default function ReadingSlider({
  sliderKey,
  value,
  defaultValue,
  label,
  onChange,
}: {
  sliderKey: ReadingSliderKey;
  /** 当前生效的数值（读者拖过的值，没拖过就是屏幕默认值） */
  value: number;
  /** 当前屏幕下的默认值 —— 导轨上那个固定点的位置 */
  defaultValue: number;
  /** 无障碍名，就是这一组的标题（如「正文宽度」） */
  label: string;
  onChange: (value: number) => void;
}) {
  const spec = READING_SLIDERS[sliderKey];
  /** 数值 → 导轨上的百分比 */
  const percent = (n: number) => ((n - spec.min) / (spec.max - spec.min)) * 100;

  return (
    <div className="settings-slider">
      <div className="settings-track">
        <div className="settings-rail" aria-hidden="true">
          <span className="settings-rail-line" />
          {Array.from({ length: TRACK_DIVISIONS + 1 }, (_, index) => (
            <span
              key={index}
              className="settings-tick"
              style={{ left: `${(index / TRACK_DIVISIONS) * 100}%` }}
            />
          ))}
          <span className="settings-default" style={{ left: `${percent(defaultValue)}%` }} />
        </div>
        <input
          type="range"
          className="settings-range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={value}
          aria-label={label}
          // 每一格都立刻落到令牌上：正文就在旁边，看得见
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      <span className="settings-range-value">{formatReadingNumber(sliderKey, value)}</span>
    </div>
  );
}
