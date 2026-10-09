# DevSecureX — Frontend

The web application for **DevSecureX**, a security code-review platform. A React +
TypeScript single-page app (installable as a PWA) that provides dashboards,
repository management, scan results, pull-request reviews, custom rules, analytics,
and an AI assistant on top of the DevSecureX API.

> This repository contains the **frontend** only. It talks to the DevSecureX backend
> API for authentication, scanning, and data.

## Tech Stack

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS** for styling, **Framer Motion** for animation
- **Zustand** for state, **TanStack Query** for server state/caching
- **React Router** for routing
- **Socket.IO** for real-time scan updates
- **Recharts** for analytics visualizations
- **vite-plugin-pwa** for offline/installable PWA support
- **Firebase Hosting** for deployment
- **Vitest** + Testing Library for tests

## Features

- **Authentication** — GitHub & Google OAuth flows, session handling
- **Dashboards** — security posture, scan history, and analytics
- **Repositories** — connect and manage repositories
- **Scans** — trigger scans and explore findings with code context
- **Pull Requests** — PR-level security review
- **Custom Rules** — author and manage scanning rules from the UI
- **AI Assistant** — vulnerability explanations and fix guidance
- **Billing** — subscription & plan management
- **Progressive Web App** — installable, offline-capable

## Getting Started

### Prerequisites
- Node.js 18+
- A running DevSecureX backend API

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL and OAuth/client IDs

# Start the dev server (http://localhost:5173)
npm run dev
```

### Common Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the Vitest test suite |
| `npm run lint` | Lint and auto-fix |
| `npm run format` | Format with Prettier |
| `npm run firebase:deploy` | Build and deploy to Firebase Hosting |

## Configuration

All runtime configuration is provided through `VITE_`-prefixed environment
variables (see `.env.example`). These are **public client-side values** baked into
the browser bundle at build time — API base URL, OAuth client IDs, Firebase project
settings, and the Razorpay publishable key ID. No private secrets live in the
frontend.

## Project Structure

```
frontend/
├── src/
│   ├── pages/        # Route-level pages (dashboard, scans, repos, billing, …)
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom hooks
│   ├── store/        # Zustand stores
│   ├── lib/          # API clients & integrations
│   ├── utils/        # Helpers
│   ├── types/        # Shared TypeScript types
│   └── data/         # Static/seed data
├── public/           # Static assets & PWA icons
└── scripts/          # Build & tooling scripts
```

## License

Released under the [MIT License](LICENSE).

---

**DevSecureX** — built by [Harshal Tribhuvan](https://github.com/harshaltribhuwan).
