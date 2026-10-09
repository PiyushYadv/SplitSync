# SplitSync 💸⚡

SplitSync is a high-density, collaborative expense-splitting platform engineered for modern groups and teams. It pairs a fluid Next.js 16 / React 19 frontend with a robust Java Spring Boot 3 backend backed by PostgreSQL and Redis.

---

## 🏛️ System Architecture

- **Frontend**: Next.js 16.3 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack React Query v5, Axios, Recharts, Lucide Icons.
- **Backend**: Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA, Spring Session Redis.
- **Primary Database**: PostgreSQL (relational ledger, expenses, splits, groups, members, audit trail).
- **In-Memory Store & Cache**: Redis (distributed session store for `splitsync_session`, exchange rate caching, idempotency locks, rate limiting).
- **Debt Optimization Engine**: Greedy bipartite graph minimization algorithm running in Java to collapse $O(N^2)$ IOUs into minimal $O(N)$ settlement transactions.
- **AI Receipt OCR**: Multimodal LLM pipeline extracting merchant name, dates, totals, and line items directly into interactive split tables.

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
3. **Session-Based Authentication**: Seamless `HttpOnly` cookie-based sessions (`splitsync_session`) managed through Spring Session backed by Redis.
4. **Receipt OCR Scanner**: High-accuracy receipt extraction mapping visual line items to split allocations.
5. **Real-time Analytics**: Monthly spend trends, category breakdowns, and immutable audit logging.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.x
- Java JDK >= 21
- PostgreSQL >= 15
- Redis >= 7

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### Backend Configuration

The backend runs on port `8080` under the `/api` prefix (`http://localhost:8080/api`). Configure `application.yml` or environment variables for PostgreSQL and Redis connectivity.
