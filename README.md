# 🚀 TravelLuhh

> A full-stack travel planning and budget management app — plan trips, track expenses, manage packing lists, and review your travel portfolio.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [User Flow](#-user-flow)
- [Auth Flow](#-auth--session-flow)
- [Database](#-database-erd)
- [API Structure](#-api-structure)
- [Frontend Components](#-frontend-components)
- [Feature Flows](#-feature-specific-flows)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧭 Overview

TravelLuhh is a personal travel management web app that keeps all your trip planning in one place — from budgeting and expense tracking to day-by-day itineraries, packing checklists, and a travel portfolio. Built for solo use with multi-user group trip support (shared budgets, split bills, member roles).

**Type:** `Solo`
**Brand:** `Luhh Series`
**Built with:** Independent

---

## ✨ Features

- ✅ Email signup with OTP verification + Google OAuth2
- ✅ JWT authentication with silent token refresh
- ✅ Trip CRUD (create, view, edit, delete, archive)
- ✅ Expense tracking with category breakdown and bundle sub-items
- ✅ Multi-currency support via live Frankfurter rates
- ✅ Budget modes: solo / shared / separated
- ✅ Budget alerts at 75%, 90%, 100% spend thresholds
- ✅ Analytics & charts — bento layout, pie, bar, and trend charts
- ✅ Split bill / Settle Up with greedy debt simplification
- ✅ Packing checklist with preset packs (general, beach, hiking, business, Umrah)
- ✅ Day-by-day itinerary planner
- ✅ Activity feed per trip
- ✅ Trip data export (CSV + Print/PDF)
- ✅ Travel portfolio (Year in Review, Timeline, Map)
- ✅ User profile (name, country, currency, password)
- ✅ Destination notes (localStorage)
- ✅ Quick price currency converter on dashboard
- 🚧 Trip member invite / remove / role change *(UI only — not wired to backend)*
- 🚧 Edit expense *(not yet supported)*
- 🚧 Separated budget per-member allocation *(DB + UI scaffolded, not wired)*
- 💡 Notes persistence to database *(localStorage only currently)*
- 💡 Refresh token revocation on logout *(planned)*
- 💡 Real-time collaboration via WebSocket/SSE *(planned)*
- 💡 Trip image upload *(planned)*

---

## 🛠 Tech Stack

```mermaid
graph TD
    subgraph Frontend
        FE["React 18 + TypeScript\nVite"]
        UI["shadcn/ui + Tailwind CSS\nFramer Motion · Recharts"]
        ST["TanStack React Query\nAxios · React Hook Form + Zod"]
    end
    subgraph Backend
        BE["Spring Boot 3.2.1\nJava 17 · Maven"]
        AU["Spring Security\nJWT (JJWT) + Google OAuth2"]
    end
    subgraph Infrastructure
        DB[("PostgreSQL\nNeon Cloud")]
        HO["Docker + Docker Compose"]
        SMTP["Gmail SMTP"]
        FX["Frankfurter API"]
    end
    FE --> BE
    BE --> DB
    BE --> SMTP
    FE --> FX
```

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| Server State | TanStack React Query |
| Forms | React Hook Form + Zod |
| UI | Tailwind CSS + shadcn/ui (Radix UI) · Framer Motion · Recharts |
| HTTP Client | Axios (auto token-refresh interceptor) |
| Backend | Spring Boot 3.2.1 · Java 17 · Maven |
| Security | Spring Security + JWT (JJWT 0.12.3) + Google OAuth2 |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL (Neon cloud) |
| Email | Gmail SMTP (`JavaMailSender`, async) |
| Containerisation | Docker + Docker Compose |
| Currency | Frankfurter API (live FX rates) |

---

## 📌 Architecture

### High-level Architecture

```mermaid
graph TD
    U[User / Browser] --> FE[React Frontend]
    FE -->|REST + JWT| BE[Spring Boot API]
    BE --> DB[(PostgreSQL · Neon)]
    BE --> SMTP[Gmail SMTP]
    FE -->|OAuth2 redirect| GAUTH[Google OAuth2]
    GAUTH -->|callback| BE
    FE -->|live rates| FX[Frankfurter API]
```

### System Architecture

```mermaid
graph TD
    subgraph Frontend
        P[Pages] --> C[Components]
        C --> H[Services / Hooks · Axios]
    end
    subgraph Backend
        R[Controllers] --> MW[Spring Security Filter]
        MW --> E[Services]
        E --> S[JPA Repositories]
        S --> DB[(PostgreSQL)]
    end
    H --> R
    E --> EXT[Gmail SMTP]
```

---

## 👤 User Flow

```mermaid
flowchart TD
    A([Start]) --> B[Landing Page]
    B --> C{Logged in?}
    C -->|No| D[Login / Register]
    C -->|Yes| E[Dashboard]
    D --> E
    E --> F[Trips List]
    F --> G[Trip Detail]
    G --> H[Expenses · Itinerary · Packing\nCharts · Activity · Settle Up · Notes]
    E --> I[Portfolio]
    E --> J[Profile]
```

### Page Map

```mermaid
graph TD
    subgraph Public ["🌐 Public Routes"]
        ROOT["/\nLanding"]
        AUTH["/login · /register\n/forgot-password"]
        OAUTH["/oauth2/callback"]
    end
    subgraph Protected ["🔐 Protected Routes"]
        DASH["/dashboard"]
        TRIPS["/trips"]
        TD["/trips/:id"]
        PORT["/portfolio"]
        PROF["/profile"]
    end
    ROOT --> AUTH
    AUTH --> DASH
    OAUTH --> DASH
    DASH --> TRIPS
    DASH --> PORT
    DASH --> PROF
    TRIPS --> TD

    style Public fill:#e8f5e9,stroke:#4caf50
    style Protected fill:#e3f2fd,stroke:#2196f3
```

---

## 🔐 Auth & Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Spring Boot API
    participant DB as PostgreSQL
    participant ML as Gmail SMTP

    Note over U,ML: Email Signup (3 steps)
    U->>FE: Enter email
    FE->>API: POST /api/auth/initiate-signup
    API->>DB: Check email not taken
    API-->>ML: Send OTP (async)
    API-->>FE: 200 OK
    U->>FE: Enter 6-digit OTP
    FE->>API: POST /api/auth/verify-email
    API->>DB: Validate OTP, mark used
    API-->>FE: verificationToken (JWT, 5 min)
    U->>FE: Enter name + password
    FE->>API: POST /api/auth/complete-signup
    API->>DB: Create user
    API-->>FE: accessToken + refreshToken + user

    Note over U,API: Email Login
    U->>FE: Email + password
    FE->>API: POST /api/auth/login
    API->>DB: Validate credentials
    API-->>FE: accessToken (24h) + refreshToken (7d)
    FE->>FE: Store in localStorage
    FE-->>U: Redirect to dashboard

    Note over U,API: Google OAuth2
    U->>FE: Click "Login with Google"
    FE->>API: GET /oauth2/authorize/google
    API-->>U: Redirect to Google consent screen
    U->>API: Google callback with auth code
    API->>DB: Create or update user
    API-->>FE: Redirect /oauth2/callback?token=...
    FE-->>U: Redirect to dashboard
```

### Token Lifecycle

```mermaid
sequenceDiagram
    participant FE as Frontend (Axios interceptor)
    participant API as Spring Boot API

    FE->>API: Request + Bearer accessToken
    API-->>FE: 401 Token Expired
    FE->>API: POST /api/auth/refresh + refreshToken
    API-->>FE: New accessToken
    FE->>API: Retry original request
    API-->>FE: 200 OK
```

---

## 🗄️ Database (ERD)

### Core ERD

```mermaid
erDiagram
    users {
        bigserial user_id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar auth_provider
        varchar google_id UK
        boolean email_verified
        varchar country
        varchar currency
        boolean onboarding_completed
        timestamp created_at
    }
    trips {
        bigserial trip_id PK
        bigint owner_id FK
        varchar name
        varchar destination_country
        date start_date
        date end_date
        numeric total_budget
        numeric spent_amount
        numeric remaining_budget
        varchar currency
        varchar budget_type
        varchar status
        boolean is_archived
        timestamp created_at
    }
    trip_members {
        bigserial member_id PK
        bigint trip_id FK
        bigint user_id FK
        varchar role
        timestamp joined_at
    }
    expenses {
        bigserial expense_id PK
        bigint trip_id FK
        bigint added_by FK
        varchar category
        numeric amount
        varchar currency
        date expense_date
        text description
        timestamp created_at
    }
    users ||--o{ trips : "owns"
    users ||--o{ trip_members : "member of"
    trips ||--o{ trip_members : "has"
    trips ||--o{ expenses : "has"
```

### Feature ERD

```mermaid
erDiagram
    expenses ||--o{ expense_sub_items : "broken into"
    trips ||--o{ packing_items : "has"
    trips ||--o{ itinerary_items : "has"
    trips ||--o{ trip_activities : "logs"
    trips ||--o{ trip_member_budgets : "has"

    expense_sub_items {
        bigserial sub_item_id PK
        bigint expense_id FK
        varchar description
        numeric amount
        varchar category
    }
    packing_items {
        bigserial item_id PK
        bigint trip_id FK
        bigint added_by FK
        varchar label
        varchar category
        boolean is_checked
    }
    itinerary_items {
        bigserial item_id PK
        bigint trip_id FK
        date item_date
        time start_time
        time end_time
        varchar title
        varchar category
        integer sort_order
    }
    trip_activities {
        bigserial activity_id PK
        bigint trip_id FK
        bigint user_id FK
        varchar actor_name
        varchar action_type
        text description
        timestamp created_at
    }
    trip_member_budgets {
        bigserial id PK
        bigint trip_id FK
        bigint user_id FK
        numeric allocated_budget
        numeric spent_amount
        numeric remaining_budget
    }
```

### Database Schema Overview

| Table | Purpose | Key Relations |
|---|---|---|
| `users` | User accounts — local + Google OAuth | — |
| `email_verification_codes` | OTP codes for signup + password reset | — |
| `trips` | Travel trips with budget info | belongs to `users` |
| `trip_members` | Links users to trips with roles | belongs to `users`, `trips` |
| `trip_member_budgets` | Per-member budget allocation (separated mode) | belongs to `trips`, `users` |
| `expenses` | Expenses per trip | belongs to `trips`, `users` |
| `expense_sub_items` | Per-category breakdown for bundle expenses | belongs to `expenses` |
| `packing_items` | Packing checklist items | belongs to `trips` |
| `itinerary_items` | Day-by-day planned activities | belongs to `trips` |
| `trip_activities` | Activity log / feed | belongs to `trips`, `users` |

> **DB Triggers:** `trg_update_trip_spent` auto-recalculates `trips.spent_amount` after any expense change. `remaining_budget` is a generated column (`total_budget − spent_amount`).

Full schema with column definitions → [DOCS.md § Database Schema](DOCS.md#database-schema)

---

## 🔌 API Structure

### API Overview

```mermaid
mindmap
  root((API))
    auth
      POST /initiate-signup
      POST /verify-email
      POST /complete-signup
      POST /login
      POST /forgot-password
      POST /reset-password
      POST /refresh
    trips
      GET /
      POST /
      GET /:tripId
      PUT /:tripId
      DELETE /:tripId
    expenses
      POST /
      GET /trip/:tripId
      DELETE /:expenseId
    itinerary
      GET /:tripId/itinerary
      POST /:tripId/itinerary
      PUT /:tripId/itinerary/:itemId
      DELETE /:tripId/itinerary/:itemId
    packing
      GET /:tripId/packing
      POST /:tripId/packing
      PATCH /:tripId/packing/:itemId/toggle
      DELETE /:tripId/packing/:itemId
      POST /:tripId/packing/preset
    activity
      GET /:tripId/activity
    settlement
      GET /:tripId/settlement
    users
      GET /me
      PUT /profile
      PUT /change-password
```

### Request/Response Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant SF as Spring Security Filter
    participant API as Controller → Service
    participant DB as PostgreSQL

    FE->>SF: Request + Bearer accessToken
    SF->>SF: Validate JWT
    SF->>API: Pass user context
    API->>DB: Query / mutate data
    DB-->>API: Return rows
    API-->>FE: JSON response
```

Full endpoint table with request/response shapes → [DOCS.md § API Endpoints Reference](DOCS.md#api-endpoints-reference)

---

## 🧩 Frontend Components

### Component Tree

```mermaid
graph TD
    App["App.tsx\n(Routes + AuthContext)"]
    App --> LAYOUT["Layout\n(Navbar + outlet)"]
    App --> AUTH_CTX["AuthContext\n(global auth state)"]
    LAYOUT --> DASH["Dashboard\n/dashboard"]
    LAYOUT --> TRIPS["Trips\n/trips"]
    LAYOUT --> TD["TripDetail\n/trips/:id"]
    LAYOUT --> PORT["Portfolio\n/portfolio"]
    LAYOUT --> PROF["Profile\n/profile"]

    TD --> BUD["BudgetAlerts"]
    TD --> SHARE["TripSharing"]
    TD --> EXPORT["ExportMenu"]
    TD --> TABS["Tabs"]

    TABS --> EXP["ExpenseListWithTotal\n+ ExpenseForm"]
    TABS --> ITIN["TripItinerary"]
    TABS --> PACK["PackingList"]
    TABS --> CHART["BentoCharts\n+ Category Breakdown"]
    TABS --> ACT["ActivityFeed"]
    TABS --> SETTLE["SettlementSummary"]
    TABS --> NOTES["EditableDestinationNotes"]

    DASH --> CC["CurrencyConverter"]
    PORT --> YIR["YearInReview"]
    PORT --> TL["TravelTimeline"]
    PORT --> MAP["TravelMap"]
```

### Key Components

| Component | Purpose |
|---|---|
| `AuthContext` | Global auth state — user, tokens, login/logout |
| `ProtectedRoute` | Redirects to login if unauthenticated |
| `TokenRefreshHandler` | Axios interceptor wrapper for silent token refresh |
| `ExpenseForm` | Add expense with optional bundle sub-item support |
| `ExpenseListWithTotal` | Expense list with expandable bundle rows |
| `BentoCharts` | Analytics bento layout — radial gauge, pie, bar, trend |
| `SettlementSummary` | Who owes whom via greedy debt simplification |
| `PackingList` | Checklist with progress bar + preset pack loader |
| `TripItinerary` | Day-by-day planner with per-day activity cards |
| `TripSharing` | Member management dialog (UI only) |
| `PermissionGate` | Conditionally renders UI based on trip member role |
| `TravelMap` | Visual map of all visited destinations |

---

## ⚙️ Feature-specific Flows

### Trip CRUD Flow

```mermaid
flowchart TD
    A([User creates trip]) --> B[POST /api/trips]
    B --> C[Insert into trips\nInsert creator as owner in trip_members]
    C --> D([TripResponse])

    E([User views trips]) --> F[GET /api/trips]
    F --> G[Trips where user is owner OR member\nis_archived = false]
    G --> H([Trips array])

    I([User deletes trip]) --> J[DELETE /api/trips/:id]
    J --> K{Is owner?}
    K -->|No| L[403 Forbidden]
    K -->|Yes| M[Hard delete — cascades to all child tables]
    M --> N([204 No Content])
```

### Expense Flow

```mermaid
flowchart TD
    A([User adds expense]) --> B[POST /api/expenses]
    B --> C[Insert expense row]
    C --> D{category = bundle?}
    D -->|Yes| E[Insert expense_sub_items rows]
    D -->|No| F[DB trigger fires]
    E --> F
    F --> G[trips.spent_amount recalculated]
    G --> H[Log to trip_activities async]
    H --> I([ExpenseResponse + subItems])

    J([User deletes expense]) --> K[DELETE /api/expenses/:id]
    K --> L{Creator or trip owner?}
    L -->|No| M[403 Forbidden]
    L -->|Yes| N[Hard delete + cascade sub_items]
    N --> O[DB trigger recalculates spent_amount]
    O --> P([204 No Content])
```

### Budget System

```mermaid
flowchart LR
    subgraph DB ["Database — always authoritative"]
        T["trips.total_budget"]
        S["trips.spent_amount\n← trigger on expenses"]
        R["trips.remaining_budget\n= total_budget − spent_amount\n(generated column)"]
        T --> R
        S --> R
    end

    subgraph Modes ["Budget Types"]
        SOLO["solo\nOne person · one pot"]
        SHARED["shared\nGroup · shared pool\nSettle Up available"]
        SEP["separated\nPer-member allocation\nin trip_member_budgets"]
    end

    subgraph FE ["Frontend"]
        ALERTS["BudgetAlerts\n75% · 90% · 100% thresholds\ndismissible per session"]
        SETTLE["SettlementSummary\nGreedy debt simplification\nEqual-share model"]
    end

    DB --> FE
    Modes --> DB
```

### Role & Permission Matrix

| Action | Owner | Editor | Viewer |
|---|---|---|---|
| View trip + expenses | ✅ | ✅ | ✅ |
| Edit trip details | ✅ | ✅ | ❌ |
| Delete trip | ✅ | ❌ | ❌ |
| Add expense | ✅ | ✅ | ❌ |
| Delete own expense | ✅ | ✅ | ❌ |
| Delete any expense | ✅ | ❌ | ❌ |
| Manage packing + itinerary | ✅ | ✅ | ❌ |
| View settle up | ✅ | ✅ | ✅ |
| Manage members *(UI only)* | ✅ | ❌ | ❌ |

---

## 🚀 Getting Started

### Prerequisites

- Docker + Docker Compose
- Node.js `>=18`

### Installation

```bash
git clone https://github.com/snsyaqirah/travelluhh.git
cd travelluhh
```

### Running locally

```bash
# Start backend (Docker)
docker compose up --build -d

# Start frontend
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |

---

## 🔑 Environment Variables

### Backend — `backend/src/main/resources/application.yml`

```yaml
# Database
spring.datasource.url: jdbc:postgresql://<neon-host>/travelluhh
spring.datasource.username: <username>
spring.datasource.password: <password>

# JWT
jwt.secret: <secret>
jwt.expiration: 86400000          # 24 hours
jwt.refresh-expiration: 604800000 # 7 days

# Google OAuth2
spring.security.oauth2.client.registration.google.client-id: <client-id>
spring.security.oauth2.client.registration.google.client-secret: <client-secret>

# Email
spring.mail.username: <gmail-address>
spring.mail.password: <gmail-app-password>
```

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## ☁️ Deployment

> Not yet deployed to production. Planned targets:

| Service | Platform | Purpose |
|---|---|---|
| Frontend | Vercel | React SPA hosting |
| Backend | Railway | Spring Boot API |
| Database | Neon | PostgreSQL (already cloud-hosted) |

---

## 📁 Project Structure

```
TravelLuhh/
├── docker-compose.yml
│
├── backend/
│   └── src/main/java/com/travelluhh/
│       ├── controller/     REST endpoints
│       ├── service/        Business logic
│       ├── repository/     JPA repositories
│       ├── entity/         JPA entities → DB tables
│       ├── dto/            Request + response DTOs
│       ├── security/       JWT filter, OAuth2 handlers
│       └── exception/      Global exception handler
│   └── src/main/resources/
│       ├── application.yml App config
│       └── schema.sql      Full DB DDL (manual migrations)
│
└── frontend/src/
    ├── pages/              Route-level components
    ├── components/         Feature UI components
    ├── services/           API call layer
    ├── hooks/              useTrips, useExpenses
    ├── context/            AuthContext
    ├── lib/                axios.ts, currency.ts, export.ts
    └── types/              TypeScript interfaces
```

---

## 🗺 Roadmap

- [x] Email signup with OTP + Google OAuth2
- [x] JWT auth with silent token refresh
- [x] Trip CRUD with archive
- [x] Expense tracking with bundle sub-items
- [x] Multi-currency support (Frankfurter live rates)
- [x] Budget modes (solo / shared / separated)
- [x] Budget alerts (75% / 90% / 100%)
- [x] Analytics & charts (bento layout)
- [x] Split bill / Settle Up
- [x] Packing checklist with preset packs
- [x] Day-by-day itinerary planner
- [x] Activity feed
- [x] Trip data export (CSV + PDF)
- [x] Travel portfolio (Year in Review · Timeline · Map)
- [x] User profile settings
- [x] Quick price currency converter
- [ ] Trip member invite / remove / role change (backend)
- [ ] Edit expense
- [ ] Separated budget allocation per member
- [ ] Notes persistence to database
- [ ] Refresh token revocation on logout
- [ ] Real-time collaboration (WebSocket/SSE)
- [ ] Trip image upload
- [ ] Push/email notifications for budget alerts

---

## 📄 License

[MIT](LICENSE) © 2025 Siti Nursyaqirah

---

> Full technical docs, flow diagrams, and known issues → [DOCS.md](DOCS.md)
