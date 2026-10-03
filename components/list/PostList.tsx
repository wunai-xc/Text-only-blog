"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

import PostCard from "./PostCard";
import LangSwitcher from "@/components/LangSwitcher";
import { icons, type IconName } from "@/lib/icons";
import {
  DEFAULT_FILTERS,
  DENSITIES,
  INLINE_SEARCH_FIELDS,
  LIST_TEXT,
  SEARCH_FIELD_WEIGHTS,
  SEARCH_INDEX_URL,
  SORTS,
  activeFilterCount,
  applyFilters,
  fromSearchDoc,
  groupHref,
  groupPosts,
  groupTitle,
  listQueryString,
  parseListQuery,
  readSavedDensity,
  saveDensity,
  type Density,
  type ListFacets,
  type ListFilters,
  type ListGroup,
  type ListPost,
  type ListSort,
} from "@/lib/list";
import type { Lang } from "@/lib/lang";
import type { SearchIndex } from "@/lib/search-index";

/**
 * 列表页（第 10 项）：搜索 + 筛选 + 密度，全在客户端
 *
 * 分工是这样的：
 *   - **文章本身来自构建期**（props 里的 `posts`）：服务端把这一页的文章、标签、分类、年份
 *     都算好传进来，所以没有 JS 也能读到完整列表 —— 列表不该依赖搜索框才存在（约定第 4 条）；
 *   - **搜索**才去读 `/search-index.json`（第 5 项的构建产物，含每篇正文前 1200 字），
 *     并且是**第一次输入时才读**：fuse.js 也是那一刻才动态 import，不进首屏包。
 *     字段与权重的唯一事实来源是索引自带的那份 `fields`（`lib/search-index.ts` 的
 *     `SEARCH_FIELDS`），别在这里写死字段名；
 *   - 索引读不到（路径不对 / 离线 / 版本不匹配）时**退回本页已有的字段**做匹配，
 *     并如实说明「这一次只匹配标题 / 标签 / 分类 / 摘要」—— 静态导出下
 *     `/search-index.json` 的产物路径是本项目里少数没被验证过的事（见 PROJECTS.md 第 8 节）；
 *   - **筛选**结果落在同一页；状态写进地址栏的查询串（`?tag=…&cat=…&year=…`），
 *     第 13 项的标签 / 分类页可以直接链过来，密度则记在 localStorage 里（它是偏好，不是筛选）。
 *   - **工具栏整块折叠**（`<details>`，默认收起，见下面 `panelOpen` 的注释）：
 *     展开态那一套控件很占地方，收起时只留一行「当前条件 + 显示几篇」；
 *   - **卡组按目录分块显示**（`content/README.md` 第 5 节）：`groups` 由服务端页面
 *     用 `getCardGroups()` + `toListGroup()` 算好传进来，这里只用 `groupPosts()` 把
 *     筛完的这列文章切开 —— 于是「明明是卡组」不会再显示成一片平铺的单篇卡片。
 *     一篇文章所属的目录不存在于 `groups` 里时退回「未分组」，不会凭空丢文章。
 *
 * 首帧一律按默认值渲染（服务端读不到 query 与 localStorage），挂载之后才应用真实状态 ——
 * 与第 7 项读主题 / 阅读偏好同一个做法，不然 React 会报水合不一致。
 */

/** 检索函数：把一次查询变成一列文章（本地索引用的是同一签名） */
type SearchFn = (query: string) => ListPost[];

interface Engine {
  /** index = 构建期索引（含正文）；inline = 只用本页已有的字段 */
  mode: "index" | "inline";
  search: SearchFn;
}

const DENSITY_ICONS: Record<Density, IconName> = {
  compact: "mdi:view-compact-outline",
  cozy: "mdi:view-agenda-outline",
  full: "mdi:text-box-outline",
};

const SORT_ICONS: Record<ListSort, IconName> = {
  newest: "mdi:sort-calendar-descending",
  oldest: "mdi:sort-calendar-ascending",
};

/** fuse.js 的选项：权重来自 lib/list.ts 的 SEARCH_FIELD_WEIGHTS，阈值偏宽松（中文短词也命中） */
function fuseOptions(fields: string[]) {
  return {
    keys: fields.map((field) => ({ name: field, weight: SEARCH_FIELD_WEIGHTS[field] ?? 1 })),
    threshold: 0.33,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: true,
  };
}

/** 读构建期索引；版本对不上、形状不对、取不到，都返回 null（由调用者退回本页字段） */
async function loadSearchIndex(expectedVersion: number): Promise<SearchIndex | null> {
  try {
    const response = await fetch(SEARCH_INDEX_URL, { cache: "force-cache" });
    if (!response.ok) return null;

    const data = (await response.json()) as Partial<SearchIndex>;
    if (!Array.isArray(data.docs) || !Array.isArray(data.fields)) return null;
    if (data.version !== expectedVersion) {
      console.warn(
        `[list] 搜索索引版本不匹配：代码期望 ${expectedVersion}，读到 ${String(data.version)}` +
          "（清单改动后要 +1 SEARCH_INDEX_VERSION，见 lib/search-index.ts）；本次只用本页字段。",
      );
      return null;
    }
    return data as SearchIndex;
  } catch (error) {
    console.warn(`[list] 读不到 ${SEARCH_INDEX_URL}，搜索退回本页已有字段。`, error);
    return null;
  }
}

export default function PostList({
  lang,
  posts,
  facets,
  groups,
  indexVersion,
  autoFocusSearch = false,
}: {
  lang: Lang;
  posts: ListPost[];
  facets: ListFacets;
  /**
   * 卡组（`content/README.md` 第 5 节）：由服务端页面用 `getCardGroups()` + `toListGroup()`
   * 算好传进来 —— 客户端拿不到 fs，也不该自己推一遍目录结构。
   * 传空数组就是「不做分组」：一列平铺的卡片（没有卡组的站点看着与以前完全一样）。
   */
  groups: ListGroup[];
  /** lib/search-index.ts 的 SEARCH_INDEX_VERSION，由服务端页面当 props 传下来 */
  indexVersion: number;
  /**
   * 挂载后把光标放进搜索框（第 13 项的 `/search/` 页用；列表页不传）。
   * 只在**专门的搜索页**这么做：那一页读者来就是为了打字，省一次点击是好事；
   * 列表页不自动抢焦点（有人是想翻清单，被抢走焦点会很烦，手机上还会弹起键盘）。
   */
  autoFocusSearch?: boolean;
}) {
  const t = LIST_TEXT[lang];
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  /**
   * 工具栏（搜索 + 五组筛选 + 密度 + AI + 语言）**整块折叠**，默认收起 ——
   * 一屏是有限的，展开的工具栏会占掉整整一屏，读者来这一页是看文章的。
   * 首帧一律 `false`（服务端读不到地址栏）；只有**专门的搜索页**（`autoFocusSearch`）
   * 挂载后才展开 —— 那一页读者来就是为了打字。带筛选条件的地址（标签页链过来的那些）
   * 也保持收起：条件已经显示在收起那一行里（`activeNames`），没必要把一整套控件摊开。
   */
  const [panelOpen, setPanelOpen] = useState(false);
  const engineRef = useRef<Engine | null>(null);
  const loadingRef = useRef(false);
  const hydrated = useRef(false);
  /** 挂载后的第一次「地址栏同步」不写：那一次地址栏就是刚读进来的那份 */
  const skipUrlWrite = useRef(true);

  /* ---- 首帧之后：地址栏的筛选 + 本机记的密度（顺序：URL > localStorage > 默认） ---- */
  useEffect(() => {
    const patch = parseListQuery(window.location.search);
    const saved = readSavedDensity();
    if (patch.density === undefined && saved) patch.density = saved;
    hydrated.current = true;
    if (Object.keys(patch).length > 0) setFilters((current) => ({ ...current, ...patch }));
    // 工具栏**不会**因为「已经有筛选生效」而自动展开：当前条件已经写在收起那一行里
    //（summary 的「当前条件」），读者要改哪一项再自己点开 —— 站长明确要求默认收起。
    if (autoFocusSearch) setPanelOpen(true);
  }, [autoFocusSearch]);

  /* ---- 专门的搜索页：工具栏展开、光标放进搜索框（见 autoFocusSearch 的注释） ---- */
  useEffect(() => {
    if (!autoFocusSearch || !panelOpen) return;
    const { activeElement } = document;
    // 读者已经自己点到别处去了就不抢（例如他刚点开设置抽屉）
    if (activeElement instanceof HTMLElement && activeElement !== document.body) return;
    const input = document.getElementById("list-search");
    if (input instanceof HTMLInputElement) input.focus();
  }, [autoFocusSearch, panelOpen]);

  /* ---- 筛选与密度：地址栏跟着走（用 replaceState，不产生历史记录、不触发路由滚动） ---- */
  useEffect(() => {
    if (!hydrated.current) return;
    if (skipUrlWrite.current) {
      // 挂载后的第一次：地址栏已经是刚读进来的那份，别用默认状态把它盖掉
      skipUrlWrite.current = false;
      return;
    }
    const url = `${window.location.pathname}${listQueryString(filters)}`;
    window.history.replaceState(null, "", url);
  }, [filters]);

  const update = useCallback((patch: Partial<ListFilters>) => {
    setFilters((current) => {
      const next = { ...current, ...patch };
      if (patch.density && patch.density !== current.density) saveDensity(next.density);
      return next;
    });
  }, []);

  /* ---- 搜索：第一次输入时才读索引 + 动态 import fuse.js ---- */
  const loadEngine = useCallback(async (): Promise<Engine | "error"> => {
    let FuseModule: typeof import("fuse.js");
    try {
      FuseModule = await import("fuse.js");
    } catch (error) {
      console.warn("[list] fuse.js 没能加载，搜索不可用（筛选不受影响）。", error);
      return "error";
    }
    const Fuse = FuseModule.default;

    const remote = await loadSearchIndex(indexVersion);
    if (remote) {
      // 索引是**全语言**的（第 5 项的设计），列表页只看当前语言这一份
      const docs = remote.docs.filter((doc) => doc.lang === lang);
      const fields = remote.fields.length > 0 ? remote.fields : [...INLINE_SEARCH_FIELDS];
      const fuse = new Fuse(docs, fuseOptions(fields));
      return {
        mode: "index",
        // 形参必须自己标类型：这个函数的返回类型是联合（Engine | "error"），
        // 联合里的对象字面量属性拿不到上下文类型，不标就是隐式 any（TS7006）。
        search: (query: string) => fuse.search(query).map((result) => fromSearchDoc(result.item)),
      };
    }

    const fuse = new Fuse(posts, fuseOptions([...INLINE_SEARCH_FIELDS]));
    return {
      mode: "inline",
      search: (query: string) => fuse.search(query).map((result) => result.item),
    };
  }, [indexVersion, lang, posts]);

  const ensureEngine = useCallback(async () => {
    if (engineRef.current || loadingRef.current) return;
    loadingRef.current = true;
    setSearchStatus("loading");
    const result = await loadEngine();
    loadingRef.current = false;
    if (result === "error") {
      setSearchStatus("error");
      return;
    }
    engineRef.current = result;
    setEngine(result);
    setSearchStatus("idle");
  }, [loadEngine]);

  const query = filters.q.trim();

  useEffect(() => {
    if (query !== "") void ensureEngine();
  }, [query, ensureEngine]);

  const matches = useMemo(() => (query !== "" && engine ? engine.search(query) : null), [engine, query]);

  /** 搜索命中也要过一遍同一套筛选与排序（两条路共用 applyFilters） */
  const visible = useMemo(() => applyFilters(matches ?? posts, filters), [matches, posts, filters]);

  const activeCount = activeFilterCount(filters);
  const searchNote =
    searchStatus === "error"
      ? t.searchErrorNote
      : searchStatus === "loading"
        ? t.searchLoading
        : engine?.mode === "inline"
          ? t.searchInlineNote
          : engine?.mode === "index" && query !== ""
            ? t.searchResults(matches?.length ?? 0)
            : engine?.mode === "index"
              ? t.searchIndexNote
              : t.searchHint;

  function toggleTag(name: string) {
    update({
      tags: filters.tags.includes(name)
        ? filters.tags.filter((tag) => tag !== name)
        : [...filters.tags, name],
    });
  }

  function toggleCategory(name: string) {
    update({
      categories: filters.categories.includes(name)
        ? filters.categories.filter((category) => category !== name)
        : [...filters.categories, name],
    });
  }

  /* ---- 卡组：把筛完的这列文章按目录切开（纯函数在 lib/list.ts，这里只调一次） ---- */
  const grouping = useMemo(() => groupPosts(visible, groups), [visible, groups]);

  /** 收起时那一行里显示的「当前条件」，例如 `#笔记 · 2026 年`（空则由 filtersNone 兜底） */
  const activeNames: string[] = [];
  if (query !== "") activeNames.push(`“${query}”`);
  for (const tag of filters.tags) activeNames.push(`#${tag}`);
  activeNames.push(...filters.categories);
  if (filters.year !== null) activeNames.push(t.timeYear(filters.year));
  if (filters.hideAI !== DEFAULT_FILTERS.hideAI) activeNames.push(t.aiOn);
  if (filters.sort !== DEFAULT_FILTERS.sort) {
    const option = SORTS.find((item) => item.id === filters.sort);
    if (option) activeNames.push(option[lang]);
  }

  /** 一列卡片（组内与未分组共用；密度的排版差异全在 CSS 的 `.post-card[data-density]`） */
  function renderGrid(list: ListPost[]) {
    return (
      <div className="list-grid" data-density={filters.density}>
        {list.map((post) => (
          <PostCard key={post.slug} post={post} lang={lang} density={filters.density} />
        ))}
      </div>
    );
  }

  return (
    <div className="list">
      {/* 工具栏：**整块折叠**（`<details>`，默认收起）。
          收起时只有一行：一个「筛选」开关 + 当前生效的条件 + 显示几篇。
          用 `<details>` 而不是自己造派发逻辑：没有 JS 也能展开（这一页不依赖搜索也能读）。 */}
      <details
        className="list-toolbar panel"
        open={panelOpen}
        onToggle={(event) => setPanelOpen(event.currentTarget.open)}
      >
        <summary
          className="list-toolbar-bar"
          aria-label={panelOpen ? t.filtersHide : t.filtersShow}
        >
          <span className="list-toolbar-toggle">
            <Icon icon={icons["mdi:filter-outline"]} width="1em" height="1em" />
            {t.filtersLabel}
            {activeCount > 0 ? ` · ${t.filtered} ${activeCount}` : ""}
            <span className="list-toolbar-chevron" aria-hidden="true">
              <Icon icon={icons["mdi:chevron-down"]} width="1em" height="1em" />
            </span>
          </span>
          <span className="list-toolbar-active">
            {activeNames.length > 0 ? activeNames.join(" · ") : t.filtersNone}
          </span>
          <span className="list-count">{t.results(visible.length, posts.length)}</span>
        </summary>

        <div className="list-toolbar-panel">
          {/* 搜索 */}
          <div className="list-field">
            <label className="list-field-label" htmlFor="list-search">
              <Icon icon={icons["mdi:magnify"]} width="1em" height="1em" />
              {t.searchLabel}
            </label>
            <div className="list-search">
              <input
                id="list-search"
                className="list-search-input"
                type="search"
                value={filters.q}
                placeholder={t.searchPlaceholder}
                autoComplete="off"
                onChange={(event) => update({ q: event.target.value })}
              />
              {filters.q !== "" ? (
                <button
                  type="button"
                  className="icon-button"
                  title={t.searchClear}
                  aria-label={t.searchClear}
                  onClick={() => update({ q: "" })}
                >
                  <Icon icon={icons["mdi:magnify-close"]} width="1em" height="1em" />
                </button>
              ) : null}
            </div>
            <p className="list-hint" data-tone={searchStatus === "error" ? "warn" : undefined}>
              {searchStatus === "error" ? (
                <Icon icon={icons["mdi:alert-circle-outline"]} width="1em" height="1em" />
              ) : null}
              {searchNote}
            </p>
          </div>

          {/* 标签 */}
          {facets.tags.length > 0 ? (
            <div className="list-field">
              <span className="list-field-label">
                <Icon icon={icons["mdi:tag-multiple-outline"]} width="1em" height="1em" />
                {t.tagsLabel}
              </span>
              <div className="list-chips">
                {facets.tags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    className="list-chip"
                    aria-pressed={filters.tags.includes(tag.name)}
                    onClick={() => toggleTag(tag.name)}
                  >
                    {tag.name}
                    <span className="list-chip-count">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* 分类 */}
          {facets.categories.length > 0 ? (
            <div className="list-field">
              <span className="list-field-label">
                <Icon icon={icons["mdi:shape-outline"]} width="1em" height="1em" />
                {t.categoriesLabel}
              </span>
              <div className="list-chips">
                {facets.categories.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    className="list-chip"
                    aria-pressed={filters.categories.includes(category.name)}
                    onClick={() => toggleCategory(category.name)}
                  >
                    {category.name}
                    <span className="list-chip-count">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* 时间（年份由这一页的数据推出来，见 lib/list.ts 的 yearsOf） */}
          <div className="list-field">
            <span className="list-field-label">
              <Icon icon={icons["mdi:calendar-outline"]} width="1em" height="1em" />
              {t.timeLabel}
            </span>
            <div className="list-chips">
              <button
                type="button"
                className="list-chip"
                aria-pressed={filters.year === null}
                onClick={() => update({ year: null })}
              >
                {t.timeAll}
              </button>
              {facets.years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className="list-chip"
                  aria-pressed={filters.year === year}
                  onClick={() => update({ year })}
                >
                  {t.timeYear(year)}
                </button>
              ))}
            </div>
          </div>

          {/* 排序 */}
          <div className="list-field">
            <span className="list-field-label">
              <Icon icon={icons["mdi:sort-calendar-descending"]} width="1em" height="1em" />
              {t.sortLabel}
            </span>
            <div className="list-chips">
              {SORTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="list-chip"
                  aria-pressed={filters.sort === option.id}
                  onClick={() => update({ sort: option.id })}
                >
                  <Icon icon={icons[SORT_ICONS[option.id]]} width="1em" height="1em" />
                  {option[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* 密度（第 11 项的三档；这一项记在本机，不写进地址栏的默认值） */}
          <div className="list-field">
            <span className="list-field-label">
              <Icon icon={icons["mdi:view-agenda-outline"]} width="1em" height="1em" />
              {t.densityLabel}
            </span>
            <div className="list-chips">
              {DENSITIES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="list-chip"
                  aria-pressed={filters.density === option.id}
                  title={lang === "zh" ? option.hintZh : option.hintEn}
                  onClick={() => update({ density: option.id })}
                >
                  <Icon icon={icons[DENSITY_ICONS[option.id]]} width="1em" height="1em" />
                  {option[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* AI：默认隐藏 */}
          <div className="list-field">
            <span className="list-field-label">
              <Icon icon={icons["mdi:robot-outline"]} width="1em" height="1em" />
              {t.aiLabel}
            </span>
            <div className="list-chips">
              <button
                type="button"
                className="list-chip"
                aria-pressed={filters.hideAI}
                onClick={() => update({ hideAI: !filters.hideAI })}
              >
                <Icon icon={icons["mdi:check"]} width="1em" height="1em" />
                {filters.hideAI ? t.aiOn : t.aiOff}
              </button>
            </div>
            <p className="list-hint">{t.aiHint}</p>
          </div>

          {/* 语言：切到另一种语言的同一页（复用第 7 项的 LangSwitcher，路径自己算） */}
          <div className="list-field">
            <span className="list-field-label">
              <Icon icon={icons["mdi:translate"]} width="1em" height="1em" />
              {t.languageLabel}
            </span>
            <div className="list-chips">
              <LangSwitcher lang={lang} className="list-chip" />
            </div>
          </div>

          <div className="list-toolbar-foot">
            <span className="list-count">{t.results(visible.length, posts.length)}</span>
            {activeCount > 0 ? (
              <button
                type="button"
                className="settings-opt"
                onClick={() => update({ ...DEFAULT_FILTERS, density: filters.density })}
              >
                <Icon icon={icons["mdi:filter-variant-remove"]} width="1em" height="1em" />
                {t.clear}
              </button>
            ) : null}
          </div>
        </div>
      </details>

      {visible.length > 0 ? (
        grouping.groups.length > 0 ? (
          /* 有卡组就按卡组显示：每组一个组头（组名 + 篇数 + 说明），组内还是同一套卡片。
             「未分组」那一块只在**确实有卡组**时才出现 —— 一个平铺的站点看着与以前一样。 */
          <div className="list-groups">
            {grouping.ungrouped.length > 0 ? (
              <section className="list-group" aria-label={t.groups.ungrouped}>
                <header className="list-group-head">
                  <h2 className="list-group-title">{t.groups.ungrouped}</h2>
                  <span className="list-group-count">
                    {t.groups.count(grouping.ungrouped.length)}
                  </span>
                  <p className="list-group-desc">{t.groups.ungroupedNote}</p>
                </header>
                {renderGrid(grouping.ungrouped)}
              </section>
            ) : null}

            {grouping.groups.map((entry) => (
              <section
                className="list-group"
                id={`group-${entry.group.slug}`}
                key={entry.group.slug}
                aria-label={groupTitle(entry.group)}
              >
                <header className="list-group-head">
                  <p className="list-group-kicker">
                    <Icon icon={icons["mdi:folder-outline"]} width="1em" height="1em" />
                    {t.groups.kicker}
                    {entry.group.explicit ? null : ` · ${entry.group.slug}/`}
                  </p>
                  <h2 className="list-group-title">
                    {/* 组头链到卡组自己的页面（/zh/posts/notes/）—— 与 sitemap、卡组页同一份地址 */}
                    <a href={groupHref(lang, entry.group.slug)}>{groupTitle(entry.group)}</a>
                  </h2>
                  <span className="list-group-count">
                    {t.groups.count(entry.posts.length)}
                  </span>
                  {entry.group.description ? (
                    <p className="list-group-desc">{entry.group.description}</p>
                  ) : null}
                </header>
                {renderGrid(entry.posts)}
              </section>
            ))}
          </div>
        ) : (
          renderGrid(visible)
        )
      ) : (
        <p className="list-empty panel">
          {query !== "" && (matches?.length ?? 0) === 0 ? t.searchNoResult(query) : t.emptyFiltered}
        </p>
      )}
    </div>
  );
}
