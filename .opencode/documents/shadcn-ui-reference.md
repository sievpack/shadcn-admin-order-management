# shadcn/ui 参考资源

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | https://ui.shadcn.com |
| GitHub 仓库 | https://github.com/shadcn-ui/ui |
| Awesome 列表 | https://github.com/birobirobiro/awesome-shadcn-ui |

## 高星项目参考

| 项目 | Stars | 类型 | 链接 |
|------|-------|------|------|
| vue-vben-admin | 32.1k | Vue3 Admin 管理后台 | https://github.com/vbenjs/vue-vben-admin |
| react-starter-kit | 23.6k | React 全栈启动器 | https://github.com/kriasoft/react-starter-kit |
| magicui | 20.7k | 动画组件库 | https://github.com/magicuidesign/magicui |
| vercel/chatbot | 20.1k | Vercel AI 聊天机器人 | https://github.com/vercel/chatbot |
| plate | 16.1k | 富文本编辑器 + AI | https://github.com/udecode/plate |
| saas-starter | 15.7k | Next.js SaaS 启动器 | https://github.com/nextjs/saas-starter |
| shadcn-admin | 11.7k | Admin 仪表盘模板 | https://github.com/satnaing/shadcn-admin |
| inbox-zero | 10.4k | AI 邮件助手 | https://github.com/elie222/inbox-zero |
| OpenStock | 10.3k | 股票市场数据 | https://github.com/Open-Dev-Society/OpenStock |
| openstatus | 8.6k | 状态监控页面 | https://github.com/openstatusHQ/openstatus |
| morphic | 8.8k | AI 搜索引擎 | https://github.com/miurla/morphic |

## 设计参考

### Admin 后台模板
- **vue-vben-admin** - Vue3 + shadcn/ui 企业级后台
- **shadcn-admin** - 官方维护的 Vite + React Admin 模板

### 数据可视化
- **OpenStock** - 股票数据图表展示
- **openstatus** - 状态页面的指标卡片设计

### AI 应用
- **vercel/chatbot** - Vercel 的 AI Chatbot 参考
- **morphic** - 生成式 UI 搜索界面
- **inbox-zero** - AI 邮件管理

### 组件库
- **magicui** - 动画组件集合，可直接复制使用
- **plate** - 基于 Slate 的富文本编辑器

## 主题设计参考

shadcn/ui 默认使用 Neutral 主题，核心 tokens：

```css
:root {
  --radius: 0.5rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --accent: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --muted: oklch(0.269 0 0);
  --destructive: oklch(0.704 0.191 22.216);
}
```

## 字体推荐

shadcn/ui 官方推荐字体栈：

```css
--font-sans: 'Inter', 'Manrope', 'Noto Sans SC', sans-serif;
--font-mono: 'Menlo', 'Monaco', 'Consolas', monospace;
```

## 相关话题

- [nextjs](https://github.com/topics/nextjs)
- [radix-ui](https://github.com/topics/radix-ui)
- [tailwindcss](https://github.com/topics/tailwindcss)
