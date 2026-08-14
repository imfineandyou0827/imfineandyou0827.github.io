import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/',
  title: '姚杰的博客',
  description: '说说我的生活',
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '归档', link: '/archive' },
      { text: '标签', link: '/tags' },
      { text: '笔记', link: '/notes' },
      { text: '生活', link: '/life' },
      { text: '旅程', link: '/travel' },
      { text: '友链', link: '/friend' },
      { text: '工具箱', link: '/tools' },
      { text: 'GitHub', link: 'https://github.com/imfineandyou0827', target: '_blank' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/imfineandyou0827' }
    ],
    outline: 'deep',
    outlineTitle: '目录',
  }
}) 