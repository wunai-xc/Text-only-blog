/**
 * lib/icons.ts —— 站点用到的 MDI 图标（第 7 项：框架 UI）
 *
 * 为什么要这个文件（而不是在组件里直接 import 图标）：`@iconify/react/offline`
 * 拿到的是**图标数据**，不是图标名 —— 它不会去请求 iconify 的 API。所以要么在组件里
 * 逐个 import 深路径，要么集中在这里。
 * 集中一处的好处：图标名与数据的对应关系只有这一份，`.d.ts` 里那些字符串键
 * （"mdi:cog-outline"）拼错时 TypeScript 会直接报错。
 *
 * 约定：
 *   - 只从 `@iconify/icons-mdi` 深路径导入（本地打包 → 运行时不发请求 → 国内可用、
 *     断网可用、PWA 离线可用）；
 *   - 图标名都对着 api.iconify.design/mdi/<name>.svg 核过存在；
 *   - 加图标时顺手按用途分组、写一行注释说明用在哪。
 */

import type { IconifyIcon } from "@iconify/react/offline";

/* 导航（顶栏的品牌小字行与页脚那一排入口都用其中的一部分） */
import mdiHomeOutline from "@iconify/icons-mdi/home-outline";
import mdiPostOutline from "@iconify/icons-mdi/post-outline";
import mdiTagMultipleOutline from "@iconify/icons-mdi/tag-multiple-outline";
import mdiShapeOutline from "@iconify/icons-mdi/shape-outline";
import mdiArchiveOutline from "@iconify/icons-mdi/archive-outline";
import mdiMagnify from "@iconify/icons-mdi/magnify";
import mdiAccountMultipleOutline from "@iconify/icons-mdi/account-multiple-outline";
import mdiAccountOutline from "@iconify/icons-mdi/account-outline";
/* 外观切换（四选一：跟随系统 / 纸 / 亮 / 暗） */
import mdiThemeLightDark from "@iconify/icons-mdi/theme-light-dark";
import mdiBookOpenOutline from "@iconify/icons-mdi/book-open-outline";
import mdiWeatherSunny from "@iconify/icons-mdi/weather-sunny";
import mdiWeatherNight from "@iconify/icons-mdi/weather-night";
/* 设置中心 */
import mdiCogOutline from "@iconify/icons-mdi/cog-outline";
import mdiPaletteOutline from "@iconify/icons-mdi/palette-outline";
import mdiFormatSize from "@iconify/icons-mdi/format-size";
import mdiArrowExpandHorizontal from "@iconify/icons-mdi/arrow-expand-horizontal";
import mdiFormatLineSpacing from "@iconify/icons-mdi/format-line-spacing";
import mdiTranslate from "@iconify/icons-mdi/translate";
import mdiCheck from "@iconify/icons-mdi/check";
import mdiRestore from "@iconify/icons-mdi/restore";
import mdiClose from "@iconify/icons-mdi/close";
/* 页脚 */
import mdiEmailOutline from "@iconify/icons-mdi/email-outline";
import mdiGithub from "@iconify/icons-mdi/github";
import mdiSourceRepository from "@iconify/icons-mdi/source-repository";
import mdiRss from "@iconify/icons-mdi/rss";
/* 列表页（第 10 项：搜索 + 筛选）与文章卡片（第 11 项：三档密度） */
import mdiFilterOutline from "@iconify/icons-mdi/filter-outline";
import mdiFilterVariantRemove from "@iconify/icons-mdi/filter-variant-remove";
import mdiCalendarOutline from "@iconify/icons-mdi/calendar-outline";
import mdiSortCalendarDescending from "@iconify/icons-mdi/sort-calendar-descending";
import mdiSortCalendarAscending from "@iconify/icons-mdi/sort-calendar-ascending";
import mdiViewCompactOutline from "@iconify/icons-mdi/view-compact-outline";
import mdiViewAgendaOutline from "@iconify/icons-mdi/view-agenda-outline";
import mdiTextBoxOutline from "@iconify/icons-mdi/text-box-outline";
import mdiRobotOutline from "@iconify/icons-mdi/robot-outline";
import mdiMagnifyClose from "@iconify/icons-mdi/magnify-close";
import mdiAlertCircleOutline from "@iconify/icons-mdi/alert-circle-outline";
/** 图标：列表页的「卡组」组头（文件夹）与折叠工具栏的箭头 */
import mdiFolderOutline from "@iconify/icons-mdi/folder-outline";
import mdiChevronDown from "@iconify/icons-mdi/chevron-down";
/* 文章页（第 12 项：悬浮目录 / 进度与回顶 / 上下篇 / 评论） */
import mdiFormatListBulleted from "@iconify/icons-mdi/format-list-bulleted";
import mdiArrowUp from "@iconify/icons-mdi/arrow-up";
import mdiArrowLeft from "@iconify/icons-mdi/arrow-left";
import mdiArrowRight from "@iconify/icons-mdi/arrow-right";
import mdiCommentTextOutline from "@iconify/icons-mdi/comment-text-outline";

export const icons = {
  /* 导航 */
  "mdi:home-outline": mdiHomeOutline,
  "mdi:post-outline": mdiPostOutline,
  "mdi:tag-multiple-outline": mdiTagMultipleOutline,
  "mdi:shape-outline": mdiShapeOutline,
  "mdi:archive-outline": mdiArchiveOutline,
  "mdi:magnify": mdiMagnify,
  "mdi:account-multiple-outline": mdiAccountMultipleOutline,
  "mdi:account-outline": mdiAccountOutline,
  /* 外观 */
  "mdi:theme-light-dark": mdiThemeLightDark,
  "mdi:book-open-outline": mdiBookOpenOutline,
  "mdi:weather-sunny": mdiWeatherSunny,
  "mdi:weather-night": mdiWeatherNight,
  /* 设置 */
  "mdi:cog-outline": mdiCogOutline,
  "mdi:palette-outline": mdiPaletteOutline,
  "mdi:format-size": mdiFormatSize,
  "mdi:arrow-expand-horizontal": mdiArrowExpandHorizontal,
  "mdi:format-line-spacing": mdiFormatLineSpacing,
  "mdi:translate": mdiTranslate,
  "mdi:check": mdiCheck,
  "mdi:restore": mdiRestore,
  "mdi:close": mdiClose,
  /* 页脚 */
  "mdi:email-outline": mdiEmailOutline,
  "mdi:github": mdiGithub,
  "mdi:source-repository": mdiSourceRepository,
  "mdi:rss": mdiRss,
  /* 列表页与卡片 */
  "mdi:filter-outline": mdiFilterOutline,
  "mdi:filter-variant-remove": mdiFilterVariantRemove,
  "mdi:calendar-outline": mdiCalendarOutline,
  "mdi:sort-calendar-descending": mdiSortCalendarDescending,
  "mdi:sort-calendar-ascending": mdiSortCalendarAscending,
  "mdi:view-compact-outline": mdiViewCompactOutline,
  "mdi:view-agenda-outline": mdiViewAgendaOutline,
  "mdi:text-box-outline": mdiTextBoxOutline,
  "mdi:robot-outline": mdiRobotOutline,
  "mdi:magnify-close": mdiMagnifyClose,
  "mdi:alert-circle-outline": mdiAlertCircleOutline,
  /* 列表页：卡组组头的文件夹、折叠工具栏的箭头 */
  "mdi:folder-outline": mdiFolderOutline,
  "mdi:chevron-down": mdiChevronDown,
  /* 文章页 */
  "mdi:format-list-bulleted": mdiFormatListBulleted,
  "mdi:arrow-up": mdiArrowUp,
  "mdi:arrow-left": mdiArrowLeft,
  "mdi:arrow-right": mdiArrowRight,
  "mdi:comment-text-outline": mdiCommentTextOutline,
} as const;

export type IconName = keyof typeof icons;

export function getIcon(name: IconName): IconifyIcon {
  return icons[name];
}
