import HomeBlockHead from "./HomeBlockHead";
import { HOME_TEXT } from "@/lib/home";
import type { Lang } from "@/lib/site";
import { transformCjkText } from "@/lib/typography";

/**
 * 第 6 栏：阅读改善（第 9 项）
 *
 * 作者的「阅读改善展示」。这一栏最实在的展示是**拿同一句话跑一遍排版函数**：
 * `transformCjkText` 就是正文渲染管线里用的那一个（第 4 项，lib/typography.ts），
 * 所以「优化前 / 优化后」不是插图，是真的调用结果，改动计数也是真的。
 * 在服务端（构建期）算一次就够 —— 输出是静态 HTML，客户端不带这个函数。
 *
 * 下面的规则清单与「已经做到的」清单都是文案（lib/home.ts），
 * 最后一条（悬浮目录与进度条）明确指着第 12 项，避免把没做的东西说成做了。
 */
export default function HomeReading({ lang }: { lang: Lang }) {
  const t = HOME_TEXT[lang].reading;
  const { text: fixed, counts } = transformCjkText(t.sample);

  return (
    <>
      <HomeBlockHead id="reading" lang={lang} />
      <p className="home-note">{t.lead}</p>
      <div className="home-compare">
        <div className="home-compare-box">
          <span className="home-compare-label">{t.before}</span>
          {t.sample}
        </div>
        <div className="home-compare-box">
          <span className="home-compare-label">{t.after}</span>
          {fixed}
        </div>
      </div>
      <p className="home-tokens">{t.counts(counts)}</p>

      <p className="home-kicker">{t.rulesLabel}</p>
      <ul className="home-list">
        {t.rules.map((rule) => (
          <li className="home-item" key={rule}>
            <span className="home-item-text">{rule}</span>
          </li>
        ))}
      </ul>

      <p className="home-kicker">{t.featuresLabel}</p>
      <ul className="home-list">
        {t.features.map((feature) => (
          <li className="home-item" key={feature}>
            <span className="home-item-text">{feature}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
