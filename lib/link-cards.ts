/**
 * lib/link-cards.ts —— 正文链接的两点增强（第 3 项渲染管线里的一个 rehype 插件）
 *
 * 作者什么都不用加，插件按「链接怎么写」自己判断，两种处理：
 *
 *   1. **行内链接**（前后还有别的字）：在链接文字前加一枚与正文字号同大的站点图标。
 *      图标按域名向图标服务取（见 ICON_SOURCES）。取不到时换成本地图标（纯 CSS 内联 SVG，
 *      不联网，见 globals.css 的 .link-icon-fallback），既不会出现碎图，也不会把行距撑开。
 *      只处理**站外** http(s) 链接；站内相对链接、锚点、脚注角标、标题里的链接都不加。
 *
 *   2. **单独成行的链接**（整个段落只有这一条链接）：换成一张整块可点的卡片。
 *      - GitHub 个人主页（`github.com/<用户名>`，且不是 about / settings 这类保留路径）：
 *        「头像 + 名称 + 简介」的个人卡片。这三样在 HTML 里先留成骨架（骨架本身就是
 *        一个能点的链接，显示 @用户名 + 域名），由 components/ArticleBody.tsx 在浏览器里
 *        问一次 GitHub 公共接口补齐 —— 渐进增强：脚本没跑 / 接口被限流时，卡片照旧能点。
 *      - 其它站外链接（B 站视频、任意文章……）：通用卡片，站点图标 + 标题 + 域名。
 *        **不抓封面**：B 站的封面要带签名的接口、还跨域拿不到，这是它「麻烦」的根源。
 *
 * 为什么放在 hast 层（remark-rehype 之后）而不是 mdast 层：这里才拿得到真正的 `<a>`
 * 元素与它的类名（脚注角标 `.cite` 是 remarkCitations 给的），也能一眼看出
 * 「这个段落里是不是只有一条链接」。
 *
 * 位置：排在 rehype-raw 之后、rehype-slug 之前（见 lib/markdown.ts）。
 * rehypeAutolinkHeadings 更靠后，它给标题末尾加的那个 `#` 锚点轮不到这里；
 * 标题里的链接本来也被 HEADING_TAGS 挡掉了。
 */

/**
 * 站点图标源：按顺序试，前一个取不到就换下一个，全都取不到就换成本地图标
 * （画在 CSS 里，不联网）。每个源就是一条「域名 → 图标地址」的规则，加源只塞进这个数组。
 *
 * 为什么国内源排前面：图标源都是「别人家的服务」，可达性一直在变 ——
 * 第一版用 `icons.duckduckgo.com` 在国内直接连不上；第二版换成 `favicon.im`，
 * 它挂在 Cloudflare 上，国内时通时不通，表现就是「只有 GitHub 卡片有图（头像走 GitHub
 * 自己的 CDN），其余链接的图标全空」。现在把两个有国内 IP（腾讯云 EdgeOne）的源放前面：
 *   - `api.xinac.net`：国内，实测覆盖最全 —— b23.tv 这种短链、techmc.wiki 这类自建站都命中；
 *   - `favicon.cccyun.cc`：同样国内，做备用；
 *   - `favicon.im`：海外 Cloudflare，覆盖最全，放最后兜底。
 */
export const ICON_SOURCES: Array<(host: string) => string> = [
  (host) => `https://api.xinac.net/icon/?url=${encodeURIComponent(host)}`,
  (host) => `https://favicon.cccyun.cc/${encodeURIComponent(host)}`,
  (host) => `https://favicon.im/${encodeURIComponent(host)}`,
];

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/** 这些类名的链接一律不动：脚注角标、标题锚点、参考列表的返回箭头、已处理过的卡片 */
const SKIP_CLASSES = new Set(["cite", "heading-anchor", "reference-back", "link-card"]);

/**
 * GitHub 的一级保留路径：`github.com/<这些>` 不是某个人，别把它当个人主页做卡片。
 * 只列常见的一级入口，漏了也不致命（顶多多做一张卡片）。
 */
const GITHUB_RESERVED = new Set([
  "about",
  "account",
  "apps",
  "collections",
  "contact",
  "dashboard",
  "events",
  "explore",
  "features",
  "issues",
  "join",
  "login",
  "logout",
  "marketplace",
  "new",
  "notifications",
  "organizations",
  "orgs",
  "pricing",
  "pulls",
  "readme",
  "search",
  "security",
  "settings",
  "site",
  "sponsors",
  "topics",
  "trending",
  "users",
]);

/* ------------------------- 宽松的树类型（同 lib/markdown.ts） ------------------------- */

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function element(
  tagName: string,
  properties: Record<string, unknown> = {},
  children: HastNode[] = [],
): HastNode {
  return { type: "element", tagName, properties, children };
}

function text(value: string): HastNode {
  return { type: "text", value };
}

/* ------------------------------ URL 小工具 ------------------------------ */

/** 取站外链接的域名（去掉 www.）；相对链接、锚点、mailto 之类返回空串 */
export function linkHost(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

/** 按 ICON_SOURCES 算出候选图标地址，顺序就是尝试顺序 */
function iconUrls(host: string): string[] {
  return ICON_SOURCES.map((build) => build(host));
}

/**
 * 站点图标 `<img>`：`src` 放第一个源，其余源按顺序塞进 `data-icon-alt`（空格分隔），
 * 由 components/ArticleBody.tsx 在加载失败时依次换上，最后一个也失败就换成本地图标。
 */
function iconImage(host: string, className: string): HastNode {
  const [primary, ...rest] = iconUrls(host);
  return element("img", {
    className: [className],
    src: primary,
    ...(rest.length > 0 ? { "data-icon-alt": rest.join(" ") } : {}),
    alt: "",
    loading: "lazy",
    decoding: "async",
    referrerPolicy: "no-referrer",
  });
}

/** `github.com/<用户名>` 这种个人主页 → 用户名；仓库页、组织页、保留路径都返回空串 */
export function githubLogin(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.replace(/^www\./i, "").toLowerCase() !== "github.com") return "";
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length !== 1) return ""; // 恰好一段路径才是个人主页
    const login = segments[0];
    // GitHub 用户名：字母数字开头，可含连字符，最长 39
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(login)) return "";
    if (GITHUB_RESERVED.has(login.toLowerCase())) return "";
    return login;
  } catch {
    return "";
  }
}

/* ------------------------------ 树小工具 ------------------------------ */

function classList(properties: Record<string, unknown> | undefined): string[] {
  const value = properties?.className;
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  return [];
}

function addClass(node: HastNode, name: string): void {
  const list = classList(node.properties);
  if (list.includes(name)) return;
  list.push(name);
  node.properties = { ...(node.properties ?? {}), className: list };
}

function stringProperty(node: HastNode, key: string): string {
  const value = node.properties?.[key];
  return typeof value === "string" ? value : "";
}

function plainText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  const children = node.children;
  if (!children) return "";
  return children.map((child) => plainText(child)).join("");
}

/* ------------------------------ 判断与改写 ------------------------------ */

/** 段落里是不是只有一条链接（其余只有空白文本）？是则返回那条链接 */
function soleLink(paragraph: HastNode): HastNode | null {
  let link: HastNode | null = null;
  for (const child of paragraph.children ?? []) {
    if (child.type === "text") {
      if ((child.value ?? "").trim() !== "") return null;
      continue;
    }
    if (child.type === "element" && child.tagName === "a" && link === null) {
      link = child;
      continue;
    }
    return null; // <br>、图片、强调……都不算「单独一条链接」
  }
  return link;
}

/** 行内链接要不要加图标 */
function needsIcon(link: HastNode, inHeading: boolean): boolean {
  if (inHeading) return false;
  if (classList(link.properties).some((name) => SKIP_CLASSES.has(name))) return false;
  if (!/^https?:\/\//i.test(stringProperty(link, "href"))) return false;

  const children = link.children ?? [];
  if (children.length === 0) return false; // 空链接
  // 整块就是一张图（图片链接）不加图标，图标会挤在图片前
  if (children.length === 1 && children[0].type === "element" && children[0].tagName === "img") {
    return false;
  }
  return true;
}

function decorateIcon(link: HastNode): void {
  const host = linkHost(stringProperty(link, "href"));
  if (host === "") return;
  addClass(link, "link-external");
  link.children = [iconImage(host, "link-icon"), ...(link.children ?? [])];
}

/** 单独成行的链接 → 卡片 */
function decorateCard(link: HastNode): void {
  const href = stringProperty(link, "href");
  const host = linkHost(href);
  if (host === "") return; // 站内链接不做卡片

  const login = githubLogin(href);
  const label = plainText(link).trim();
  // 链接文字本身就是地址（裸链接自动成链）时，标题只留域名，不再重复印一遍
  const bare = label === "" || /^https?:\/\//i.test(label) || label.replace(/^www\./i, "").startsWith(host);

  addClass(link, "panel");
  addClass(link, "link-card");
  addClass(link, login === "" ? "link-card-site" : "link-card-github");
  link.properties = {
    ...(link.properties ?? {}),
    target: "_blank",
    rel: "noopener noreferrer",
  };
  if (login !== "") link.properties["data-github-login"] = login;

  if (login !== "") {
    // 骨架：脚本补齐前是「用户名 + github.com」，接口回来后再换成「名称 + @用户名 · github.com + 简介」
    link.children = [
      element("span", { className: ["link-card-avatar"], ariaHidden: "true" }),
      element("span", { className: ["link-card-text"] }, [
        element("span", { className: ["link-card-title"] }, [
          element("span", { "data-github-name": "" }, [text(login)]),
        ]),
        element("span", { className: ["link-card-host"], "data-github-meta": "" }, [text(host)]),
        element("span", { className: ["link-card-note"], "data-github-bio": "" }),
      ]),
    ];
    return;
  }

  link.children = [
    element("span", { className: ["link-card-icon"] }, [iconImage(host, "link-icon")]),
    element("span", { className: ["link-card-text"] }, [
      element("span", { className: ["link-card-title"] }, [text(bare ? host : label)]),
      ...(bare ? [] : [element("span", { className: ["link-card-host"] }, [text(host)])]),
    ]),
  ];
}

/* ------------------------------ 插件本身 ------------------------------ */

/** rehype 插件：给行内外链加图标，把单独成行的外链换成卡片。见文件头。 */
export function rehypeLinkCards() {
  return (tree: HastNode): void => {
    const walk = (node: HastNode, inHeading: boolean): void => {
      if (node.type === "element") {
        const tag = node.tagName ?? "";
        const heading = inHeading || HEADING_TAGS.has(tag);

        if (tag === "p") {
          const link = soleLink(node);
          if (link) decorateCard(link);
        } else if (tag === "a" && needsIcon(node, inHeading)) {
          decorateIcon(node);
        }

        for (const child of node.children ?? []) walk(child, heading);
        return;
      }
      for (const child of node.children ?? []) walk(child, inHeading);
    };

    walk(tree, false);
  };
}
