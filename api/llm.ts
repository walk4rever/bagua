const normalizeChatCompletionsUrl = (rawBaseUrl: string) => {
  const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/chat/completions')
    ? trimmed
    : `${trimmed}/chat/completions`;
};

const jsonResponse = (body: Record<string, string>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

const encoder = new TextEncoder();
const isJsonResponse = (contentType: string | null) =>
  (contentType ?? '').toLowerCase().includes('application/json');

const extractContent = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const parsed = payload as {
    choices?: Array<{
      delta?: { content?: string };
      message?: { content?: string };
    }>;
  };
  return (
    parsed.choices?.[0]?.delta?.content ??
    parsed.choices?.[0]?.message?.content ??
    null
  );
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, 405);
  }

  const apiKey = process.env.AI_API_KEY;
  const rawBaseUrl = process.env.AI_API_BASE_URL;

  if (!apiKey) {
    return jsonResponse({ error: 'AI_API_KEY is not configured' }, 500);
  }
  if (!rawBaseUrl) {
    return jsonResponse({ error: 'AI_API_BASE_URL is not configured' }, 500);
  }
  const baseUrl = normalizeChatCompletionsUrl(rawBaseUrl);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const shouldStream =
    typeof payload === 'object' &&
    payload !== null &&
    'stream' in payload &&
    (payload as { stream?: unknown }).stream !== false;

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(55000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, {
        status: response.status,
        headers: {
          'Content-Type':
            response.headers.get('content-type') ?? 'text/plain; charset=utf-8',
        },
      });
    }

    if (!shouldStream || isJsonResponse(response.headers.get('content-type'))) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type':
            response.headers.get('content-type') ?? 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      });
    }

    if (!response.body) {
      return jsonResponse({ error: 'Upstream returned empty body' }, 502);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = '';
        let streamCompleted = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            sseBuffer += decoder.decode(value, { stream: true });
            const lines = sseBuffer.split('\n');
            sseBuffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;

              const rawPayload = trimmed.slice(5).trim();
              if (!rawPayload) continue;
              if (rawPayload === '[DONE]') {
                streamCompleted = true;
                controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
                await reader.cancel();
                break;
              }

              try {
                const parsed = JSON.parse(rawPayload) as {
                  choices?: Array<{
                    delta?: { content?: string }
                    message?: { content?: string }
                  }>
                };
                const delta = extractContent(parsed);
                if (!delta) continue;
                controller.enqueue(
                  encoder.encode(`event: delta\ndata: ${JSON.stringify(delta)}\n\n`)
                );
              } catch {
                // Skip malformed upstream SSE chunks.
              }
            }

            if (streamCompleted) {
              break;
            }
          }

          const trailingPayload = sseBuffer.trim();
          if (trailingPayload.startsWith('data:')) {
            const rawPayload = trailingPayload.slice(5).trim();
            if (rawPayload === '[DONE]') {
              streamCompleted = true;
            } else if (rawPayload) {
              try {
                const parsed = JSON.parse(rawPayload);
                const delta = extractContent(parsed);
                if (delta) {
                  controller.enqueue(
                    encoder.encode(
                      `event: delta\ndata: ${JSON.stringify(delta)}\n\n`
                    )
                  );
                }
              } catch {
                // Ignore incomplete trailing chunk payloads.
              }
            }
          }

          if (!streamCompleted) {
            controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: 'Stream interrupted',
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return jsonResponse(
      { error: 'Failed to fetch from upstream model provider' },
      500
    );
  }
}
