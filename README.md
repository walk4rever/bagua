# 来，八卦一下！ 

中国传统阴阳八卦风格的起卦应用，模拟铜钱起卦生成本卦与变卦，并展示《周易》卦辞与行动指引。适配移动端，支持子路径部署到 `/bagua/`。让我们一起八卦一下！

## 功能

- 三次掷钱生成六爻，展示本卦与变爻
- 自动给出卦象解读与行动建议
- 阴阳旋转动效后展示结果
- 移动端优先布局与精简视觉

## 在线访问

https://air7.fun/bagua

## 开源与商业化

本项目当前为开源体验版，未来计划提供更丰富的商业化能力与服务支持。

## 本地开发

```bash
npm install
npm run dev
```

## 构建与校验

```bash
npm run build
npm run lint
npm run preview
```

## 部署说明

项目默认基于子路径 `/bagua/` 构建（见 `vite.config.ts`），Nginx 配置见 `nginx.conf`，容器镜像由 `Dockerfile` 构建。

```bash
docker build -t bagua .
docker run --rm -p 8080:80 bagua
```

访问：

- `http://localhost:8080/bagua/`
- 健康检查：`/health` 与 `/bagua/health`
