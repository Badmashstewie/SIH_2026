import type { Config, Context } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'

// The API key/base URL are injected automatically by Netlify AI Gateway at
// runtime (on a deployed site with a production deploy) — nothing to configure.
const anthropic = new Anthropic()

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1024
const REQUEST_TIMEOUT_MS = 55_000
const DEFAULT_SYSTEM_PROMPT = 'You are a helpful, concise assistant.'
const MAX_HISTORY_MESSAGES = 40

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
  }

  let body: { messages?: unknown; system?: unknown }
  try {
    body = await req.json()
  } catch {
    return jsonError('That message could not be read. Please try again.', 400)
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : []
  const messages: ChatMessage[] = rawMessages
    .filter(
      (m): m is ChatMessage =>
        m && typeof m === 'object' && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    )
    .slice(-MAX_HISTORY_MESSAGES)

  if (messages.length === 0) {
    return jsonError('Send at least one message to start the conversation.', 400)
  }

  const system = typeof body.system === 'string' && body.system.trim() ? body.system : DEFAULT_SYSTEM_PROMPT

  try {
    const stream = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages,
        stream: true,
      },
      { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
    )

    const encoder = new TextEncoder()

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(event.delta.text))
              }
            }
          } catch (err) {
            console.error('Anthropic stream interrupted:', err)
            controller.enqueue(
              encoder.encode('\n\n[The response was interrupted. Please try sending your message again.]'),
            )
          } finally {
            controller.close()
          }
        },
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    )
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError'
    console.error('Anthropic request failed:', err)
    return jsonError(
      timedOut
        ? 'The assistant took too long to respond. Please try again.'
        : 'The assistant is unavailable right now. Please try again in a moment.',
      502,
    )
  }
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config: Config = {
  path: '/api/chat',
  method: 'POST',
}
