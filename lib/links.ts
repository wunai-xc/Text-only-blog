/**
 * lib/links.ts —— 友链名单（从 lib/site.ts 拆出）
 *
 * 只放「谁链了我、我链了谁」这一份数据 —— [/[lang]/links/] 页面的卡片按它渲染，
 * 数据只此一处。加 / 删 / 改友链就改下面的 `LINKS`，不用动别的文件。
 *
 * ⚠️ 别和 lib/link-cards.ts 搞混：那个是**文章正文里**的链接增强（行内加图标、
 * 单独成行变卡片），跟这里的友链名单没有关系。两个文件名字像，用途不同。
 *
 * 加别人之前先问一声，并确认对方也链了你 —— 这件事代码管不了（页面底部也写着这句）。
 */

import type { Lang } from "./lang";

/**
 * 友链条目（/[lang]/links/ 页；卡片由该页渲染，数据只此一处）。
 */
export interface FriendLink {
  /** 站点或作者名称 */
  name: string;
  /** 站点地址（整张卡片点击跳转） */
  url: string;
  /**
   * 头像地址。**外链直引**（与 wunai-Blog 的友链页一致：原生 `<img>`，不经 next/image，
   * 因为静态导出不优化图片、remotePatterns 也管不到任意域名）。
   * 留空时页面按名称首字画占位方块，不留碎图。
   */
  avatar?: string;
  /** 一句话介绍，中英各一份；两边都留空时卡片副标题回退显示域名 */
  note?: { zh: string; en: string };
}

/**
 * 友链名单（名字 / 地址 / 头像 / 介绍）。
 *
 * 头像取自各位的 GitHub 主页（`avatars.githubusercontent.com` 直链带 `s=96`，
 * 够 48px 卡片两倍图用；`github.com/<用户名>.png?size=96` 那种会 302 到同一个地方）；
 * 没有 GitHub 的两位用对方站点自己的头像图 / favicon。若对方改了简介或头像，
 * 按下面的形状改一行即可 —— 也可以换成本地图：图片放进 `public/avatars/`，这里写 `/avatars/xxx.png`。
 */
export const LINKS: FriendLink[] = [
  {
    name: "hconzlvra",
    url: "https://hconzlvra.top/",
    avatar: "https://avatars.githubusercontent.com/u/273501356?v=4&s=96",
    note: {
      zh: "就让我自己登基，成为疯的君王.",
      en: "Let me ascend the throne myself and become a mad monarch.",
    },
  },
  {
    name: "molforte",
    url: "https://molforte.github.io/Molforte.pages/",
    avatar: "https://avatars.githubusercontent.com/u/176408050?v=4&s=96",
    note: {
      zh: "来自中国浙江省的学生，正在学习嵌入式与 AI。",
      en: "A student from Zhejiang province, China. Learning Embedded and AI.",
    },
  },
  {
    name: "arcadia",
    url: "https://www.arcadia.moe/",
    avatar: "https://avatars.githubusercontent.com/u/97033226?v=4&s=96",
    note: {
      // 本人要求只写「开发者」这类中性说法，不要具体身份描述
      zh: "开发者",
      en: "Developer",
    },
  },
  {
    name: "bfladderbean",
    url: "https://www.bfladderbean.me/",
    avatar: "https://avatars.githubusercontent.com/u/139599235?v=4&s=96",
    note: {
      // 原句就是这句中文，英文站也保持原文：一句诗样的句子不宜机器翻译
      zh: "立春天，风渐暖，伊人一去不复返",
      en: "立春天，风渐暖，伊人一去不复返",
    },
  },
  {
    name: "subear",
    url: "https://subear.net/",
    // 该站首页未声明 favicon，这里用它自己的站内头像图（在 wunai-Blog 里已验证可访问）
    avatar: "https://subear.net/src/ProfilePhoto.jpg",
    note: {
      // 取自该站自己的副标题（brand-role），不是编造的描述
      zh: "Seeing · Living · Sleeping",
      en: "Seeing · Living · Sleeping",
    },
  },
  {
    name: "GTMC",
    url: "https://www.techmc.wiki/",
    // 该站 /favicon.ico 是有效图标文件（ICO 内嵌 PNG）
    avatar: "https://www.techmc.wiki/favicon.ico",
    note: {
      // 取自该站首页的自我介绍（Graduate Texts in Minecraft 的缩写）
      zh: "Graduate Texts in Minecraft：社区编写的技术性 MC 开放教科书，涵盖红石、游戏机制与引擎内部原理",
      en: "Community-written open textbook on technical Minecraft: redstone, mechanics, chunk systems and engine internals",
    },
  },
  {
    name: "RSEGordon Blog",
    // 对方「友链」页公布的地址（首页）
    url: "https://clawblog.rseg.club/",
    // GitHub 官方头像端点：github.com/<用户名>.png 会 302 到 avatars.githubusercontent.com
    avatar: "https://github.com/RSEGordon.png?size=96",
    note: {
      // 对方公开的描述原句：海洋遥感 · 数据科学 · 日常折腾
      zh: "海洋遥感 · 数据科学 · 日常折腾",
      en: "Ocean remote sensing · Data science · Everyday tinkering",
    },
  },
  {
    name: "Ryan100c",
    url: "https://hotpad100c-github-io.pages.dev/",
    avatar: "https://github.com/hotpad100c.png?size=96",
    note: {
      zh: "编程 · Minecraft · 创造：记录开发日志、灵感与 Minecraft 技术研究",
      en: "Programming · Minecraft · Making: dev logs, ideas and technical Minecraft research",
    },
  },
  {
    name: "Linvin",
    url: "https://blog.linvin.net/",
    // ⚠️ 这里原来写的是主页地址（不是图片地址），会渲染成碎图；
    // 按其它几位的写法补成 GitHub 头像端点
    avatar: "https://github.com/Linvin-1233.png?size=96",
    note: {
      zh: "一位 MC 玩家，对储电稍有研究。对全栈、Web 开发也稍有钻研。",
      en: "A MC player, who has a little research on power storage. I also have a little research on full stack and Web development.",
    },
  },
];

/** 取当前语言的介绍；缺当前语言时退回中文；都没有则返回空串（调用方回退显示域名） */
export function friendNote(note: { zh: string; en: string } | undefined, lang: Lang): string {
  if (!note) return "";
  return note[lang] || note.zh;
}

/** 去掉协议与末尾斜杠，得到可读的域名路径（卡片副标题的回退文案） */
export function friendHost(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}