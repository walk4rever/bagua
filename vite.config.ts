import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.AI_API_KEY ?? ''
  const rawBaseUrl = env.AI_API_BASE_URL ?? ''
  const needsCompletions = rawBaseUrl
    ? !rawBaseUrl.endsWith('/chat/completions')
    : false
  const baseUrl = rawBaseUrl.replace(/\/+$/, '')
  const model = env.AI_MODEL ?? 'default-model'

  return {
    base: '/',
    plugins: [react()],
    json: { stringify: true },
    define: {
      'import.meta.env.VITE_AI_MODEL': JSON.stringify(model),
    },
    server: {
      proxy: baseUrl
        ? {
            '/api/llm': {
              target: baseUrl,
              changeOrigin: true,
              secure: true,
              rewrite: (path) =>
                path.replace(
                  /^\/api\/llm/,
                  needsCompletions ? '/chat/completions' : ''
                ),
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            },
          }
        : undefined,
    },
  }
})
