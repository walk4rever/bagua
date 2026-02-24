import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.DASHSCOPE_API_KEY ?? ''
  const baseUrl = env.DASHSCOPE_BASE_URL ?? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
  const model = env.DASHSCOPE_MODEL ?? 'qwen-plus'

  return {
    base: '/bagua/',
    plugins: [react()],
    define: {
      'import.meta.env.VITE_DASHSCOPE_MODEL': JSON.stringify(model),
    },
    server: {
      proxy: {
        '/api/bailian': {
          target: baseUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) =>
            path.replace(/^\/api\/bailian/, '/chat/completions'),
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      },
    },
  }
})
