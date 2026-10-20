/*
 * public/sw.js —— Service Worker（第 5 项：PWA / 离线）
 *
 * 这个文件在 public/ 里，**不经过打包**：浏览器直接把它当脚本跑。
 * 所以它是普通 JS（不是 TS）、不能 import、也不能用 App Router 的东西。
 * 注册代码在 components/ServiceWorkerRegistrar.tsx（只在生产构建里注册）。
 *
 * 策略（纯文字博客的第一诉求是「断网时还能翻文章」）：
 *
 *   install  预缓存「外壳」（首页 / 列表页 / 离线页 / manifest / 图标），
 *            再读一次 /search-index.json，把**全部文章页**与它们引用的 CSS / JS / 图片
 *            一起抓进缓存。单条失败只记日志，不会让整个 install 挂掉。
 *   activate 删掉旧版本缓存，然后立刻接管页面（clients.claim）。
 *
 *   fetch    - 导航请求（地址栏跳转 / 刷新）：**网络优先**，失败依次退回
 *              该地址的缓存副本 → 离线兜底页。这样正文永远优先拿新的。
 *            - 同源静态资源（/_next/*、CSS、字体、图标、JSON）：**缓存优先 + 后台更新**
 *              （stale-while-revalidate）。它们要么带内容哈希，要么是可再生成的产物。
 *            - 其余（跨源、非 GET、Range 请求）：不插手，直接走网络。
 *
 * 为什么现在预缓存全部文章：文章页是静态 HTML，体量小；搜索索引里已经有每篇的
 * `href`，install 时照着抓一遍即可。这样读者不需要「先点开一次」才能离线看，
 * 断网时从离线页或地址栏都能直接进正文。文章多到索引变大时，把
 * `PRECACHE_ARTICLES` 改成 false 就能退回「打开过才缓存」。
 *
 * 离线时页面里的站内链接由 components/OfflineNav.tsx 改成整页导航：
 * Next 的客户端路由要额外请求 RSC 载荷，而这里预缓存的是整页 HTML。
 *
 * 改了缓存策略或外壳清单，就把 CACHE_VERSION 往上加一位 —— 否则老客户端会一直用旧缓存。
 */

const CACHE_VERSION = "4";
const CACHE_PREFIX = "text-only-blog-";
const CACHE_NAME = `${CACHE_PREFIX}v${CACHE_VERSION}`;

/** 是否预缓存全部文章（改 false 就退回「打开过才缓存」） */
const PRECACHE_ARTICLES = true;

/**
 * 预缓存的「外壳」：路径都必须真实存在，否则 install 时那条会失败（不影响其它条目）。
 * 列表页在清单里：它是「翻目录」的入口；文章页由 precacheArticles() 补全。
 */
const SHELL = [
  "/",
  "/zh/",
  "/en/",
  "/zh/posts/",
  "/en/posts/",
  "/offline/",
  "/manifest.webmanifest",
  "/wunai_logo.png",
];

/** 离线兜底页（导航失败时给这个） */
const OFFLINE_URL = "/offline/";

/** 搜索索引：既提供全部文章地址，也顺手让离线搜索有数据 */
const SEARCH_INDEX_URL = "/search-index.json";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const assets = new Set();

      await Promise.all(
        SHELL.map(async (url) => {
          const response = await cacheUrl(cache, url);
          if (!response) return;
          try {
            collectAssets(await response.text(), assets);
          } catch {
            // 某个外壳不是 HTML（manifest / 图片），跳过即可
          }
        }),
      );

      // 外壳页引用的 CSS / JS / 图标先缓存下来，离线首屏才不会裸奔
      await eachLimit(assets, 6, (url) => cacheUrl(cache, url));

      if (PRECACHE_ARTICLES) await precacheArticles(cache);

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

/** 能不能缓存的响应：只缓存本源的完整成功响应 */
function isCacheable(response) {
  return Boolean(response) && response.ok && response.type === "basic";
}

/** 抓一个地址并放进缓存；失败返回 null（install 不该因为一条 404 整体失败） */
async function cacheUrl(cache, url) {
  try {
    const target = new URL(url, self.location.origin).href;
    const response = await fetch(new Request(target, { cache: "reload" }));
    if (!isCacheable(response)) return null;
    await cache.put(target, response.clone());
    return response;
  } catch (error) {
    console.warn("[sw] 缓存失败：", url, error);
    return null;
  }
}

/** 限制并发数，避免 install 时一次打几十个请求 */
async function eachLimit(items, limit, task) {
  const queue = Array.from(items);
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) return;
      await task(item);
    }
  });
  await Promise.all(workers);
}

/**
 * 从 HTML 里挑出同源的 CSS / JS / 图片地址。
 * 只认扩展名或 /_next/ 前缀，避免把文章页、外链、data: URI 也塞进缓存。
 */
function collectAssets(html, into) {
  const add = (raw) => {
    if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) return;
    let url;
    try {
      url = new URL(raw, self.location.origin);
    } catch {
      return;
    }
    if (url.origin !== self.location.origin) return;
    if (
      url.pathname.startsWith("/_next/") ||
      /\.(?:css|js|mjs|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/i.test(url.pathname)
    ) {
      into.add(url.pathname);
    }
  };

  for (const match of html.matchAll(/(?:src|href|poster)="([^"]+)"/g)) add(match[1]);
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of match[1].split(",")) add(part.trim().split(/\s+/)[0]);
  }
}

/**
 * 预缓存全部文章。地址来自构建期生成的搜索索引（生产构建里不含草稿）：
 *   1. 抓索引本身（离线搜索也就能用）；
 *   2. 逐篇抓正文 HTML，再从每篇 HTML 收集 CSS / JS / 图片；
 *   3. 统一补抓这些静态资源。
 */
async function precacheArticles(cache) {
  const indexResponse = await cacheUrl(cache, SEARCH_INDEX_URL);
  if (!indexResponse) return;

  let index;
  try {
    index = await indexResponse.json();
  } catch (error) {
    console.warn("[sw] 搜索索引解析失败：", error);
    return;
  }

  const hrefs = Array.from(
    new Set(
      (Array.isArray(index?.docs) ? index.docs : [])
        .map((doc) => doc?.href)
        .filter((href) => typeof href === "string" && href.startsWith("/")),
    ),
  );
  if (hrefs.length === 0) return;

  const assets = new Set();
  await eachLimit(hrefs, 6, async (href) => {
    const response = await cacheUrl(cache, href);
    if (!response) return;
    try {
      collectAssets(await response.text(), assets);
    } catch (error) {
      console.warn("[sw] 文章 HTML 读取失败：", href, error);
    }
  });

  await eachLimit(assets, 6, (url) => cacheUrl(cache, url));
}

/** 导航请求：网络优先 → 缓存副本 → 离线页 */
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (isCacheable(response)) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = (await cache.match(request)) ?? (await cache.match(request, { ignoreSearch: true }));
    if (cached) return cached;

    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response("离线，且没有可用的缓存副本。", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/** 静态资源：缓存优先 + 后台更新 */
async function handleAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then(async (response) => {
      if (isCacheable(response)) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) return cached;

  const response = await network;
  if (response) return response;

  return new Response("", { status: 504, statusText: "Gateway Timeout" });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Range 请求（音频/视频拖动进度）交给网络，别用缓存糊弄
  if (request.headers.has("range")) return;

  // 自己不缓存自己，免得 SW 更新被旧缓存挡住
  if (url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleAsset(request));
});
