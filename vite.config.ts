import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.AI_API_KEY ?? env.DASHSCOPE_API_KEY ?? ''
  const rawBaseUrl =
    env.AI_API_BASE_URL ??
    env.DASHSCOPE_BASE_URL ??
    'https://ark.cn-beijing.volces.com/api/coding/v3'
  const needsCompletions = !rawBaseUrl.endsWith('/chat/completions')
  const baseUrl = rawBaseUrl.replace(/\/+$/, '')
  const model = env.AI_MODEL ?? env.DASHSCOPE_MODEL ?? 'deepseek-v3.2'

  return {
    base: '/',
    plugins: [react()],
    json: { stringify: true },
    define: {
      'import.meta.env.VITE_AI_MODEL': JSON.stringify(model),
      'import.meta.env.VITE_DASHSCOPE_MODEL': JSON.stringify(model),
    },
    server: {
      proxy: {
        '/api/bailian': {
          target: baseUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) =>
            path.replace(
              /^\/api\/bailian/,
              needsCompletions ? '/chat/completions' : ''
            ),
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      },
    },
  }
})
