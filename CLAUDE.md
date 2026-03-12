# PawForward Academy - Project Conventions

## Project Overview
Professional dog training business platform with Spring Boot backend, Angular frontend, and MCP server for AI agent integration.

## Tech Stack
- **Backend**: Java 17, Spring Boot 3.4.x, Spring Security, Spring Data JPA, PostgreSQL 16, Flyway
- **Frontend**: Angular 19 (standalone components), Tailwind CSS, TypeScript
- **MCP Server**: Separate Spring Boot app (port 8081) wrapping the REST API
- **Auth**: JWT (HS512) + Google OAuth2
- **Payments**: Stripe Checkout Sessions

## Project Structure
```
PetTraning/
├── backend/
│   ├── pawforward-api/     # Main REST API (port 8080)
│   └── pawforward-mcp/     # MCP Server (port 8081)
├── frontend/               # Angular SPA (port 4200)
└── docs/                   # Design docs and API specs
```

## Build & Run Commands

### Backend
```bash
# Build all modules
cd backend && mvn clean compile

# Run API (requires PostgreSQL via Docker)
cd backend/pawforward-api && mvn spring-boot:run

# Run tests
cd backend && mvn test
```

### Frontend
```bash
cd frontend && ng serve        # Dev server at localhost:4200
cd frontend && ng build        # Production build
cd frontend && ng test         # Unit tests
```

### Infrastructure
```bash
docker compose up -d           # Start PostgreSQL + pgAdmin
docker compose down            # Stop services
```

## Backend Conventions

### Package Structure
Feature-based packages under `com.pawforward.api`:
- Each feature has: Entity, Controller, Service, Repository, DTOs, (optional) Mapper
- Pattern: `Controller → Service → Repository`
- **Never expose JPA entities directly** - always use DTOs

### Naming
- Entities: singular (`User`, `Dog`, `Booking`)
- Controllers: `{Feature}Controller` (e.g., `BookingController`)
- Services: `{Feature}Service`
- Repositories: `{Feature}Repository`
- DTOs: `{Feature}Request`, `{Feature}Response`
- All REST endpoints prefixed with `/api/v1`

### Database
- Flyway migrations in `src/main/resources/db/migration/`
- Migration naming: `V{N}__{description}.sql`
- All tables use UUID primary keys
- Timestamps: `TIMESTAMP WITH TIME ZONE`
- Use `BaseEntity` abstract class for `id`, `createdAt`, `updatedAt`

### Error Handling
- Global exception handler in `GlobalExceptionHandler`
- Return `ApiError` DTOs with consistent format
- Use `EntityNotFoundException` for 404, `IllegalArgumentException` for 400, `IllegalStateException` for 409

## Frontend Conventions

### Structure
- `core/` - Singleton services, guards, interceptors, models (imported once in app root)
- `shared/` - Reusable components, pipes, directives (imported per feature)
- `features/` - Feature modules with lazy-loaded routes
- `layouts/` - Shell layouts (public, dashboard, admin)

### Components
- All components are **standalone** (Angular 19 default)
- Use **signals** for state management (not RxJS subjects for local state)
- Use **inline templates** for small components, separate files for large ones
- Tailwind CSS for all styling (no component CSS files)

### Routing
- Lazy load all feature routes
- Guard protected routes with `authGuard` and `roleGuard`
- Use `withComponentInputBinding()` for route params as component inputs

### Models
- All TypeScript interfaces in `core/models/`
- Barrel export from `core/models/index.ts`
- Enums for status fields (e.g., `BookingStatus`, `UserRole`)

### API Communication
- `AuthService` manages tokens and user state
- `authInterceptor` attaches Bearer tokens automatically
- `errorInterceptor` handles 401 redirects
- Environment-specific API URLs in `environments/`

## Git Conventions
- Branch naming: `feature/description`, `fix/description`, `chore/description`
- Commit messages: imperative mood, concise (e.g., "Add booking wizard component")
- One logical change per commit

## Key Config Files
- `backend/pawforward-api/src/main/resources/application.yml` - API config (profiles: dev, prod)
- `frontend/src/environments/environment.ts` - Frontend dev config
- `docker-compose.yml` - Local PostgreSQL (user: pawforward, pass: pawforward_dev, db: pawforward)
