# PawForward Academy - Full Architecture Plan

## Context

Building a professional dog training business website for dual use: (1) grad school project showcasing advanced web concepts including MCP/AI integration, and (2) production use for your brother's actual business. The app supports private 1-on-1 sessions, group classes, and board & train programs.

**Business Name**: PawForward Academy - *"Every paw, one step forward."*

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Spring Boot (Java 21) | 3.5.x |
| Frontend | Angular + Tailwind CSS | 19.x + 3.4.x |
| Database | PostgreSQL | 16 |
| Auth | Spring Security (JWT + Google OAuth2) | 6.4.x |
| Payments | Stripe (Checkout Sessions) | Java SDK 25.x |
| MCP Server | Spring AI MCP Server | 1.0.x |
| Migrations | Flyway | 10.x |
| Mapping | MapStruct + Lombok | Latest |
| Dev Env | Docker Compose (Postgres + pgAdmin + Stripe CLI) | v2 |

## Monorepo Structure

```
PetTraning/
├── docker-compose.yml           # Postgres, pgAdmin, Stripe CLI
├── .github/workflows/ci.yml     # GitHub Actions CI
├── backend/
│   ├── pom.xml                  # Parent POM (multi-module Maven)
│   ├── pawforward-api/          # Main REST API
│   │   └── src/main/java/com/pawforward/api/
│   └── pawforward-mcp/          # MCP Server (separate Spring Boot app, port 8081)
│       └── src/main/java/com/pawforward/mcp/
├── frontend/                    # Angular 19 SPA
│   └── src/app/
│       ├── core/                # Guards, interceptors, services, models
│       ├── shared/              # Reusable components, pipes, directives
│       ├── layouts/             # Public, Dashboard, Admin shell layouts
│       └── features/            # Feature modules (home, auth, booking, etc.)
└── docs/                        # OpenAPI spec, ERD, architecture docs
```

## Database Schema (Key Entities)

**Users & Auth**: `users`, `user_oauth_accounts`, `refresh_tokens`
**Dogs**: `dogs`, `dog_vaccinations`
**Trainers**: `trainer_profiles`, `trainer_availability`
**Services**: `service_types` (categories: PRIVATE, GROUP_CLASS, BOARD_AND_TRAIN)
**Scheduling**: `class_series`, `sessions`, `bookings`, `class_enrollments`
**Board & Train**: `board_train_programs` (with daily_notes JSONB)
**Training Progress**: `training_goals`, `training_logs`, `training_media`
**Payments**: `payments`, `packages`, `client_packages`
**Reviews**: `reviews` (with approval workflow)
**Notifications**: `notifications` (IN_APP, EMAIL, SMS channels)
**Referrals**: `referral_codes`, `referral_redemptions`
**Waitlist**: `waitlist_entries`
**Contact**: `contact_inquiries`

All tables use UUIDs as PKs, timestamps for auditing, Flyway-managed migrations.

## Backend Architecture

Feature-based package structure under `com.pawforward.api`:

- `config/` - SecurityConfig, JwtConfig, CorsConfig, StripeConfig, WebSocketConfig, OpenApiConfig
- `security/` - JwtTokenProvider, JwtAuthenticationFilter, OAuth2UserService, OAuth2SuccessHandler
- `auth/` - AuthController (register, login, refresh, OAuth2, password reset)
- `user/`, `dog/`, `trainer/`, `service/`, `scheduling/`, `booking/`, `boardtrain/`, `training/`, `payment/`, `review/`, `notification/`, `referral/`, `waitlist/`, `contact/`, `admin/`
- `common/` - BaseEntity, PageResponse, GlobalExceptionHandler

Each feature follows: **Controller -> Service -> Repository** with DTOs (never expose entities).

## Auth Flow

1. **Email/Password**: Register -> verify email -> login -> JWT access token (15min, in-memory) + refresh token (7-day, httpOnly cookie, rotation)
2. **Google OAuth2**: Spring Security OAuth2 Login -> CustomOAuth2UserService links/creates account -> same JWT flow
3. **JWT structure**: `{sub: userId, email, role, iat, exp}` signed with HS512

## Stripe Integration

- **Stripe Checkout Sessions** for all payments (single sessions, packages, class enrollment, board & train deposits)
- Webhook handler at `/api/v1/payments/webhook` verifies signature, handles `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
- Session packages tracked in `client_packages` with remaining count
- Referral code discounts applied at checkout

## MCP Server Design

Separate Spring Boot app (`pawforward-mcp`, port 8081) using `spring-ai-starter-mcp-server-webmvc`. Calls the main API via HTTP (RestClient with service key auth).

**Tools exposed**: `list_services`, `get_service_details`, `list_packages`, `list_upcoming_classes`, `get_available_slots`, `check_class_availability`, `create_booking`, `enroll_in_class`, `cancel_booking`, `get_client_bookings`, `list_trainers`, `get_trainer_profile`, `get_dog_profile`, `get_training_progress`, `get_training_logs`, `get_homework`, `submit_inquiry`

**Resources exposed**: `pawforward://business/info`, `pawforward://business/policies`, `pawforward://business/faq`, `pawforward://services/catalog`

**Chatbot relay**: `/chat` endpoint uses Spring AI ChatClient + MCP tools with an LLM to provide conversational interface.

## Key Features Beyond Basics

1. **Training Progress Dashboard** - Skill radar charts, goal tracking, session timeline, homework
2. **Interactive Booking Wizard** - 5-step flow with real-time availability, conflict detection, package usage
3. **Board & Train Live Updates** - Daily photo/video journal, timeline view, push notifications
4. **Real-Time Notifications** - WebSocket (STOMP) for in-app + email via SendGrid/Spring Mail
5. **Admin Analytics** - Revenue charts, client growth, trainer utilization, popular services heatmap
6. **Vaccination Compliance** - Upload records, expiration alerts, booking enforcement
7. **Referral Program** - Unique codes, discounts, credit tracking, dashboard
8. **Waitlist System** - Auto-notify when spots open, position tracking
9. **AI Chatbot** - Floating widget, MCP-powered, answers questions and helps book

## REST API Summary (~80+ endpoints)

All prefixed with `/api/v1`. Key groups:
- `auth/` - register, login, refresh, OAuth2, password reset (public)
- `users/` - profile CRUD, admin user management
- `dogs/` - CRUD + vaccinations + photo upload
- `trainers/` - public listing, profiles, availability (public GETs)
- `services/` - catalog CRUD (public GETs, admin writes)
- `scheduling/` - class series, sessions, available slots
- `bookings/` - create, cancel, enroll, history
- `board-train/` - request, daily notes, progress
- `training/` - goals, logs, media upload
- `payments/` - checkout, webhook, packages, revenue reports
- `reviews/` - submit, approve, feature
- `notifications/` - list, read, unread count
- `referrals/` - generate, redeem
- `waitlist/` - join, leave
- `contact/` - submit inquiry (public), admin management
- `admin/` - dashboard stats, revenue, analytics

## Frontend Design Prompt

A comprehensive prompt for the frontend design agent is included as a separate document. It covers:
- Brand identity (colors, typography, visual style)
- All global elements (navbars for public/client/trainer/admin, footer, chatbot widget)
- 37 detailed page specifications with exact layouts, components, and interactions
- Responsive design requirements (mobile/tablet/desktop)
- Animation and micro-interaction specs
- WCAG 2.1 AA accessibility requirements

**The full frontend design prompt should be saved to `docs/frontend-design-prompt.md` when implementation begins.**

## Implementation Phases (12 weeks)

| Phase | Week | Focus |
|-------|------|-------|
| 1 | 1 | Project scaffolding: Docker Compose, Spring Boot + Maven multi-module, Angular + Tailwind, folder structure |
| 2 | 2 | Auth system: Users table, JWT, email/password register+login, Google OAuth2, frontend auth pages |
| 3 | 3 | Core domain: Dogs, Trainers, Services, Sessions, Bookings entities + CRUD + frontend public pages |
| 4 | 4 | Booking & scheduling: Availability engine, booking wizard, class schedule, waitlist |
| 5 | 5 | Stripe payments: Checkout sessions, webhooks, packages, frontend payment flows |
| 6 | 6 | Board & Train + Training Progress: Daily updates, goals, logs, media uploads, charts |
| 7 | 7 | Dashboards: Client dashboard, Trainer portal with schedule/clients/log creation |
| 8 | 8 | Notifications: WebSocket real-time, email templates, notification preferences |
| 9 | 8-9 | Reviews, Referrals, Contact, About pages |
| 10 | 9-10 | Admin dashboard: Analytics charts, management pages, data tables |
| 11 | 10-11 | MCP Server + Chatbot: MCP tools/resources, chat relay, frontend chatbot widget |
| 12 | 11-12 | Polish: Tests (JUnit/Mockito/Testcontainers/Playwright), OpenAPI docs, CI pipeline, PWA, perf |

## Verification Plan

1. **Auth**: Register -> verify email -> login -> get JWT -> access protected endpoint -> refresh token -> Google OAuth2 login
2. **Booking**: Browse services -> select dog -> choose trainer -> pick slot -> Stripe checkout -> confirm booking -> receive notification
3. **Payments**: Complete checkout -> verify webhook received -> payment recorded -> booking confirmed
4. **MCP**: Connect AI agent to MCP server -> call `list_services` -> call `get_available_slots` -> call `create_booking`
5. **Chatbot**: Open widget -> ask "What services do you offer?" -> verify MCP tools called -> response rendered
6. **Admin**: Login as admin -> view dashboard stats -> manage users/services/bookings -> view revenue reports
7. **Board & Train**: Request program -> trainer adds daily notes with photos -> client sees live updates
8. **CI**: Push to GitHub -> Actions build backend + frontend -> run tests -> all green
