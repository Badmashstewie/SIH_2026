# CoalSure

> Smart governance for safer mines.

CoalSure is a prototype for digital governance across coal-mining ecosystem. It provides a unified operational view for compliance, inspections, contractor oversight, alerts, and mine-risk intelligence.

## Features

- Role-based login prototype for field officers, mine officials, corporate administrators, and regulators
- Dashboard with mine, inspection, compliance, and risk summaries
- Mine risk map with operational risk indicators
- Inspection log and new-inspection workflow
- Compliance deadline tracker
- Contractor management view
- Alerts and notifications center
- AI risk insights with interactive charts
- Responsive layout for desktop, tablet, and mobile screens
- Floating AI chat widget (bottom-right) backed by a Netlify Function and Claude

## Tech stack

- HTML5
- CSS3 with responsive media queries
- Vanilla JavaScript
- [Lucide](https://lucide.dev/) icons via CDN
- [Chart.js](https://www.chartjs.org/) via CDN
- Google Fonts: DM Sans and IBM Plex Sans
- AI chat widget: vanilla JS frontend + a [Netlify Function](https://docs.netlify.com/functions/overview/) calling Claude via [Netlify AI Gateway](https://docs.netlify.com/build/ai-gateway/overview/)

## AI chat widget

The site includes a floating chat button (bottom-right) that opens a chat window backed by Claude
(`claude-sonnet-4-6`). The frontend never talks to Anthropic directly — it calls a Netlify Function,
which calls Claude server-side and streams the reply back so text appears incrementally.

**Files:**

| File | Purpose |
|---|---|
| `netlify/functions/chat.mts` | Serverless function at `/api/chat`. Accepts `{ messages, system }`, calls the Claude Messages API, and streams the text response back chunk by chunk. |
| `public/chatbot.js` | Widget logic: renders the launcher button and chat window, sends messages, reads the streamed response, shows a typing indicator, handles errors, and implements "Clear conversation". |
| `public/chatbot.css` | Widget styles, namespaced with a `cb-` prefix so they don't clash with the rest of the site. Full-width chat window on small screens. |
| `public/config.js` | Edit this to set the chat title, greeting, and the `systemPrompt` (the bot's persona/instructions) — no code changes needed elsewhere. |

**Embedding on another page:** add these three lines before `</body>`:

```html
<link rel="stylesheet" href="/public/chatbot.css" />
<script src="/public/config.js"></script>
<script src="/public/chatbot.js"></script>
```

No other markup is required — the widget builds its own DOM and attaches itself to `<body>`.

### API key / AI Gateway

The function calls Claude using the official Anthropic SDK with a zero-config client (`new Anthropic()`).
On Netlify, [AI Gateway](https://docs.netlify.com/build/ai-gateway/overview/) automatically injects a working
`ANTHROPIC_API_KEY` at runtime — **no key needs to be set in the Netlify dashboard**, and usage is billed to
your Netlify account credits. This requires a credit-based plan (Free, Personal, or Pro) and at least one
production deploy before it activates.

If you'd rather use your own Anthropic account/key instead of AI Gateway, set `ANTHROPIC_API_KEY` in
**Project configuration → Environment variables** in the Netlify dashboard (see `.env.example`) — Netlify will
not override a key you've already set.

## Getting started

No build process or package installation is required.

1. Clone the repository:

   ```bash
   git clone https://github.com/Badmashstewie/SIH_2026.git
   cd SIH_2026
   ```

2. Open `index.html` directly in a browser, or start a local server:

   ```bash
   python3 -m http.server 8000
   ```

3. Visit [http://localhost:8000](http://localhost:8000).

The login screen is part of the prototype only. Submit the form with any valid-looking email address and password to enter the console; no authentication service is connected.

## Project structure

```text
SIH_2026/
├── index.html                 # Complete CoalSure prototype: markup, styles, and JavaScript
├── netlify/
│   └── functions/
│       └── chat.mts           # Serverless function backing the chat widget (/api/chat)
├── public/
│   ├── chatbot.js             # Chat widget logic
│   ├── chatbot.css            # Chat widget styles
│   └── config.js              # Chat widget persona/config
├── package.json                # Declares @anthropic-ai/sdk for the function
├── .env.example                 # Optional ANTHROPIC_API_KEY override
└── README.md                    # Project documentation
```

## Deploying to Netlify

1. Push this repository to GitHub/GitLab/Bitbucket and [create a new Netlify site](https://app.netlify.com/start) from it,
   or run `netlify deploy` from the [Netlify CLI](https://docs.netlify.com/cli/get-started/) inside this directory.
2. No build command or publish directory changes are required — this is a static site with one Netlify Function.
3. Deploy to production at least once. AI Gateway (used by `/api/chat`) only activates after a production deploy exists.
4. Open the deployed site and click the chat button in the bottom-right corner to try it.

**Optional:** to use your own Anthropic API key instead of AI Gateway, go to your site in the Netlify dashboard →
**Project configuration → Environment variables** → **Add a variable**, and set `ANTHROPIC_API_KEY` to your key
(see `.env.example`). Redeploy after adding it.

## Usage

After entering the console, use the sidebar to navigate between the dashboard, risk map, inspection log, compliance tracker, contractor management, alerts, and AI insights. The inspection form and dashboard actions demonstrate front-end interactions using sample data.

## Data and security disclaimer

This repository contains a front-end demonstration with mock data. It does not connect to government systems, mine databases, authentication providers, or production APIs. Do not enter real credentials or sensitive operational information.

External fonts and JavaScript libraries are loaded from public CDNs, so an internet connection may be required for icons, fonts, and charts to render correctly.

## Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make and test your changes in a modern browser.
4. Commit your changes and open a pull request.

## License

No license has been specified for this repository yet. Contact the repository owner before redistributing or using the project in production.
