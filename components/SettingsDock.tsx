"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/offline";

import SettingsCenter from "./SettingsCenter";
import { icons } from "@/lib/icons";
import type { Lang } from "@/lib/lang";
import { SITE } from "@/lib/site";

/**
 * 左下角的设置入口 + 设置抽屉（第 7 项）
 *
 * 一颗固定定位的齿轮（视口左下角，`position: fixed`，在任何页面、任何滚动位置都能摸到），
 * 点开从左侧滑出设置抽屉。抽屉是「桌面/手机同一套」的：
 *   - 角色给足：按钮 aria-expanded / aria-haspopup，抽屉 role="dialog" aria-modal，
 *     打开时把焦点移到抽屉上（`tabIndex={-1}`），Esc 关闭，点遮罩关闭；
 *   - 打开时锁 body 滚动（否则手机上一划背景就跟着跑）；
 *   - 动效只有 0.18s 的滑入，且写在 `prefers-reduced-motion: no-preference` 里
 *     （约定第 5 条：动效必须尊重这个媒体查询）。
 *
 * 设置内容本身在 components/SettingsCenter.tsx（它不管容器，所以第 13 项的
 * /[lang]/settings/ 页面可以复用同一份内容）。
 */
export default function SettingsDock({ lang }: { lang: Lang }) {
  const t = SITE.i18n[lang];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  /**
   * 换页就关掉抽屉。抽屉里那颗「语言」是个 <Link>（/zh/x/ ↔ /en/x/），
   * 点完如果抽屉还留着倒也不算错，但要紧的是：万一这个组件跨路由没被卸载，
   * 上面那段 effect 会把 body 的 overflow 一直锁着 —— 新页面就滚不动了。
   * 一行保险，换语言、点任何链接都不会留下锁住的页面。
   */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="settings-fab"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? t.settingsClose : t.settingsOpen}
        title={open ? t.settingsClose : t.settingsOpen}
      >
        <Icon icon={icons["mdi:cog-outline"]} width="1.25em" height="1.25em" />
      </button>

      {open ? (
        <>
          <div
            className="settings-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="settings-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t.settingsTitle}
            tabIndex={-1}
            ref={drawerRef}
          >
            <div className="settings-drawer-head">
              <span className="settings-drawer-title">{t.settingsTitle}</span>
              <button
                type="button"
                className="icon-button"
                onClick={() => setOpen(false)}
                aria-label={t.settingsClose}
                title={t.settingsClose}
              >
                <Icon icon={icons["mdi:close"]} width="1.1em" height="1.1em" />
              </button>
            </div>
            <div className="settings-drawer-body">
              <SettingsCenter lang={lang} />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
