import type { VercelRequest, VercelResponse } from '@vercel/node';

const normalizeChatCompletionsUrl = (rawBaseUrl: string) => {
  const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/chat/completions')
    ? trimmed
    : `${trimmed}/chat/completions`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.AI_API_KEY || process.env.DASHSCOPE_API_KEY;
  const rawBaseUrl =
    process.env.AI_API_BASE_URL ||
    process.env.DASHSCOPE_BASE_URL ||
    'https://ark.cn-beijing.volces.com/api/coding/v3';
  const baseUrl = normalizeChatCompletionsUrl(rawBaseUrl);
  
  if (!apiKey) {
    return res.status(500).json({ error: 'AI_API_KEY is not configured' });
  }

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    // 设置响应头以支持 SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }

    res.end();
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from upstream model provider' });
  }
}
