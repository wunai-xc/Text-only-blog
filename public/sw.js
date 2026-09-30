/*
 * public/sw.js —— Service Worker（第 5 项：PWA / 离线）
 *
 * 这个文件在 public/ 里，**不经过打包**：浏览器直接把它当脚本跑。
 * 所以它是普通 JS（不是 TS）、不能 import、也不能用 App Router 的东西。
 * 注册代码在 components/ServiceWorkerRegistrar.tsx（只在生产构建里注册）。
 *
 * 策略（刻意保守，纯文字博客的第一诉求是「读过的东西离线还能再看一眼」）：
 *
 *   install  预缓存「外壳」：根页、两个语言的首页、离线兜底页、manifest、favicon。
 *            用逐个 add + try/catch，任何一个失败都不会让整个 install 挂掉。
 *   activate 删掉旧版本缓存，然后立刻接管页面（clients.claim）。
 *
 *   fetch    - 导航请求（地址栏跳转 / 刷新）：**网络优先**，失败依次退回
 *              该地址的缓存副本 → 离线兜底页。这样正文永远优先拿新的。
 *            - 同源静态资源（/_next/*、CSS、字体、图标、JSON）：**缓存优先 + 后台更新**
 *              （stale-while-revalidate）。它们要么带内容哈希，要么是可再生成的产物。
 *            - 其余（跨源、非 GET、Range 请求）：不插手，直接走网络。
 *
 * 为什么不预缓存全部页面：静态导出下页面数取决于文章数，install 里一次性抓几百个
 * HTML 又慢又容易失败；「打开过就离线可看」对阅读场景够用了。
 *
 * 改了缓存策略或外壳清单，就把 CACHE_VERSION 往上加一位 —— 否则老客户端会一直用旧缓存。
 */

const CACHE_VERSION = "1";
const CACHE_NAME = `text-only-blog-v${CACHE_VERSION}`;

/** 预缓存的「外壳」：路径都必须真实存在，否则 install 时那条会失败（不影响其它条目） */
const SHELL = ["/", "/zh/", "/en/", "/offline/", "/manifest.webmanifest", "/favicon.svg"];

/** 离线兜底页（导航失败时给这个） */
const OFFLINE_URL = "/offline/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        SHELL.map(async (url) => {
          try {
            const response = await fetch(new Request(url, { cache: "reload" }));
            if (response.ok) await cache.put(url, response);
          } catch (error) {
            // 单条失败就算了：dev 下某些路径可能不存在
            console.warn("[sw] 预缓存失败：", url, error);
          }
        }),
      );
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
          .filter((name) => name.startsWith("text-only-blog-") && name !== CACHE_NAME)
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
