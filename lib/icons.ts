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
 *   - 图标数据取自 lib/icons-data.ts（只内联用到的图标；本地打包 → 运行时不发请求 →
 *     国内可用、断网可用、PWA 离线可用）；
 *   - 图标名都对着 api.iconify.design/mdi/<name>.svg 核过存在；
 *   - 加图标时顺手按用途分组、写一行注释说明用在哪。
 */

/* 图标数据在 lib/icons-data.ts（只内联用到的 54 个，原因见那个文件的说明）。
   分组注释保留在下面的图标表里 —— 加图标时先在 icons-data.ts 补数据，再来这里登记。 */
import {
  mdiAccountMultipleOutline,
  mdiAccountOutline,
  mdiAlertCircleOutline,
  mdiArchiveOutline,
  mdiArrowExpandHorizontal,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowUp,
  mdiBookOpenOutline,
  mdiCalendarOutline,
  mdiCampfire,
  mdiCheck,
  mdiChevronDown,
  mdiClose,
  mdiCogOutline,
  mdiCommentTextOutline,
  mdiCompassRose,
  mdiContrastCircle,
  mdiDeleteOutline,
  mdiDownload,
  mdiEmailOutline,
  mdiFilterOutline,
  mdiFilterVariantRemove,
  mdiFolderOutline,
  mdiFormatFont,
  mdiFormatIndentIncrease,
  mdiFormatLineSpacing,
  mdiFormatListBulleted,
  mdiFormatSize,
  mdiGithub,
  mdiHomeOutline,
  mdiMagnify,
  mdiMagnifyClose,
  mdiPaletteOutline,
  mdiPaletteSwatchOutline,
  mdiPostOutline,
  mdiPrinter,
  mdiRestore,
  mdiRobotOutline,
  mdiRss,
  mdiShapeOutline,
  mdiSortCalendarAscending,
  mdiSortCalendarDescending,
  mdiSourceRepository,
  mdiTagMultipleOutline,
  mdiTextBoxOutline,
  mdiThemeLightDark,
  mdiTreeOutline,
  mdiTranslate,
  mdiUpload,
  mdiViewAgendaOutline,
  mdiViewCompactOutline,
  mdiWeatherNight,
  mdiWeatherSunny,
} from "./icons-data";

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
  "mdi:compass-rose": mdiCompassRose,
  "mdi:tree-outline": mdiTreeOutline,
  "mdi:campfire": mdiCampfire,
  "mdi:contrast-circle": mdiContrastCircle,
  /* 设置 */
  "mdi:cog-outline": mdiCogOutline,
  "mdi:palette-outline": mdiPaletteOutline,
  "mdi:palette-swatch-outline": mdiPaletteSwatchOutline,
  "mdi:format-font": mdiFormatFont,
  "mdi:format-size": mdiFormatSize,
  "mdi:arrow-expand-horizontal": mdiArrowExpandHorizontal,
  "mdi:format-line-spacing": mdiFormatLineSpacing,
  "mdi:format-indent-increase": mdiFormatIndentIncrease,
  "mdi:translate": mdiTranslate,
  "mdi:check": mdiCheck,
  "mdi:restore": mdiRestore,
  "mdi:close": mdiClose,
  "mdi:upload": mdiUpload,
  "mdi:delete-outline": mdiDeleteOutline,
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
  "mdi:download": mdiDownload,
  "mdi:printer": mdiPrinter,
} as const;

export type IconName = keyof typeof icons;
