import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isPlaywrightEnv } from '@/lib/utils/isPlaywrightEnv';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';

/**
 * About — the marketing/explainer page for Narraitor. Token-driven, server
 * component. Structural treatment lives in src/app/about.css under
 * .component-about* selectors (mirrors the dashboard pattern).
 *
 * Copy leads with the wedge (a structured solo RPG with real skill checks and
 * tracked state), explains the provider key in plain terms, and stays
 * outcome-framed.
 */

const STEPS: { title: string; description: string }[] = [
  {
    title: "构建世界",
    description:
      "定义一个背景设定：中土世界、黑色电影风格的城市、太空歌剧、诺曼底海滩。无论真实还是虚构，世界都由你来描述。",
  },
  {
    title: "创建角色",
    description:
      "塑造你所扮演的角色：他们的特质、经历和渴望。他们拥有真实的技能，故事会依赖这些技能展开。",
  },
  {
    title: "体验故事",
    description:
      "进入故事并做出选择。故事会回应你的行动，因此没有两次游玩会以相同方式展开。",
  },
];

export default function About() {
  return (
    <div className="component-about">
      <section className="component-about-hero" aria-labelledby="about-hero-heading">
        <h1 id="about-hero-heading" className="component-about-title">
          关于 Narraitor
        </h1>
        <p className="component-about-lead">
          Narraitor 是一款单人角色扮演游戏，故事会回应你所构建的世界。定义背景，创建拥有真实优势与弱点的角色，并做出推动故事的选择。故事会适应你的行动，而你角色的技能决定你能走多远。
        </p>
        <div className="component-about-hero-visual">
          <Image
            className="component-about-hero-image"
            src="/visual-assets/world-cyberpunk.png"
            alt="Narraitor 某个世界中霓虹灯映照的城市天际线"
            width={1024}
            height={426}
            priority
            unoptimized={isPlaywrightEnv()}
          />
        </div>
      </section>

      <section className="component-about-section" aria-labelledby="about-what-heading">
        <h2 id="about-what-heading" className="component-about-section-title">
          它是什么
        </h2>
        <div className="component-about-prose">
          <p>
            这是一款结构化的角色扮演游戏，而非闲聊。你设定世界与角色，然后经历一段会记录你所做之事及其代价的故事。你可以行走在雨水浸透的侦探之城，指挥一艘位于已知空间边缘的星舰，或在自创的某处体验一段宁静的故事。你搭好舞台，而你的选择会塑造故事走向。
          </p>
          <p>
            技能检定事关重大。有些选择对角色要求更高，而检定失败会令故事转折，而不是直接让你获胜。故事没有固定剧本，世界会记住你走过的道路。
          </p>
        </div>
      </section>

      <section className="component-about-section" aria-labelledby="about-how-heading">
        <h2 id="about-how-heading" className="component-about-section-title">
          运作方式
        </h2>
        <ol className="component-about-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="component-about-step">
              <span className="component-about-step-number" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="component-about-step-title">{step.title}</h3>
              <p className="component-about-step-description">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="component-about-section" aria-labelledby="about-free-heading">
        <h2 id="about-free-heading" className="component-about-section-title">
          {PERSONAL_CLOUD_ENABLED ? '模型已为你配置好' : '自备密钥'}
        </h2>
        <div className="component-about-prose">
          <p>
            {PERSONAL_CLOUD_ENABLED
              ? '登录后即可使用已在后台配置的模型，无需填写密钥。所有设备使用同一份模型配置，新故事默认使用简体中文。'
              : 'Narraitor 依靠你从模型服务获取的密钥运行；该密钥只需设置一次并保存在你的浏览器中，因此你生成的故事会运行在你自己的账户下。'}
          </p>
        </div>
      </section>

      <section className="component-about-section" aria-labelledby="about-privacy-heading">
        <h2 id="about-privacy-heading" className="component-about-section-title">
          你的故事始终属于你
        </h2>
        <div className="component-about-prose">
          <p>
            {PERSONAL_CLOUD_ENABLED
              ? '你的世界、角色和故事会自动保存在私人云端。使用自己的账号登录，即可在不同设备上继续冒险。'
              : '你的世界、角色和已保存的故事都保存在你自己的设备上的浏览器中，无需注册账户。随时回来，从上次中断处继续。'}
          </p>
        </div>
      </section>

      <section className="component-about-section" aria-labelledby="about-credit-heading">
        <h2 id="about-credit-heading" className="component-about-section-title">
          制作团队
        </h2>
        <div className="component-about-prose component-about-credit">
          <p>
            Narraitor 是一个开源项目。你可以阅读代码、提交问题，或帮助塑造它未来的发展方向，详情见{' '}
            <a
              href="https://github.com/jerseycheese/Narraitor"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </section>

      <section className="component-about-cta" aria-labelledby="about-cta-heading">
        <h2 id="about-cta-heading" className="component-about-section-title">
          准备开始了吗？
        </h2>
        <Link href="/worlds" className="component-about-cta-link">
          创建你的第一个世界
        </Link>
      </section>

      <nav className="component-about-footer" aria-label="站点信息">
        <Link href="/about" className="component-about-footer-link">
          关于
        </Link>
        <Link href="/faq" className="component-about-footer-link">
          常见问题
        </Link>
        <Link href="/privacy" className="component-about-footer-link">
          隐私
        </Link>
        <Link href="/terms" className="component-about-footer-link">
          条款
        </Link>
      </nav>
    </div>
  );
}
