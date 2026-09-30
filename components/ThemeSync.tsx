"use client";

import { useEffect } from "react";

import { watchSystemTheme } from "@/lib/theme";

/**
 * 跟随系统的深浅色变化（第 6 项）
 *
 * 首帧脚本只在页面加载时算一次外观，系统在浏览过程中从浅色切到深色（macOS / Windows /
 * 手机的日落切换）它不会知道。这个组件把 media query 的监听挂上：
 * 只有在读者的选择是「跟随系统」时才会重新应用外观，显式选过「纸 / 亮 / 暗」的不受影响。
 *
 * 自己不渲染任何东西，也不写 state —— 换外观这件事的落点始终是 `<html data-theme>`，
 * 需要响应切换的组件（比如图表容器）用 lib/theme.ts 的 subscribeTheme() 订阅。
 */
export default function ThemeSync() {
  useEffect(() => watchSystemTheme(), []);
  return null;
}
