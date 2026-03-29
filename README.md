# 小庄 — 你的中文表达伙伴

让每个现代人都能轻松地读懂、说出、写出漂亮的中文。

> 天地有大美而不言 —— 庄子

## 功能

- 🌅 **寻句** — 描述场景或心情，从千年诗文中找到最贴切的那句话
- 🔮 **问卦** — 以周易智慧回应人生困惑，AI 解读卦象
- 🖊️ **仿写** — 用王阳明/苏东坡的文风，写你的心（即将推出）
- 📖 **秒读** — 任何古文，逐字注音、一键白话（即将推出）
- 📚 **精读** — 三分钟读透一段经典（即将推出）

## 技术栈

- Next.js 16 (App Router)
- React 19
- Vercel Edge Runtime
- DeepSeek v3.2 (AI)

## 本地开发

```bash
npm install
npm run dev
```

环境变量（`.env.local`）：

```bash
AI_API_KEY=your-api-key
AI_API_BASE_URL=https://your-provider.example.com/v1
AI_MODEL=your-model-name
```

## 构建与部署

```bash
npm run build
npm run start
```

部署到 Vercel：

```bash
vercel
```
