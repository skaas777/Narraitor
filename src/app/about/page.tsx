import type { Metadata } from 'next';
import About from '@/components/About';

export const metadata: Metadata = {
  title: "关于",
  description:
    "Narraitor 是一款单人角色扮演游戏，故事会回应你所构建的世界。设定一个背景，创建一名角色，做出塑造故事的选择。",
};

export default function AboutPage() {
  return <About />;
}
