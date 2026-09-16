// CoalSure chat widget — vanilla JS, no build step, no dependencies.
// Reads persona/config from window.ChatbotConfig (see /public/config.js).
;(function () {
  const cfg = Object.assign(
    {
      title: 'Chat with us',
      greeting: 'Hi! How can I help you today?',
      inputPlaceholder: 'Type a message...',
      systemPrompt: '',
      apiUrl: '/api/chat',
    },
    window.ChatbotConfig || {},
  )

  const CLIENT_TIMEOUT_MS = 60_000

  let messages = [] // { role: 'user' | 'assistant', content: string }
  let requestSeq = 0 // guards against a stale in-flight response landing after "clear"
  let sending = false

  const root = document.createElement('div')
  root.className = 'cb-root'
  root.innerHTML = `
    <button class="cb-launcher" type="button" aria-label="Open chat" aria-expanded="false">
      <svg class="cb-icon-chat" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 4h16v12H7l-3 3V4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <svg class="cb-icon-close" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="cb-panel" role="dialog" aria-label="${escapeAttr(cfg.title)}">
      <div class="cb-header">
        <span class="cb-header-title">${escapeHtml(cfg.title)}</span>
        <div class="cb-header-actions">
          <button class="cb-clear-btn" type="button" title="Clear conversation">Clear</button>
          <button class="cb-close-btn" type="button" aria-label="Close chat">&times;</button>
        </div>
      </div>
      <div class="cb-messages" role="log" aria-live="polite"></div>
      <form class="cb-input-row">
        <textarea class="cb-input" rows="1" placeholder="${escapeAttr(cfg.inputPlaceholder)}" aria-label="Message"></textarea>
        <button class="cb-send-btn" type="submit" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20l16-8L4 4v6l10 2-10 2v6z" fill="currentColor"/>
          </svg>
        </button>
      </form>
    </div>
  `
  document.body.appendChild(root)

  const launcher = root.querySelector('.cb-launcher')
  const panel = root.querySelector('.cb-panel')
  const closeBtn = root.querySelector('.cb-close-btn')
  const clearBtn = root.querySelector('.cb-clear-btn')
  const messagesEl = root.querySelector('.cb-messages')
  const form = root.querySelector('.cb-input-row')
  const input = root.querySelector('.cb-input')

  launcher.addEventListener('click', () => setOpen(!panel.classList.contains('cb-open')))
  closeBtn.addEventListener('click', () => setOpen(false))
  clearBtn.addEventListener('click', clearConversation)
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    handleSend()
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  })
  input.addEventListener('input', () => {
    input.style.height = 'auto'
    input.style.height = Math.min(input.scrollHeight, 120) + 'px'
  })

  renderGreetingIfEmpty()

  function setOpen(open) {
    panel.classList.toggle('cb-open', open)
    launcher.classList.toggle('cb-open', open)
    launcher.setAttribute('aria-expanded', String(open))
    if (open) {
      scrollToBottom()
      input.focus()
    }
  }

  function renderGreetingIfEmpty() {
    if (messages.length === 0 && cfg.greeting) {
      appendBubble('assistant', cfg.greeting)
    }
  }

  function clearConversation() {
    requestSeq += 1 // invalidate any in-flight request
    sending = false
    messages = []
    messagesEl.innerHTML = ''
    renderGreetingIfEmpty()
  }

  async function handleSend() {
    const text = input.value.trim()
    if (!text || sending) return

    input.value = ''
    input.style.height = 'auto'
    messages.push({ role: 'user', content: text })
    appendBubble('user', text)

    const typingEl = appendTypingIndicator()
    sending = true
    const mySeq = ++requestSeq

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS)

    let assistantBubble = null
    let assistantText = ''

    try {
      const res = await fetch(cfg.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, system: cfg.systemPrompt }),
        signal: controller.signal,
      })

      if (mySeq !== requestSeq) return // conversation was cleared while waiting

      if (!res.ok || !res.body) {
        const friendly = await friendlyErrorFromResponse(res)
        typingEl.remove()
        appendBubble('assistant', friendly, true)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        if (mySeq !== requestSeq) {
          reader.cancel()
          return
        }
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue

        if (!assistantBubble) {
          typingEl.remove()
          assistantBubble = appendBubble('assistant', '')
        }
        assistantText += chunk
        assistantBubble.textContent = assistantText
        scrollToBottom()
      }

      if (mySeq !== requestSeq) return

      if (!assistantText.trim()) {
        typingEl.remove()
        appendBubble('assistant', "Sorry, I didn't get a response. Please try again.", true)
        return
      }

      messages.push({ role: 'assistant', content: assistantText })
    } catch (err) {
      if (mySeq !== requestSeq) return
      typingEl.remove()
      const timedOut = err && err.name === 'AbortError'
      appendBubble(
        'assistant',
        timedOut
          ? 'This is taking longer than expected. Please try again.'
          : "Sorry, I couldn't connect. Please check your connection and try again.",
        true,
      )
    } finally {
      clearTimeout(timeoutId)
      if (mySeq === requestSeq) sending = false
    }
  }

  async function friendlyErrorFromResponse(res) {
    try {
      const data = await res.json()
      if (data && data.error) return data.error
    } catch {
      // ignore parse failures, fall through to generic message
    }
    return 'Something went wrong on our end. Please try again in a moment.'
  }

  function appendBubble(role, text, isError) {
    const wrap = document.createElement('div')
    wrap.className = 'cb-msg cb-msg-' + role + (isError ? ' cb-msg-error' : '')
    const bubble = document.createElement('div')
    bubble.className = 'cb-bubble'
    bubble.textContent = text
    wrap.appendChild(bubble)
    messagesEl.appendChild(wrap)
    scrollToBottom()
    return bubble
  }

  function appendTypingIndicator() {
    const wrap = document.createElement('div')
    wrap.className = 'cb-msg cb-msg-assistant cb-msg-typing'
    wrap.innerHTML = '<div class="cb-bubble cb-typing"><span></span><span></span><span></span></div>'
    messagesEl.appendChild(wrap)
    scrollToBottom()
    return wrap
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }

  function escapeAttr(str) {
    return escapeHtml(str)
  }
})()
