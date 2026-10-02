"use client";

import { useEffect, useRef, useState } from "react";

import {
  chartLanguage,
  type ChartCleanup,
  type ChartContext,
  type ChartKind,
  type ChartModule,
} from "@/lib/charts";
import {
  currentTheme,
  isDarkTheme,
  readThemeTokens,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

/**
 * 图表类型 → 渲染器模块。
 *
 * 每个值都是一次动态 import：文章里没有图表时，mermaid / echarts / graphviz /
 * abcjs / smiles-drawer 一个字节都不会进客户端包，离线 PWA 也不会平白变大。
 * 而且它们只在浏览器里跑（需要 DOM、canvas、ResizeObserver），
 * 静态导出时无法预渲染，只能这样「客户端补齐」。
 */
const LOADERS: Record<ChartKind, () => Promise<ChartModule>> = {
  mermaid: () => import("./charts/mermaid"),
  echarts: () => import("./charts/echarts"),
  graphviz: () => import("./charts/graphviz"),
  abc: () => import("./charts/abc"),
  smiles: () => import("./charts/smiles"),
};

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 链接图标的看门狗时长（毫秒）：图标请求超过这么久还没出图就认为这个源不行，换下一个。
 * 之所以需要它：被墙的域名常常是「连接挂着」而不是「被拒绝」，不给 `error` 事件，
 * 光听事件图标会永远空着。4 秒足够国内源正常出图，又不至于让人干等。
 */
const ICON_TIMEOUT = 4000;

/** 出错时把原因写在图的位置上，作者一眼能看到，读者也不会看到半张图 */
function markError(block: HTMLElement, message: string): void {
  block.dataset.chartState = "error";
  const target = block.querySelector<HTMLElement>(".chart-canvas") ?? block;

  const node = document.createElement("p");
  node.className = "chart-error";
  node.textContent = message; // 用 textContent：源码里的尖括号不会被当成标签
  target.replaceChildren(node);

  console.error("[chart]", message);
}

/** GitHub 公共接口 /users/:login 里我们用到的字段 */
interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

/**
 * 把 GitHub 用户信息填进卡片骨架。
 *
 * 骨架（lib/link-cards.ts 生成）本来就是一个能点的链接，显示用户名 + 域名；
 * 这里只是「有则换、无则留」地补上头像 / 名称 / 简介 —— 任何一项缺失都不影响其余部分。
 */
function fillGitHubCard(card: HTMLElement, user: GitHubUser): void {
  const name = card.querySelector<HTMLElement>("[data-github-name]");
  if (name && user.name) name.textContent = user.name;

  // 骨架那行本来印的是域名，拿到接口后补成「@用户名 · 域名」
  const meta = card.querySelector<HTMLElement>("[data-github-meta]");
  if (meta && user.login) meta.textContent = `@${user.login} · github.com`;

  const bio = card.querySelector<HTMLElement>("[data-github-bio]");
  if (bio && user.bio) bio.textContent = user.bio;

  const avatar = card.querySelector<HTMLElement>(".link-card-avatar");
  if (avatar && user.avatar_url) avatar.style.backgroundImage = `url("${user.avatar_url}")`;
}

export interface ArticleBodyProps {
  /** lib/markdown.ts 渲染出来的正文 HTML */
  html: string;
  className?: string;
}

/**
 * 正文容器：渲染 HTML，并把里面的图表占位逐个交给对应渲染器。
 *
 * HTML 来自构建期（本仓库自己的 Markdown），不是运行时用户输入；
 * 作者在正文里写内联 HTML 也是被允许的（见 content/README.md）。
 *
 * 外观（第 6 项）：图表要跟着主题换配色，所以这里
 *   1. 用 useState 的惰性初值直接读当前外观（首帧脚本已经把它写在 <html> 上了，
 *      所以水合后的第一次渲染就是对的，不会先画一张浅色图再重画）；
 *   2. subscribeTheme() 订阅外观变化（设置中心切换、系统深浅色变化），变了就重绘。
 *      重绘 = 清理旧图 → 再跑一遍渲染器，代价只在真的有图表的文章里付。
 */
export default function ArticleBody({ html, className }: ArticleBodyProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  useEffect(() => subscribeTheme((detail) => setTheme(detail.theme)), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const blocks = Array.from(
      host.querySelectorAll<HTMLElement>("figure.chart-block[data-chart]"),
    );
    if (blocks.length === 0) return;

    // 令牌从 CSS 变量现读：换主题后这里拿到的就是新的一套
    const context: ChartContext = {
      theme,
      dark: isDarkTheme(theme),
      colors: readThemeTokens(),
    };
    const cleanups: ChartCleanup[] = [];
    let cancelled = false;

    const run = async (): Promise<void> => {
      for (const block of blocks) {
        if (cancelled) return;

        const kind = block.dataset.chart as ChartKind | undefined;
        const language = chartLanguage(block.dataset.chartLanguage ?? kind ?? null);
        const label = language?.label ?? kind ?? "未知";
        const loader = kind ? LOADERS[kind] : undefined;

        const canvas = block.querySelector<HTMLElement>(".chart-canvas");
        const source = block.querySelector<HTMLElement>(".chart-source")?.textContent ?? "";

        if (!loader || !canvas) {
          markError(block, `暂不支持的图表类型：${kind ?? "未知"}`);
          continue;
        }
        if (source.trim() === "") {
          markError(block, `${label} 代码块是空的`);
          continue;
        }

        // 换主题重绘时先把上一张图（或上一次的报错）清掉：
        // 各个渲染器清场的方式不一样，统一在这里给一块干净容器最省心
        block.dataset.chartState = "pending";
        canvas.replaceChildren();

        try {
          const module = await loader();
          const cleanup = await module.render(canvas, source, context);
          if (cancelled) {
            if (typeof cleanup === "function") cleanup();
            continue;
          }
          if (typeof cleanup === "function") cleanups.push(cleanup);
          block.dataset.chartState = "ready";
        } catch (error) {
          markError(block, `${label} 渲染失败：${errorText(error)}`);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) cleanup();
    };
  }, [html, theme]);

  /**
   * GitHub 个人主页卡片（lib/link-cards.ts 生成的骨架）：页面里问一次 GitHub 公共接口，
   * 补上头像 / 名称 / 简介。渐进增强 —— 脚本没跑、接口限流或断网时，卡片仍是个能点的链接，
   * 只是多留一行骨架信息。只对 `[data-github-login]` 的卡片发请求，普通外链卡片不发。
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const cards = Array.from(
      host.querySelectorAll<HTMLElement>(".link-card[data-github-login]"),
    );
    if (cards.length === 0) return;

    let cancelled = false;

    const load = async (card: HTMLElement): Promise<void> => {
      const login = card.dataset.githubLogin;
      if (!login) return;
      card.dataset.githubState = "loading";
      try {
        const response = await fetch(
          `https://api.github.com/users/${encodeURIComponent(login)}`,
          { headers: { Accept: "application/vnd.github+json" } },
        );
        if (!response.ok) throw new Error(`GitHub 返回 ${response.status}`);
        const user = (await response.json()) as GitHubUser;
        if (cancelled) return;
        fillGitHubCard(card, user);
        card.dataset.githubState = "ready";
      } catch (error) {
        if (cancelled) return;
        card.dataset.githubState = "fallback";
        console.warn("[link-card] GitHub 用户信息没取到：", login, errorText(error));
      }
    };

    void Promise.all(cards.map((card) => load(card)));
    return () => {
      cancelled = true;
    };
  }, [html]);

  /**
   * 链接图标（lib/link-cards.ts 生成的 `<img class="link-icon">`）的兜底。
   *
   * 图标源都是别人家的服务，国内可达性说不准（第一版 DuckDuckGo 国内连不上；
   * 第二版 favicon.im 挂在 Cloudflare 上，时通时不通 —— 表现就是只有 GitHub 卡片
   * 有图、其余链接全空）。所以：`src` 放第一个源，其余源排在 `data-icon-alt` 里，
   * 这里逐个换着试，全试完就换成 `.link-icon-fallback` 的 `<span>`（图标画在 CSS 里，
   * 内联 SVG，不联网，断网 / PWA 离线也一定有）。
   *
   * 两种失败都要管：
   *   - `error`：连接被拒 / 403 / 404，事件会来；
   *   - **卡住不响应**：请求挂着既不 load 也不 error（被墙时很常见），光听事件会永远空着，
   *     所以要有个看门狗 —— 超过 ICON_TIMEOUT 还没出图就当成失败，换下一个源。
   *
   * 看门狗只在图标进入视口后才开始计（图片是 `loading="lazy"` 的，滚动到才发请求）：
   * 否则「还没轮到加载」会被误判成「取不到」，人还没滚到就把图标换掉了。
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const icons = Array.from(host.querySelectorAll<HTMLImageElement>("img.link-icon"));
    if (icons.length === 0) return;

    const cleanups: Array<() => void> = [];

    for (const img of icons) {
      let timer: number | undefined;
      let settled = false; // 已经出图（load）或已经换成本地图标，不再折腾

      const stopTimer = (): void => {
        if (timer !== undefined) {
          window.clearTimeout(timer);
          timer = undefined;
        }
      };

      /** 换下一个源；源都试完了就本地兜底。换源后重新开始计时。 */
      const recover = (): void => {
        stopTimer();
        const [next, ...rest] = (img.dataset.iconAlt ?? "").split(" ").filter(Boolean);
        if (next) {
          img.dataset.iconAlt = rest.join(" ");
          img.src = next;
          arm();
          return;
        }
        settled = true;
        const fallback = document.createElement("span");
        fallback.className = `${img.className} link-icon-fallback`;
        img.replaceWith(fallback);
      };

      /** 开始看门狗：到点还没出图就当这个源不行 */
      const arm = (): void => {
        stopTimer();
        timer = window.setTimeout(() => {
          if (!settled && img.naturalWidth === 0) recover();
        }, ICON_TIMEOUT);
      };

      const onLoad = (): void => {
        settled = true;
        stopTimer();
      };
      const onError = (): void => recover();

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);

      // 水合之前就出结果的那批补一次：已经失败的（error 早跑完了）立刻接着试下一个源；
      // `currentSrc` 为空说明是还没轮到的懒加载图，不算失败
      if (img.complete && img.currentSrc !== "") {
        if (img.naturalWidth > 0) onLoad();
        else recover();
      }

      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect(); // 只管「第一次进入视口」，之后换源不再需要它
        arm();
      });
      observer.observe(img);

      cleanups.push(() => {
        stopTimer();
        observer.disconnect();
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onError);
      });
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [html]);

  return (
    <div
      ref={hostRef}
      className={className ? `article-body ${className}` : "article-body"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
