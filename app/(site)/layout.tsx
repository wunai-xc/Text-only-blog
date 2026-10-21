import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

/**
 * 全站框架层（第 7 项）
 *
 * 顶栏与页脚放在这里而不是各页面里：每加一个页面就自动带上同样的框架，
 * 不需要在每个 page.tsx 里重复 import 两行。
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <div className="site-main">{children}</div>
      <SiteFooter />
    </div>
  );
}
