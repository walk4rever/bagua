# Changelog

## v0.5.1 - 2026-03-27
- 模型配置改为优先读取火山方舟 `AI_*` 环境变量，兼容保留旧的 `DASHSCOPE_*` 配置
- 本地 Vite 代理与 Vercel Serverless 代理统一补全 `/chat/completions`，适配方舟 Coding 基址
- 前端解读请求默认模型切换为 `deepseek-v3.2`

## v0.2.0 - 2026-02-25
- 接入阿里云百炼兼容模式接口，支持通过环境变量配置模型与Base URL
- 解读内容支持Markdown分段展示，结构更清晰
- 解读提示词增强，输出更丰富并包含建议与注意事项
- 兼容去除bailian前缀的模型名以避免不支持错误
