import { HOME_TEXT, homeNumber, type HomeBlockId } from "@/lib/home";
import type { Lang } from "@/lib/site";

/**
 * 栏头（第 9 项）：栏号 + 一句小字 + 栏名。
 *
 * 八栏共用这一个 —— 栏号由 lib/home.ts 的版面表推出来（homeNumber），
 * 所以调顺序时不用去改八处文案，也不会出现「编号对、内容错位」。
 * 标题是 <h2>：一页八个二级标题，正好对上侧边指示器的八项
 * （指示器的锚点指向页面里的 <section id="home-…">）。
 *
 * 服务端组件：它只读文案表，没有任何交互，所以不进客户端包。
 */
export default function HomeBlockHead({ id, lang }: { id: HomeBlockId; lang: Lang }) {
  const block = HOME_TEXT[lang].blocks[id];
  return (
    <>
      <p className="home-kicker">
        <span className="home-no">{homeNumber(id)}</span>
        <span>{block.kicker}</span>
        {/* 剩下的一小段填一条虚线：图纸上那种「标题栏」的气质 */}
        <span className="home-rule" aria-hidden="true" />
      </p>
      <h2 className="home-title">{block.title}</h2>
    </>
  );
}
