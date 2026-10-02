"use client";

import { useEffect } from "react";

import { initLocalFont } from "@/lib/local-font";

/**
 * 把读者上传的字体接回页面（第 8 项字体设置里「自定义」那一档）
 *
 * 读者在设置中心上传过字体后，那份字节存在 IndexedDB 里；每次打开站点都得**重新注册**
 * 成 FontFace 才会生效（FontFace 只活在当前页面里）。注册这件事不能放在设置抽屉里 ——
 * 抽屉要等读者点齿轮才挂载，那就成了「不打开设置就没有自定义字体」。
 *
 * 所以挂在 app/layout.tsx，与 ThemeSync 并排：每个页面都会跑一次。
 * 自己渲染任何东西、也不碰 state —— 落点始终是 `--reading-font` 那个令牌，
 * 需要知道「当前是哪一份字体」的组件（设置中心）用 subscribeLocalFont() / readLocalFontMeta()。
 *
 * 时机：IDB 是异步的，首帧先按字体栈的兜底渲染，注册完浏览器自己重排
 * （与 @font-face 的 font-display: swap 同一种观感）。
 */
export default function LocalFontSync() {
  useEffect(() => {
    void initLocalFont();
  }, []);
  return null;
}