# 来，八卦一下！ 

中国传统阴阳八卦风格的起卦应用，模拟铜钱起卦生成本卦与变卦，并展示《周易》卦辞与行动指引。适配移动端，支持直接部署到根路径。让我们一起八卦一下！

## 功能

- 三次掷钱生成六爻，展示本卦与变爻
- 自动给出卦象解读与行动建议
- 阴阳旋转动效后展示结果
- 移动端优先布局与精简视觉

## 在线访问

https://bugua.air7.fun

## 开源与商业化

本项目当前为开源体验版，未来计划提供更丰富的商业化能力与服务支持。

## 本地开发

```bash
npm install
npm run dev
```

环境变量：

```bash
AI_API_KEY=your-api-key
AI_API_BASE_URL=https://your-provider.example.com/v1
AI_MODEL=your-model-name
```

## 构建与校验

```bash
npm run build
npm run lint
npm run preview
```

## 部署说明

项目默认基于根路径构建（见 `vite.config.ts`），Nginx 配置见 `nginx.conf`，容器镜像由 `Dockerfile` 构建。

```bash
docker build -t bagua .
docker run --rm -p 8080:80 bagua
```

访问：

- `http://localhost:8080/`
- 健康检查：`/health`
