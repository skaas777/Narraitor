import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LandingWorldPane from './LandingWorldPane';
import { HOMEPAGE_SHOWCASE } from './homepageShowcase.generated';

/**
 * Landing — the front door for someone who has never heard of Narraitor and is
 * deciding, in about fifteen seconds, whether this is a toy or a real thing.
 *
 * The argument is made with the product's own output rather than claims about
 * it: pick a world and the page becomes that world, down to the prose. See
 * .impeccable/surfaces/route.md for the direction and what it rules out.
 *
 * Server component, deliberately. The world switcher is native radios plus
 * sibling and :has() selectors in landing.css, so it needs no JavaScript and
 * all four worlds ship in the HTML. Structural treatment lives under
 * .component-landing* there.
 */

const GEMINI_KEY_URL = 'https://aistudio.google.com/apikey';
const START_HREF = '/worlds/create';
/* "Build your world", not "Start your story". The button opens a five-step
   wizard whose first screen asks for a genre, so promising the story is the
   same overstatement the hero copy already had to walk back, one level down.
   It also sells the wizard as the payoff rather than the tollbooth, which is
   what the whole page below has spent its length arguing. */
const START_LABEL = "创建你的世界";

export default function Landing() {
  return (
    <div className="component-landing">
      <section
        className="component-landing-band component-landing-hero"
        aria-labelledby="landing-hero-heading"
      >
        {HOMEPAGE_SHOWCASE.map((world, index) => (
          <Image
            key={world.id}
            className="component-landing-hero-art"
            data-world={world.id}
            src={`/visual-assets/worlds/${world.id}.webp`}
            /* Decorative: the plate strip below names each world in text, and
               four alt strings on stacked images would be read out as four
               unrelated descriptions with no way to tell which is showing. */
            alt=""
            fill
            sizes="(max-width: 1296px) 100vw, 1200px"
            priority={index === 0}
          />
        ))}
        <div className="component-landing-hero-scrim" aria-hidden="true" />

        <div className="component-landing-band-inner component-landing-hero-copy">
          <h1 id="landing-hero-heading" className="component-landing-title">
            游玩一段呼应你所建世界的故事
          </h1>
          {/* Not "you describe the world". Describing it is one step of five,
              and the other four turn that description into attributes and
              skills you review and edit. Calling the whole thing a description
              makes this sound like a prompt box, which is the shape of product
              Narraitor is positioned against. Name the object instead: the
              repeated "them" is the argument, one thing in three roles.

              No author is named either. The app proposes the attributes and
              skills from the description and the player keeps or edits them,
              so neither "you build" nor "it built" is true on its own, and
              the pane below already says "what it built".

              "That world" leans on the headline for ownership so the sentence
              can open on the mechanism instead of restating whose world it
              is. The headline earns that: "answers to" is the differentiator,
              a story bound by rules it did not choose, and the lead is where
              the binding gets named. */}
          <p className="component-landing-lead">
            那个世界拥有属性与技能。故事由它们书写，你的选择也要接受它们的考验。
          </p>
          <div className="component-landing-actions">
            <Link href={START_HREF} className="component-landing-cta">
              {START_LABEL}
            </Link>
            <Link href="/about" className="component-landing-cta-secondary">
              运作方式
            </Link>
          </div>
        </div>
      </section>

      <div className="component-landing-selector">
        {HOMEPAGE_SHOWCASE.map((world) => (
          <p
            key={world.id}
            className="component-landing-showing"
            data-world={world.id}
          >
            <span className="component-landing-label">正在展示</span>
            <span className="component-landing-selector-title">{world.caption}</span>
          </p>
        ))}

        <fieldset className="component-landing-plates">
          <legend className="sr-only">选择要预览的世界</legend>
          {HOMEPAGE_SHOWCASE.map((world, index) => (
            <div key={world.id} className="component-landing-plate">
              <input
                type="radio"
                name="landing-world"
                id={`landing-world-${world.id}`}
                className="component-landing-plate-input"
                defaultChecked={index === 0}
              />
              <label
                htmlFor={`landing-world-${world.id}`}
                className="component-landing-plate-label"
              >
                <span className="component-landing-plate-thumb">
                  <Image
                    src={`/visual-assets/worlds/${world.id}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 45vw, 280px"
                  />
                </span>
                <span className="component-landing-plate-caption">
                  {world.caption}
                </span>
              </label>
            </div>
          ))}
        </fieldset>
      </div>

      {HOMEPAGE_SHOWCASE.map((world) => (
        <LandingWorldPane key={world.id} world={world} />
      ))}

      <section
        className="component-landing-band component-landing-closing"
        aria-labelledby="landing-closing-heading"
      >
        <div className="component-landing-band-inner component-landing-closing-inner">
          <h2 id="landing-closing-heading" className="component-landing-closing-text">
            自带密钥。Google Gemini 的密钥大约两分钟就能拿到，而且完全免费；也可以使用 OpenAI、OpenRouter 或你自己托管的模型。密钥只保存在你的浏览器中，无需创建账号。
          </h2>
          <div className="component-landing-actions">
            {/* Secondary, not the solid-accent style the hero CTA above
                uses: the hero already spent the page's one primary action,
                and the demo above it is the stronger case for building a
                world than a repeated button down here. */}
            <Link href={START_HREF} className="component-landing-cta-secondary">
              {START_LABEL}
            </Link>
            <a
              href={GEMINI_KEY_URL}
              className="component-landing-cta-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              获取 Gemini 密钥
            </a>
            <Link href="/faq" className="component-landing-cta-secondary">
              阅读常见问题
            </Link>
          </div>
        </div>
      </section>

      <nav className="component-landing-footer" aria-label="站点信息">
        <Link href="/about" className="component-landing-footer-link">
          关于
        </Link>
        <Link href="/faq" className="component-landing-footer-link">
          常见问题
        </Link>
        <Link href="/privacy" className="component-landing-footer-link">
          隐私
        </Link>
        <Link href="/terms" className="component-landing-footer-link">
          条款
        </Link>
      </nav>
    </div>
  );
}
