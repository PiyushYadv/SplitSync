# SplitSync 💸⚡

[![CI](https://github.com/PiyushYadv/SplitSync/actions/workflows/ci.yml/badge.svg)](https://github.com/PiyushYadv/SplitSync/actions/workflows/ci.yml)

SplitSync is a high-density, collaborative expense-splitting platform engineered for modern groups and teams. It pairs a fluid Next.js 16 / React 19 frontend with a robust Java Spring Boot 3 backend backed by PostgreSQL and Redis.

---

## 🏛️ System Architecture

- **Frontend**: Next.js 16.3 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack React Query v5, Axios, Recharts, Lucide Icons.
- **Backend**: Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA, Spring Session Redis.
- **Primary Database**: PostgreSQL (relational ledger, expenses, splits, groups, members, audit trail).
- **In-Memory Store & Cache**: Redis (distributed session store for `splitsync_session`, exchange rate caching, idempotency locks, rate limiting).
- **Debt Optimization Engine**: Greedy bipartite graph minimization algorithm running in Java to collapse $O(N^2)$ IOUs into minimal $O(N)$ settlement transactions.
- **AI Receipt OCR**: Receipt photos are read by Google Gemini under a strict JSON schema; the merchant, total, currency, date, category and line items prefill the expense form for review.

---

## 📁 Repository Structure

```
SplitSync/
├── frontend/                     # Next.js 16 + React 19 Web Client
│   ├── src/app/                  # App Router pages (Landing, Auth, Dashboard, Groups, Settings, Analytics)
│   ├── src/features/             # Domain modules (groups, expenses, settlements, auth, dashboard)
│   ├── src/lib/api/              # Axios client, endpoints, contracts, and response mappers
│   └── BACKEND_INTEGRATION.md    # Frontend-to-backend API contract reference
├── backend/                      # Java Spring Boot 3 REST API Service (PostgreSQL + Redis)
├── BACKEND_HANDOFF_PLAN.md       # Comprehensive backend specifications & integration guide
├── SplitSync_Architecture_Plan.pdf # Original architecture & debt optimization blueprint
└── README.md
```

---

## ⚙️ Core Capabilities

1. **Multi-Currency Ledger**: Retains original currencies and transaction values, normalizing to the group's `base_currency` using stored snapshot exchange rates.
2. **Minimized Debt Matrix**: Server-side greedy network flow resolution reduces redundant cash flows between group members.
3. **Session-Based Authentication**: `HttpOnly` cookie sessions (`splitsync_session`) in Redis, with email/password or Google and GitHub sign-in, email verification, password reset and confirmed email changes.
4. **Receipt OCR Scanner**: Upload or photograph a receipt to prefill an expense; amounts are parsed as exact decimals and nothing is stored.
5. **Real-time Analytics**: Monthly spend trends, category breakdowns, and immutable audit logging.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.x
- Java JDK >= 21
- Docker (for PostgreSQL 16 and Redis 7)

### 1. Databases and mail

```bash
docker compose up -d
```

This starts PostgreSQL, Redis and [Mailpit](https://mailpit.axllent.org/). Every email the backend sends in development (verification, password reset, email change) lands in the Mailpit inbox at http://localhost:8025.

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run   # http://localhost:8080/api (Flyway migrates on startup)
./mvnw test              # unit + Testcontainers integration tests (needs Docker)
```

Database, Redis, CORS, mail, exchange-rate and rate-limit settings live in `backend/src/main/resources/application.yml` and can be overridden with environment variables. The REST contract is documented in `openapi.yaml`.

#### Optional features

Each of these is off until configured; the frontend only shows the buttons for features the backend reports as available (`GET /api/config`).

| Feature | Environment variables | Notes |
|---|---|---|
| Google sign-in | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Create an OAuth client in Google Cloud Console with redirect URI `http://localhost:8080/api/auth/oauth/callback/google` |
| GitHub sign-in | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Create a GitHub OAuth app with callback URL `http://localhost:8080/api/auth/oauth/callback/github` |
| Receipt scanning | `GEMINI_API_KEY` (optional `GEMINI_MODEL`) | Get a key from Google AI Studio; defaults to `gemini-3.5-flash-lite` |
| Real email delivery | `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `APP_MAIL_FROM` | Defaults point at Mailpit |

Set `APP_FRONTEND_URL` when the frontend isn't on `http://localhost:3000`; it is used for links in emails and redirects after sign-in.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

The app pages require the backend: sign up at `/signup` to get started.
