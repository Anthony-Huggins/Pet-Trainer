# PawForward Academy - Complete Architecture Plan

> Auto-generated detailed architecture plan covering database schema, backend structure, API endpoints, auth flows, Stripe integration, MCP server design, frontend components, and implementation phases.

---

# PawForward Academy -- Comprehensive Architecture and Implementation Plan

## Business Name Recommendation

**PawForward Academy** is an excellent choice. It is clean, memorable, and implies progress ("paw" + "forward"), which aligns perfectly with a training business. The tagline could be: *"Every paw, one step forward."*

---

## 1. Project Structure -- Monorepo Layout

Given that Spring Boot 4.0 is the current GA release (4.0.3 as of February 2026), but it introduces significant breaking changes (Jackson 3, JUnit 6, Spring Framework 7, Jakarta EE 11), I recommend targeting **Spring Boot 3.5.x** for this project. Spring Boot 3.5 is the current stable LTS bridge, well-documented, and has the widest ecosystem compatibility with Stripe SDK, Spring AI MCP starters, and other libraries. This avoids the bleeding-edge migration pain of 4.0 while still being fully supported and modern. For Angular, target **Angular 19** (stable, standalone-by-default) rather than the very recent Angular 21 which may have less ecosystem support.

```
C:\Users\langn\Skillstorm\Training\projects\PetTraning\
|
+-- README.md
+-- .gitignore
+-- docker-compose.yml                  # PostgreSQL, pgAdmin, Stripe CLI (webhook forwarding)
+-- .github/
|   +-- workflows/
|       +-- ci.yml                      # GitHub Actions CI pipeline
|
+-- backend/
|   +-- pom.xml                         # Parent POM (multi-module Maven)
|   +-- pawforward-api/                 # Main REST API module
|   |   +-- pom.xml
|   |   +-- src/
|   |       +-- main/
|   |       |   +-- java/com/pawforward/api/
|   |       |   +-- resources/
|   |       |       +-- application.yml
|   |       |       +-- application-dev.yml
|   |       |       +-- application-prod.yml
|   |       |       +-- db/migration/   # Flyway migrations
|   |       +-- test/
|   |           +-- java/com/pawforward/api/
|   |
|   +-- pawforward-mcp/                 # MCP Server module
|       +-- pom.xml
|       +-- src/
|           +-- main/
|           |   +-- java/com/pawforward/mcp/
|           |   +-- resources/
|           |       +-- application.yml
|           +-- test/
|
+-- frontend/
|   +-- angular.json
|   +-- package.json
|   +-- tailwind.config.js
|   +-- tsconfig.json
|   +-- src/
|       +-- app/
|       |   +-- app.component.ts
|       |   +-- app.config.ts
|       |   +-- app.routes.ts
|       |   +-- core/                   # Guards, interceptors, services
|       |   +-- shared/                 # Shared components, pipes, directives
|       |   +-- features/              # Feature modules
|       |   +-- layouts/               # Shell layouts (public, authenticated, admin)
|       +-- assets/
|       +-- environments/
|       +-- styles.css                 # Tailwind imports
|
+-- docs/
    +-- api-spec.yaml                  # OpenAPI 3.0 spec
    +-- database-erd.md
    +-- architecture.md
```

---

## 2. Database Schema

### Entity-Relationship Overview

The database uses PostgreSQL with Flyway migrations. All tables use UUIDs as primary keys, timestamps for auditing, and soft-delete where appropriate.

### Tables and Relationships

```
=== USERS & AUTH ===

users
  id                  UUID PK DEFAULT gen_random_uuid()
  email               VARCHAR(255) UNIQUE NOT NULL
  password_hash       VARCHAR(255) NULL          -- null for OAuth-only users
  first_name          VARCHAR(100) NOT NULL
  last_name           VARCHAR(100) NOT NULL
  phone               VARCHAR(20)
  avatar_url          VARCHAR(500)
  role                VARCHAR(20) NOT NULL DEFAULT 'CLIENT'  -- CLIENT, TRAINER, ADMIN
  email_verified      BOOLEAN DEFAULT FALSE
  enabled             BOOLEAN DEFAULT TRUE
  stripe_customer_id  VARCHAR(255)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

user_oauth_accounts
  id                  UUID PK
  user_id             UUID FK -> users(id)
  provider            VARCHAR(50) NOT NULL       -- 'google'
  provider_account_id VARCHAR(255) NOT NULL
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  UNIQUE(provider, provider_account_id)

refresh_tokens
  id                  UUID PK
  user_id             UUID FK -> users(id)
  token               VARCHAR(500) UNIQUE NOT NULL
  expires_at          TIMESTAMP WITH TIME ZONE NOT NULL
  revoked             BOOLEAN DEFAULT FALSE
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== DOGS & PROFILES ===

dogs
  id                  UUID PK
  owner_id            UUID FK -> users(id) NOT NULL
  name                VARCHAR(100) NOT NULL
  breed               VARCHAR(100)
  date_of_birth       DATE
  weight_lbs          DECIMAL(5,1)
  gender              VARCHAR(10)
  spayed_neutered     BOOLEAN
  microchip_id        VARCHAR(50)
  veterinarian_name   VARCHAR(200)
  veterinarian_phone  VARCHAR(20)
  special_needs       TEXT
  profile_photo_url   VARCHAR(500)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

dog_vaccinations
  id                  UUID PK
  dog_id              UUID FK -> dogs(id)
  vaccination_name    VARCHAR(100) NOT NULL     -- Rabies, DHPP, Bordetella, etc.
  administered_date   DATE NOT NULL
  expiration_date     DATE
  document_url        VARCHAR(500)              -- uploaded proof
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== TRAINERS ===

trainer_profiles
  id                  UUID PK
  user_id             UUID FK -> users(id) UNIQUE NOT NULL
  bio                 TEXT
  specializations     TEXT[]                    -- PostgreSQL array: {'puppy','aggression','agility'}
  certifications      TEXT[]
  years_experience    INTEGER
  hourly_rate         DECIMAL(8,2)
  profile_photo_url   VARCHAR(500)
  is_accepting_clients BOOLEAN DEFAULT TRUE
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

trainer_availability
  id                  UUID PK
  trainer_id          UUID FK -> trainer_profiles(id)
  day_of_week         SMALLINT NOT NULL         -- 0=Sunday, 6=Saturday
  start_time          TIME NOT NULL
  end_time            TIME NOT NULL
  is_recurring        BOOLEAN DEFAULT TRUE
  specific_date       DATE                      -- for one-off overrides
  is_available        BOOLEAN DEFAULT TRUE      -- false = blocked-off time
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== SERVICES & SCHEDULING ===

service_types
  id                  UUID PK
  name                VARCHAR(200) NOT NULL
  category            VARCHAR(50) NOT NULL       -- PRIVATE, GROUP_CLASS, BOARD_AND_TRAIN
  description         TEXT
  duration_minutes    INTEGER
  max_participants    INTEGER                    -- null for private, n for group
  price               DECIMAL(8,2) NOT NULL
  deposit_amount      DECIMAL(8,2)
  is_active           BOOLEAN DEFAULT TRUE
  sort_order          INTEGER DEFAULT 0
  image_url           VARCHAR(500)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Recurring class series (e.g., "Puppy Basics - Spring 2026 Session")
class_series
  id                  UUID PK
  service_type_id     UUID FK -> service_types(id) NOT NULL
  trainer_id          UUID FK -> trainer_profiles(id) NOT NULL
  title               VARCHAR(200) NOT NULL
  description         TEXT
  start_date          DATE NOT NULL
  end_date            DATE NOT NULL
  day_of_week         SMALLINT NOT NULL
  start_time          TIME NOT NULL
  end_time            TIME NOT NULL
  location            VARCHAR(200)
  max_participants    INTEGER NOT NULL
  current_enrollment  INTEGER DEFAULT 0
  status              VARCHAR(20) DEFAULT 'OPEN'  -- OPEN, FULL, IN_PROGRESS, COMPLETED, CANCELLED
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Individual scheduled sessions (both private and per-class-occurrence)
sessions
  id                  UUID PK
  service_type_id     UUID FK -> service_types(id)
  class_series_id     UUID FK -> class_series(id)  -- null for private sessions
  trainer_id          UUID FK -> trainer_profiles(id) NOT NULL
  session_date        DATE NOT NULL
  start_time          TIME NOT NULL
  end_time            TIME NOT NULL
  location            VARCHAR(200)
  status              VARCHAR(20) DEFAULT 'SCHEDULED'  -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  notes               TEXT
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Bookings link users/dogs to sessions
bookings
  id                  UUID PK
  session_id          UUID FK -> sessions(id) NOT NULL
  client_id           UUID FK -> users(id) NOT NULL
  dog_id              UUID FK -> dogs(id) NOT NULL
  status              VARCHAR(20) DEFAULT 'CONFIRMED'  -- CONFIRMED, CANCELLED, WAITLISTED, NO_SHOW, COMPLETED
  cancellation_reason TEXT
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Class series enrollments (for group classes)
class_enrollments
  id                  UUID PK
  class_series_id     UUID FK -> class_series(id) NOT NULL
  client_id           UUID FK -> users(id) NOT NULL
  dog_id              UUID FK -> dogs(id) NOT NULL
  status              VARCHAR(20) DEFAULT 'ENROLLED'  -- ENROLLED, WAITLISTED, DROPPED, COMPLETED
  waitlist_position   INTEGER
  enrolled_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Board & Train programs
board_train_programs
  id                  UUID PK
  service_type_id     UUID FK -> service_types(id) NOT NULL
  client_id           UUID FK -> users(id) NOT NULL
  dog_id              UUID FK -> dogs(id) NOT NULL
  trainer_id          UUID FK -> trainer_profiles(id) NOT NULL
  start_date          DATE NOT NULL
  end_date            DATE NOT NULL
  status              VARCHAR(20) DEFAULT 'PENDING'  -- PENDING, ACTIVE, COMPLETED, CANCELLED
  daily_notes         JSONB DEFAULT '[]'::jsonb
  pickup_instructions TEXT
  dropoff_instructions TEXT
  emergency_contact_name    VARCHAR(200)
  emergency_contact_phone   VARCHAR(20)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== TRAINING PROGRESS ===

training_goals
  id                  UUID PK
  dog_id              UUID FK -> dogs(id) NOT NULL
  trainer_id          UUID FK -> trainer_profiles(id)
  title               VARCHAR(200) NOT NULL
  description         TEXT
  target_date         DATE
  status              VARCHAR(20) DEFAULT 'IN_PROGRESS'  -- IN_PROGRESS, ACHIEVED, PAUSED, ABANDONED
  progress_percent    INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

training_logs
  id                  UUID PK
  session_id          UUID FK -> sessions(id)
  dog_id              UUID FK -> dogs(id) NOT NULL
  trainer_id          UUID FK -> trainer_profiles(id) NOT NULL
  log_date            DATE NOT NULL DEFAULT CURRENT_DATE
  summary             TEXT NOT NULL
  skills_worked       TEXT[]                    -- e.g., {'sit','stay','recall'}
  behavior_notes      TEXT
  homework            TEXT                      -- homework assigned to owner
  rating              SMALLINT CHECK (rating BETWEEN 1 AND 5)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

training_media
  id                  UUID PK
  training_log_id     UUID FK -> training_logs(id)
  dog_id              UUID FK -> dogs(id)
  media_type          VARCHAR(20) NOT NULL      -- PHOTO, VIDEO
  url                 VARCHAR(500) NOT NULL
  thumbnail_url       VARCHAR(500)
  caption             TEXT
  uploaded_by         UUID FK -> users(id)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== PAYMENTS ===

payments
  id                  UUID PK
  client_id           UUID FK -> users(id) NOT NULL
  booking_id          UUID FK -> bookings(id)
  class_enrollment_id UUID FK -> class_enrollments(id)
  board_train_id      UUID FK -> board_train_programs(id)
  amount              DECIMAL(10,2) NOT NULL
  currency            VARCHAR(3) DEFAULT 'usd'
  payment_type        VARCHAR(20) NOT NULL      -- DEPOSIT, FULL, INSTALLMENT, REFUND
  status              VARCHAR(20) NOT NULL       -- PENDING, SUCCEEDED, FAILED, REFUNDED, PARTIALLY_REFUNDED
  stripe_payment_intent_id VARCHAR(255)
  stripe_checkout_session_id VARCHAR(255)
  description         TEXT
  metadata            JSONB
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

packages
  id                  UUID PK
  name                VARCHAR(200) NOT NULL
  description         TEXT
  session_count       INTEGER NOT NULL           -- e.g., 5-pack, 10-pack
  price               DECIMAL(8,2) NOT NULL
  per_session_price   DECIMAL(8,2)               -- computed savings display
  valid_days          INTEGER                    -- days until expiration
  service_type_id     UUID FK -> service_types(id)
  is_active           BOOLEAN DEFAULT TRUE
  stripe_price_id     VARCHAR(255)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

client_packages
  id                  UUID PK
  client_id           UUID FK -> users(id) NOT NULL
  package_id          UUID FK -> packages(id) NOT NULL
  sessions_remaining  INTEGER NOT NULL
  purchased_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  expires_at          TIMESTAMP WITH TIME ZONE
  stripe_subscription_id VARCHAR(255)
  status              VARCHAR(20) DEFAULT 'ACTIVE'  -- ACTIVE, EXPIRED, DEPLETED, CANCELLED
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== REVIEWS & TESTIMONIALS ===

reviews
  id                  UUID PK
  client_id           UUID FK -> users(id) NOT NULL
  trainer_id          UUID FK -> trainer_profiles(id)
  service_type_id     UUID FK -> service_types(id)
  rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5)
  title               VARCHAR(200)
  body                TEXT
  is_featured         BOOLEAN DEFAULT FALSE
  is_approved         BOOLEAN DEFAULT FALSE
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== NOTIFICATIONS ===

notifications
  id                  UUID PK
  user_id             UUID FK -> users(id) NOT NULL
  type                VARCHAR(50) NOT NULL       -- BOOKING_CONFIRMED, SESSION_REMINDER, PAYMENT_RECEIVED, etc.
  title               VARCHAR(200) NOT NULL
  message             TEXT NOT NULL
  data                JSONB                      -- structured payload (booking_id, etc.)
  is_read             BOOLEAN DEFAULT FALSE
  channel             VARCHAR(20) DEFAULT 'IN_APP'  -- IN_APP, EMAIL, SMS
  sent_at             TIMESTAMP WITH TIME ZONE
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== LOYALTY & REFERRALS ===

referral_codes
  id                  UUID PK
  referrer_id         UUID FK -> users(id) NOT NULL
  code                VARCHAR(20) UNIQUE NOT NULL
  discount_percent    INTEGER DEFAULT 10
  max_uses            INTEGER
  times_used          INTEGER DEFAULT 0
  is_active           BOOLEAN DEFAULT TRUE
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

referral_redemptions
  id                  UUID PK
  referral_code_id    UUID FK -> referral_codes(id) NOT NULL
  referred_user_id    UUID FK -> users(id) NOT NULL
  payment_id          UUID FK -> payments(id)
  discount_applied    DECIMAL(8,2)
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== WAITLIST ===

waitlist_entries
  id                  UUID PK
  class_series_id     UUID FK -> class_series(id) NOT NULL
  client_id           UUID FK -> users(id) NOT NULL
  dog_id              UUID FK -> dogs(id) NOT NULL
  position            INTEGER NOT NULL
  notified            BOOLEAN DEFAULT FALSE
  status              VARCHAR(20) DEFAULT 'WAITING'  -- WAITING, OFFERED, ACCEPTED, EXPIRED
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()

=== CONTACT / INQUIRIES ===

contact_inquiries
  id                  UUID PK
  name                VARCHAR(200) NOT NULL
  email               VARCHAR(255) NOT NULL
  phone               VARCHAR(20)
  subject             VARCHAR(200)
  message             TEXT NOT NULL
  dog_name            VARCHAR(100)
  service_interest    VARCHAR(50)               -- which service category
  status              VARCHAR(20) DEFAULT 'NEW'  -- NEW, IN_PROGRESS, RESOLVED
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### Key Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_dogs_owner ON dogs(owner_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_trainer ON sessions(trainer_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_class_series_status ON class_series(status);
CREATE INDEX idx_training_logs_dog ON training_logs(dog_id);
```

---

## 3. Backend Architecture

### Technology Choices

- **Spring Boot 3.5.x** with Java 21
- **Spring Security 6.x** with OAuth2 Resource Server + OAuth2 Login
- **Spring Data JPA** with Hibernate 6
- **Flyway** for database migrations
- **MapStruct** for DTO mapping
- **Lombok** for boilerplate reduction
- **Springdoc OpenAPI** for API documentation
- **Spring AI 1.0.x** for MCP server module

### Maven Multi-Module Structure

The parent POM at `backend/pom.xml` defines two modules:

```
backend/
+-- pom.xml                          # Parent POM
+-- pawforward-api/
|   +-- pom.xml                      # Main API application
+-- pawforward-mcp/
    +-- pom.xml                      # MCP server (depends on pawforward-api)
```

### Package Structure (Feature-Based)

Following the feature-based approach recommended for larger applications:

```
com.pawforward.api
|
+-- PawForwardApiApplication.java
|
+-- config/
|   +-- SecurityConfig.java
|   +-- JwtConfig.java
|   +-- CorsConfig.java
|   +-- StripeConfig.java
|   +-- WebSocketConfig.java
|   +-- S3Config.java                  # Or Cloudinary for media uploads
|   +-- OpenApiConfig.java
|   +-- AuditingConfig.java
|
+-- security/
|   +-- JwtTokenProvider.java
|   +-- JwtAuthenticationFilter.java
|   +-- CustomUserDetailsService.java
|   +-- OAuth2AuthenticationSuccessHandler.java
|   +-- OAuth2UserService.java
|   +-- SecurityUtils.java
|
+-- auth/
|   +-- AuthController.java
|   +-- AuthService.java
|   +-- dto/
|   |   +-- LoginRequest.java
|   |   +-- RegisterRequest.java
|   |   +-- AuthResponse.java
|   |   +-- TokenRefreshRequest.java
|   +-- RefreshToken.java              # Entity
|   +-- RefreshTokenRepository.java
|
+-- user/
|   +-- User.java                     # Entity
|   +-- UserController.java
|   +-- UserService.java
|   +-- UserRepository.java
|   +-- UserOAuthAccount.java          # Entity
|   +-- UserOAuthAccountRepository.java
|   +-- dto/
|       +-- UserResponse.java
|       +-- UserUpdateRequest.java
|       +-- UserProfileResponse.java
|
+-- dog/
|   +-- Dog.java
|   +-- DogController.java
|   +-- DogService.java
|   +-- DogRepository.java
|   +-- DogVaccination.java
|   +-- DogVaccinationRepository.java
|   +-- dto/
|       +-- DogRequest.java
|       +-- DogResponse.java
|       +-- VaccinationRequest.java
|       +-- VaccinationResponse.java
|
+-- trainer/
|   +-- TrainerProfile.java
|   +-- TrainerProfileController.java
|   +-- TrainerProfileService.java
|   +-- TrainerProfileRepository.java
|   +-- TrainerAvailability.java
|   +-- TrainerAvailabilityRepository.java
|   +-- dto/
|       +-- TrainerProfileResponse.java
|       +-- TrainerAvailabilityRequest.java
|       +-- AvailabilitySlotResponse.java
|
+-- service/                          # "Service types" domain (to avoid name conflict)
|   +-- ServiceType.java
|   +-- ServiceTypeController.java
|   +-- ServiceTypeService.java
|   +-- ServiceTypeRepository.java
|   +-- dto/
|       +-- ServiceTypeRequest.java
|       +-- ServiceTypeResponse.java
|
+-- scheduling/
|   +-- Session.java
|   +-- SessionController.java
|   +-- SessionService.java
|   +-- SessionRepository.java
|   +-- ClassSeries.java
|   +-- ClassSeriesController.java
|   +-- ClassSeriesService.java
|   +-- ClassSeriesRepository.java
|   +-- dto/
|       +-- SessionResponse.java
|       +-- CreateSessionRequest.java
|       +-- ClassSeriesResponse.java
|       +-- CreateClassSeriesRequest.java
|
+-- booking/
|   +-- Booking.java
|   +-- BookingController.java
|   +-- BookingService.java
|   +-- BookingRepository.java
|   +-- ClassEnrollment.java
|   +-- ClassEnrollmentRepository.java
|   +-- dto/
|       +-- BookingRequest.java
|       +-- BookingResponse.java
|       +-- EnrollmentRequest.java
|       +-- EnrollmentResponse.java
|
+-- boardtrain/
|   +-- BoardTrainProgram.java
|   +-- BoardTrainController.java
|   +-- BoardTrainService.java
|   +-- BoardTrainRepository.java
|   +-- dto/
|       +-- BoardTrainRequest.java
|       +-- BoardTrainResponse.java
|       +-- DailyNoteRequest.java
|
+-- training/
|   +-- TrainingGoal.java
|   +-- TrainingGoalController.java
|   +-- TrainingGoalService.java
|   +-- TrainingGoalRepository.java
|   +-- TrainingLog.java
|   +-- TrainingLogController.java
|   +-- TrainingLogService.java
|   +-- TrainingLogRepository.java
|   +-- TrainingMedia.java
|   +-- TrainingMediaRepository.java
|   +-- dto/
|       +-- TrainingGoalRequest.java
|       +-- TrainingGoalResponse.java
|       +-- TrainingLogRequest.java
|       +-- TrainingLogResponse.java
|       +-- MediaUploadResponse.java
|
+-- payment/
|   +-- Payment.java
|   +-- PaymentController.java
|   +-- PaymentService.java
|   +-- PaymentRepository.java
|   +-- StripeWebhookController.java
|   +-- StripeService.java
|   +-- Package.java                   # Entity (session packages)
|   +-- PackageRepository.java
|   +-- ClientPackage.java
|   +-- ClientPackageRepository.java
|   +-- dto/
|       +-- CreateCheckoutRequest.java
|       +-- CheckoutResponse.java
|       +-- PaymentResponse.java
|       +-- PackageResponse.java
|
+-- review/
|   +-- Review.java
|   +-- ReviewController.java
|   +-- ReviewService.java
|   +-- ReviewRepository.java
|   +-- dto/
|       +-- ReviewRequest.java
|       +-- ReviewResponse.java
|
+-- notification/
|   +-- Notification.java
|   +-- NotificationController.java
|   +-- NotificationService.java
|   +-- NotificationRepository.java
|   +-- WebSocketNotificationService.java
|   +-- EmailNotificationService.java
|   +-- dto/
|       +-- NotificationResponse.java
|
+-- referral/
|   +-- ReferralCode.java
|   +-- ReferralRedemption.java
|   +-- ReferralController.java
|   +-- ReferralService.java
|   +-- ReferralCodeRepository.java
|   +-- dto/
|       +-- ReferralCodeResponse.java
|       +-- RedeemReferralRequest.java
|
+-- waitlist/
|   +-- WaitlistEntry.java
|   +-- WaitlistController.java
|   +-- WaitlistService.java
|   +-- WaitlistEntryRepository.java
|   +-- dto/
|       +-- WaitlistResponse.java
|
+-- contact/
|   +-- ContactInquiry.java
|   +-- ContactController.java
|   +-- ContactService.java
|   +-- ContactInquiryRepository.java
|   +-- dto/
|       +-- ContactRequest.java
|       +-- ContactResponse.java
|
+-- admin/
|   +-- AdminDashboardController.java
|   +-- AdminDashboardService.java
|   +-- dto/
|       +-- DashboardStatsResponse.java
|       +-- RevenueReportResponse.java
|       +-- BookingAnalyticsResponse.java
|
+-- common/
    +-- BaseEntity.java                # Mapped superclass with id, createdAt, updatedAt
    +-- PageResponse.java              # Generic paginated response wrapper
    +-- ApiError.java
    +-- GlobalExceptionHandler.java
    +-- AuditableEntity.java
```

### Key Design Patterns

1. **Controller -> Service -> Repository** layering within each feature
2. **DTOs** for all request/response objects (never expose entities directly)
3. **MapStruct mappers** per feature for Entity <-> DTO conversion
4. **Global exception handler** with `@ControllerAdvice`
5. **BaseEntity** abstract class with `id`, `createdAt`, `updatedAt` using JPA auditing
6. **Specification pattern** for dynamic queries (e.g., filtering sessions by date range, trainer, status)

---

## 4. API Design -- REST Endpoints

All endpoints are prefixed with `/api/v1`. Authentication is via Bearer JWT token unless marked `[public]`.

### Auth (`/api/v1/auth`)

```
POST   /api/v1/auth/register                [public]   Register with email/password
POST   /api/v1/auth/login                   [public]   Login, returns access + refresh tokens
POST   /api/v1/auth/refresh                 [public]   Refresh access token
POST   /api/v1/auth/logout                             Revoke refresh token
GET    /api/v1/auth/verify-email?token=...   [public]   Email verification
POST   /api/v1/auth/forgot-password          [public]   Initiate password reset
POST   /api/v1/auth/reset-password           [public]   Complete password reset
GET    /api/v1/auth/oauth2/google            [public]   Initiates Google OAuth2 flow
GET    /api/v1/auth/oauth2/callback/google   [public]   Google OAuth2 callback
GET    /api/v1/auth/me                                  Get current authenticated user
```

### Users (`/api/v1/users`)

```
GET    /api/v1/users/profile                           Get own profile
PUT    /api/v1/users/profile                           Update own profile
PUT    /api/v1/users/profile/avatar                    Upload avatar
PUT    /api/v1/users/change-password                   Change password
GET    /api/v1/users                         [admin]   List all users (paginated, filterable)
GET    /api/v1/users/{id}                    [admin]   Get user by ID
PUT    /api/v1/users/{id}/role               [admin]   Change user role
PUT    /api/v1/users/{id}/status             [admin]   Enable/disable user
```

### Dogs (`/api/v1/dogs`)

```
POST   /api/v1/dogs                                    Add a new dog
GET    /api/v1/dogs                                    List own dogs
GET    /api/v1/dogs/{id}                               Get dog details
PUT    /api/v1/dogs/{id}                               Update dog info
DELETE /api/v1/dogs/{id}                               Remove dog (soft delete)
POST   /api/v1/dogs/{id}/vaccinations                  Add vaccination record
GET    /api/v1/dogs/{id}/vaccinations                  List vaccinations
PUT    /api/v1/dogs/{id}/vaccinations/{vacId}          Update vaccination
DELETE /api/v1/dogs/{id}/vaccinations/{vacId}          Remove vaccination
POST   /api/v1/dogs/{id}/photo                         Upload dog profile photo
GET    /api/v1/dogs/{id}/training-history               Get all training logs for this dog
GET    /api/v1/dogs/{id}/goals                          Get training goals for this dog
```

### Trainers (`/api/v1/trainers`)

```
GET    /api/v1/trainers                      [public]   List active trainers (for public pages)
GET    /api/v1/trainers/{id}                 [public]   Get trainer public profile
GET    /api/v1/trainers/{id}/availability               Get trainer availability calendar
PUT    /api/v1/trainers/profile              [trainer]  Update own trainer profile
PUT    /api/v1/trainers/availability         [trainer]  Set availability slots
GET    /api/v1/trainers/{id}/reviews         [public]   Get trainer reviews
GET    /api/v1/trainers/my-schedule          [trainer]  Get own upcoming sessions
GET    /api/v1/trainers/my-clients           [trainer]  Get assigned clients/dogs
```

### Services (`/api/v1/services`)

```
GET    /api/v1/services                      [public]   List all active service types
GET    /api/v1/services/{id}                 [public]   Get service details
POST   /api/v1/services                      [admin]    Create service type
PUT    /api/v1/services/{id}                 [admin]    Update service type
DELETE /api/v1/services/{id}                 [admin]    Deactivate service
GET    /api/v1/services/packages             [public]   List available session packages
```

### Scheduling (`/api/v1/scheduling`)

```
GET    /api/v1/scheduling/class-series       [public]   List upcoming class series
GET    /api/v1/scheduling/class-series/{id}  [public]   Get class series details + sessions
POST   /api/v1/scheduling/class-series       [admin]    Create class series
PUT    /api/v1/scheduling/class-series/{id}  [admin]    Update class series
GET    /api/v1/scheduling/sessions                      List sessions (filtered by date, trainer, etc.)
POST   /api/v1/scheduling/sessions           [trainer+] Create a session
PUT    /api/v1/scheduling/sessions/{id}      [trainer+] Update session
GET    /api/v1/scheduling/available-slots               Get bookable time slots for a trainer/service
```

### Bookings (`/api/v1/bookings`)

```
POST   /api/v1/bookings                                Book a private session
GET    /api/v1/bookings                                List own bookings
GET    /api/v1/bookings/{id}                           Get booking details
PUT    /api/v1/bookings/{id}/cancel                    Cancel booking
POST   /api/v1/bookings/enroll                         Enroll in a group class series
GET    /api/v1/bookings/enrollments                    List own class enrollments
PUT    /api/v1/bookings/enrollments/{id}/drop          Drop from class
GET    /api/v1/bookings/upcoming                       Get next upcoming appointments
GET    /api/v1/bookings/history                        Get past appointments
```

### Board & Train (`/api/v1/board-train`)

```
POST   /api/v1/board-train                             Request a board & train program
GET    /api/v1/board-train                              List own programs
GET    /api/v1/board-train/{id}                         Get program details + daily logs
PUT    /api/v1/board-train/{id}              [trainer+] Update program
POST   /api/v1/board-train/{id}/daily-note   [trainer]  Add daily note
GET    /api/v1/board-train/{id}/daily-notes             Get all daily notes
```

### Training Progress (`/api/v1/training`)

```
POST   /api/v1/training/goals                          Create training goal
GET    /api/v1/training/goals                          List goals (for own dogs, or all if trainer)
PUT    /api/v1/training/goals/{id}                     Update goal progress
DELETE /api/v1/training/goals/{id}                     Remove goal
POST   /api/v1/training/logs                [trainer]  Create training log entry
GET    /api/v1/training/logs                           List training logs
GET    /api/v1/training/logs/{id}                      Get log details
POST   /api/v1/training/media               [trainer]  Upload training photo/video
GET    /api/v1/training/media/dog/{dogId}              Get media gallery for a dog
```

### Payments (`/api/v1/payments`)

```
POST   /api/v1/payments/checkout-session                Create Stripe Checkout session
POST   /api/v1/payments/package-checkout                Create Checkout for a session package
GET    /api/v1/payments                                 List own payment history
GET    /api/v1/payments/{id}                            Get payment details
POST   /api/v1/payments/webhook              [public]   Stripe webhook endpoint (verified by signature)
GET    /api/v1/payments/packages                        List purchased packages
POST   /api/v1/payments/use-package                     Use a session from a package for booking
GET    /api/v1/payments/revenue               [admin]   Revenue reports
```

### Reviews (`/api/v1/reviews`)

```
POST   /api/v1/reviews                                 Submit a review
GET    /api/v1/reviews                       [public]   List approved reviews
GET    /api/v1/reviews/pending               [admin]    List reviews pending approval
PUT    /api/v1/reviews/{id}/approve          [admin]    Approve review
PUT    /api/v1/reviews/{id}/feature          [admin]    Toggle featured status
DELETE /api/v1/reviews/{id}                             Delete own review
```

### Notifications (`/api/v1/notifications`)

```
GET    /api/v1/notifications                            List own notifications
GET    /api/v1/notifications/unread-count               Get unread count
PUT    /api/v1/notifications/{id}/read                  Mark as read
PUT    /api/v1/notifications/read-all                   Mark all as read
```

### Referrals (`/api/v1/referrals`)

```
POST   /api/v1/referrals/generate                      Generate personal referral code
GET    /api/v1/referrals/my-code                        Get own referral code + stats
POST   /api/v1/referrals/redeem              [public]   Validate a referral code
```

### Waitlist (`/api/v1/waitlist`)

```
POST   /api/v1/waitlist                                Join waitlist for a full class
GET    /api/v1/waitlist                                List own waitlist entries
DELETE /api/v1/waitlist/{id}                            Leave waitlist
```

### Contact (`/api/v1/contact`)

```
POST   /api/v1/contact                       [public]   Submit contact inquiry
GET    /api/v1/contact                       [admin]    List inquiries
PUT    /api/v1/contact/{id}/status           [admin]    Update inquiry status
```

### Admin Dashboard (`/api/v1/admin`)

```
GET    /api/v1/admin/dashboard/stats                    Overview statistics
GET    /api/v1/admin/dashboard/revenue                  Revenue breakdown by time period
GET    /api/v1/admin/dashboard/bookings                 Booking analytics
GET    /api/v1/admin/dashboard/clients                  Client growth metrics
GET    /api/v1/admin/dashboard/popular-services         Most popular services
```

---

## 5. Auth Flow

### Email/Password Registration & Login

```
1. User POSTs to /api/v1/auth/register with {email, password, firstName, lastName, phone}
2. Server:
   a. Validates input (email format, password strength: 8+ chars, uppercase, number, special)
   b. Checks email uniqueness
   c. Hashes password with BCrypt (strength 12)
   d. Creates User entity with role=CLIENT, emailVerified=false
   e. Generates email verification token (UUID, stored in cache/db with TTL)
   f. Sends verification email via Spring Mail (with async)
   g. Returns 201 Created with UserResponse (no tokens yet)

3. User clicks email verification link -> GET /api/v1/auth/verify-email?token=...
4. Server sets emailVerified=true

5. User POSTs to /api/v1/auth/login with {email, password}
6. Server:
   a. Loads user by email
   b. Verifies password with BCrypt
   c. Checks emailVerified=true, enabled=true
   d. Generates JWT access token (15-minute expiry, contains userId, email, role)
   e. Generates opaque refresh token (UUID, stored in refresh_tokens table, 7-day expiry)
   f. Returns {accessToken, refreshToken, expiresIn, user}

7. Frontend stores accessToken in memory (NOT localStorage), refreshToken in httpOnly cookie
8. All API calls include Authorization: Bearer <accessToken>
9. When access token expires, frontend POSTs to /api/v1/auth/refresh with refresh token
10. Server validates refresh token, issues new access + refresh token (rotation)
```

### JWT Token Structure

```
Header: { "alg": "HS512", "typ": "JWT" }
Payload: {
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "CLIENT",
  "iat": 1710000000,
  "exp": 1710000900    // 15 minutes
}
```

### Google OAuth2 Flow

```
1. Frontend redirects user to /api/v1/auth/oauth2/google
   (or directly to Google's authorize URL with client_id, redirect_uri, scope)

2. Spring Security OAuth2 Login handles the redirect to Google

3. User authenticates with Google, consents to scopes (email, profile)

4. Google redirects back to /api/v1/auth/oauth2/callback/google with authorization code

5. Spring Security:
   a. Exchanges code for tokens with Google
   b. Fetches user info from Google (email, name, picture)
   c. CustomOAuth2UserService.loadUser():
      - Looks up user_oauth_accounts by provider='google' + providerAccountId
      - If found: loads existing User
      - If not found: checks if a User with that email exists
        - If yes: links OAuth account to existing user
        - If no: creates new User + OAuthAccount (no password needed)
      - Updates avatar_url from Google profile picture if not set

6. OAuth2AuthenticationSuccessHandler:
   a. Generates JWT access token + refresh token (same as email/password flow)
   b. Redirects to frontend with tokens as URL parameters:
      https://localhost:4200/auth/oauth-callback?token=...&refreshToken=...
      (or uses a short-lived authorization code that the frontend exchanges)

7. Frontend AuthOauthCallbackComponent:
   a. Extracts tokens from URL
   b. Stores them (access token in memory, refresh token in httpOnly cookie)
   c. Navigates to dashboard
```

### SecurityConfig.java Key Structure

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Stateless JWT, CORS handles it
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(customAccessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/payments/webhook").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/services/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/trainers/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/reviews").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/scheduling/class-series/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/contact").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService))
                .successHandler(oAuth2AuthenticationSuccessHandler))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## 6. Stripe Integration

### Payment Models

**Three payment scenarios:**

1. **Single session booking** -- One-time payment via Stripe Checkout
2. **Session packages** -- Pre-purchase (e.g., 5 private sessions at a discount), tracked in `client_packages`
3. **Group class enrollment** -- One-time payment for the class series
4. **Board & Train deposit/full payment** -- Deposit at booking, remainder at start

### Stripe Flow (Checkout Session Approach)

```
1. Client selects service and clicks "Book & Pay"
2. Frontend POST /api/v1/payments/checkout-session
   Body: { serviceTypeId, sessionId, dogId, referralCode? }

3. StripeService.createCheckoutSession():
   a. Resolve or create Stripe Customer for the user (store stripe_customer_id)
   b. Apply referral discount if code valid
   c. Create Stripe Checkout Session:
      - mode: 'payment' (one-time)
      - line_items: [{ price_data: { unit_amount, currency, product_data: { name, description } } }]
      - metadata: { bookingId, userId, dogId, serviceTypeId }
      - success_url: https://pawforward.com/booking/success?session_id={CHECKOUT_SESSION_ID}
      - cancel_url: https://pawforward.com/booking/cancel
   d. Create Payment record with status=PENDING, stripe_checkout_session_id
   e. Return { checkoutUrl, sessionId }

4. Frontend redirects user to Stripe Checkout (hosted page)
5. User completes payment on Stripe

6. Stripe sends webhook event to POST /api/v1/payments/webhook
7. StripeWebhookController:
   a. Verifies webhook signature using webhook secret
   b. Routes events:
      - checkout.session.completed -> PaymentService.handleCheckoutCompleted()
        - Updates Payment status to SUCCEEDED
        - Updates Booking status to CONFIRMED
        - Sends confirmation notification + email
      - payment_intent.payment_failed -> PaymentService.handlePaymentFailed()
        - Updates Payment status to FAILED
        - Notifies user
      - charge.refunded -> PaymentService.handleRefund()
        - Creates REFUND Payment record
        - Updates original payment status

8. Frontend polls or gets redirected to success page, which fetches booking confirmation
```

### StripeService.java Key Methods

```java
@Service
public class StripeService {

    public CheckoutSessionResponse createCheckoutSession(CreateCheckoutRequest request, User user);
    public CheckoutSessionResponse createPackageCheckoutSession(UUID packageId, User user);
    public void handleWebhookEvent(String payload, String sigHeader);
    public RefundResponse processRefund(UUID paymentId, BigDecimal amount);
    public String getOrCreateStripeCustomer(User user);
    public PortalSessionResponse createCustomerPortalSession(User user);
}
```

### Webhook Security

```java
@RestController
@RequestMapping("/api/v1/payments")
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            stripeService.handleWebhookEvent(event);
            return ResponseEntity.ok("received");
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }
    }
}
```

---

## 7. MCP Server Design

The MCP server is a separate Spring Boot application (module `pawforward-mcp`) that wraps the backend REST API, exposing tools and resources that AI agents (and the frontend chatbot) can use.

### Module Dependencies

```xml
<!-- pawforward-mcp/pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

The MCP server communicates with the main API via HTTP (using RestClient/WebClient internally), authenticated with a service-to-service API key or internal JWT.

### Package Structure

```
com.pawforward.mcp
|
+-- PawForwardMcpApplication.java
|
+-- config/
|   +-- McpServerConfig.java
|   +-- ApiClientConfig.java           # RestClient for calling pawforward-api
|
+-- tools/
|   +-- BookingTools.java
|   +-- SchedulingTools.java
|   +-- ServiceTools.java
|   +-- TrainerTools.java
|   +-- DogTools.java
|   +-- TrainingProgressTools.java
|   +-- PaymentTools.java
|   +-- ContactTools.java
|
+-- resources/
|   +-- BusinessInfoResource.java
|   +-- ServiceCatalogResource.java
|
+-- client/
    +-- PawForwardApiClient.java       # HTTP client wrapper for the REST API
```

### Tools Exposed

```java
@Component
public class ServiceTools {

    @McpTool(name = "list_services",
             description = "List all available training services including private sessions, group classes, and board & train programs")
    public List<ServiceTypeResponse> listServices(
        @McpToolParam(description = "Filter by category: PRIVATE, GROUP_CLASS, BOARD_AND_TRAIN", required = false)
        String category) { ... }

    @McpTool(name = "get_service_details",
             description = "Get detailed information about a specific training service including pricing and description")
    public ServiceTypeResponse getServiceDetails(
        @McpToolParam(description = "The service ID", required = true)
        String serviceId) { ... }

    @McpTool(name = "list_packages",
             description = "List available session packages with pricing and savings information")
    public List<PackageResponse> listPackages() { ... }
}

@Component
public class SchedulingTools {

    @McpTool(name = "list_upcoming_classes",
             description = "List upcoming group class series that are open for enrollment")
    public List<ClassSeriesResponse> listUpcomingClasses(
        @McpToolParam(description = "Filter by category like puppy, obedience, agility", required = false)
        String category) { ... }

    @McpTool(name = "get_available_slots",
             description = "Get available booking time slots for a specific trainer and service type within a date range")
    public List<AvailabilitySlotResponse> getAvailableSlots(
        @McpToolParam(description = "Trainer ID", required = true) String trainerId,
        @McpToolParam(description = "Service type ID", required = true) String serviceTypeId,
        @McpToolParam(description = "Start date (YYYY-MM-DD)", required = true) String startDate,
        @McpToolParam(description = "End date (YYYY-MM-DD)", required = true) String endDate) { ... }

    @McpTool(name = "check_class_availability",
             description = "Check if a specific class series has open spots or a waitlist")
    public ClassAvailabilityResponse checkClassAvailability(
        @McpToolParam(description = "Class series ID", required = true)
        String classSeriesId) { ... }
}

@Component
public class BookingTools {

    @McpTool(name = "create_booking",
             description = "Book a private training session for a specific dog, trainer, and time slot. Returns a payment checkout URL.")
    public BookingConfirmation createBooking(
        @McpToolParam(description = "Client user ID", required = true) String clientId,
        @McpToolParam(description = "Dog ID", required = true) String dogId,
        @McpToolParam(description = "Session ID to book", required = true) String sessionId) { ... }

    @McpTool(name = "enroll_in_class",
             description = "Enroll a dog in a group class series. Returns payment URL or waitlist position if full.")
    public EnrollmentResult enrollInClass(
        @McpToolParam(description = "Client user ID", required = true) String clientId,
        @McpToolParam(description = "Dog ID", required = true) String dogId,
        @McpToolParam(description = "Class series ID", required = true) String classSeriesId) { ... }

    @McpTool(name = "cancel_booking",
             description = "Cancel an existing booking. May trigger a refund depending on cancellation policy.")
    public CancellationResult cancelBooking(
        @McpToolParam(description = "Booking ID to cancel", required = true) String bookingId,
        @McpToolParam(description = "Reason for cancellation", required = false) String reason) { ... }

    @McpTool(name = "get_client_bookings",
             description = "Get all bookings for a specific client, optionally filtered by status")
    public List<BookingResponse> getClientBookings(
        @McpToolParam(description = "Client user ID", required = true) String clientId,
        @McpToolParam(description = "Filter: UPCOMING, PAST, CANCELLED", required = false) String filter) { ... }
}

@Component
public class TrainerTools {

    @McpTool(name = "list_trainers",
             description = "List all active trainers with their specializations and availability status")
    public List<TrainerProfileResponse> listTrainers() { ... }

    @McpTool(name = "get_trainer_profile",
             description = "Get detailed profile for a trainer including bio, certifications, specializations, and reviews")
    public TrainerDetailResponse getTrainerProfile(
        @McpToolParam(description = "Trainer ID", required = true) String trainerId) { ... }
}

@Component
public class DogTools {

    @McpTool(name = "get_dog_profile",
             description = "Get a dog's profile including breed, age, and training history summary")
    public DogDetailResponse getDogProfile(
        @McpToolParam(description = "Dog ID", required = true) String dogId) { ... }

    @McpTool(name = "get_training_progress",
             description = "Get training goals and progress for a specific dog")
    public TrainingProgressSummary getTrainingProgress(
        @McpToolParam(description = "Dog ID", required = true) String dogId) { ... }
}

@Component
public class TrainingProgressTools {

    @McpTool(name = "get_training_logs",
             description = "Get recent training session logs for a dog, showing what was worked on and trainer notes")
    public List<TrainingLogResponse> getTrainingLogs(
        @McpToolParam(description = "Dog ID", required = true) String dogId,
        @McpToolParam(description = "Maximum number of logs to return", required = false) Integer limit) { ... }

    @McpTool(name = "get_homework",
             description = "Get the current homework assignments for a dog from their most recent training sessions")
    public List<HomeworkResponse> getHomework(
        @McpToolParam(description = "Dog ID", required = true) String dogId) { ... }
}

@Component
public class ContactTools {

    @McpTool(name = "submit_inquiry",
             description = "Submit a contact inquiry from a potential client interested in training services")
    public ContactConfirmation submitInquiry(
        @McpToolParam(description = "Name of the person", required = true) String name,
        @McpToolParam(description = "Email address", required = true) String email,
        @McpToolParam(description = "Phone number", required = false) String phone,
        @McpToolParam(description = "Which service they are interested in", required = false) String serviceInterest,
        @McpToolParam(description = "Their dog's name", required = false) String dogName,
        @McpToolParam(description = "Their message or question", required = true) String message) { ... }
}
```

### Resources Exposed

```java
@Component
public class BusinessInfoResource {

    @McpResource(uri = "pawforward://business/info",
                 description = "General information about PawForward Academy - location, hours, contact info, about us")
    public BusinessInfo getBusinessInfo() { ... }

    @McpResource(uri = "pawforward://business/policies",
                 description = "Business policies including cancellation policy, vaccination requirements, and terms of service")
    public PoliciesInfo getPolicies() { ... }

    @McpResource(uri = "pawforward://business/faq",
                 description = "Frequently asked questions about PawForward Academy services")
    public List<FaqItem> getFaq() { ... }
}

@Component
public class ServiceCatalogResource {

    @McpResource(uri = "pawforward://services/catalog",
                 description = "Complete catalog of all training services, prices, and descriptions")
    public ServiceCatalog getServiceCatalog() { ... }
}
```

### MCP Server Configuration (`application.yml`)

```yaml
spring:
  ai:
    mcp:
      server:
        name: pawforward-mcp-server
        version: 1.0.0
        type: SYNC
        instructions: >
          You are a helpful assistant for PawForward Academy, a professional dog training business.
          You can help users browse services, check availability, book sessions, manage their dogs'
          training progress, and answer questions about the business. Always be friendly and
          knowledgeable about dog training.
        capabilities:
          tool: true
          resource: true
          prompt: false
          completion: false
        sse-message-endpoint: /mcp/messages

server:
  port: 8081

pawforward:
  api:
    base-url: http://localhost:8080/api/v1
    service-key: ${PAWFORWARD_SERVICE_KEY}
```

---

## 8. Frontend Pages and Components

### Angular Project Structure

```
src/app/
|
+-- app.component.ts                   # Root component
+-- app.config.ts                      # Global providers (router, http, animations)
+-- app.routes.ts                      # Top-level route definitions
|
+-- core/
|   +-- services/
|   |   +-- auth.service.ts            # Login, register, token management
|   |   +-- api.service.ts             # Base HTTP service
|   |   +-- stripe.service.ts          # Stripe checkout redirection
|   |   +-- notification.service.ts    # WebSocket + in-app notifications
|   |   +-- chatbot.service.ts         # Communicates with MCP server
|   |   +-- storage.service.ts         # Token storage
|   |   +-- toast.service.ts           # Toast notification UI
|   +-- guards/
|   |   +-- auth.guard.ts             # Requires authentication
|   |   +-- role.guard.ts             # Requires specific role
|   |   +-- no-auth.guard.ts          # Redirects if already logged in
|   +-- interceptors/
|   |   +-- auth.interceptor.ts       # Attaches Bearer token
|   |   +-- error.interceptor.ts      # Global error handling
|   |   +-- loading.interceptor.ts    # Request loading state
|   +-- models/
|   |   +-- user.model.ts
|   |   +-- dog.model.ts
|   |   +-- booking.model.ts
|   |   +-- service-type.model.ts
|   |   +-- trainer.model.ts
|   |   +-- payment.model.ts
|   |   +-- notification.model.ts
|   |   +-- training-log.model.ts
|   |   +-- review.model.ts
|   +-- store/                         # NgRx or Signal-based state (optional)
|       +-- auth.store.ts
|       +-- notification.store.ts
|
+-- shared/
|   +-- components/
|   |   +-- navbar/
|   |   |   +-- navbar.component.ts
|   |   +-- footer/
|   |   |   +-- footer.component.ts
|   |   +-- loading-spinner/
|   |   +-- confirmation-dialog/
|   |   +-- star-rating/
|   |   +-- pagination/
|   |   +-- empty-state/
|   |   +-- avatar/
|   |   +-- badge/
|   |   +-- card/
|   +-- pipes/
|   |   +-- time-ago.pipe.ts
|   |   +-- currency-format.pipe.ts
|   +-- directives/
|       +-- click-outside.directive.ts
|       +-- tooltip.directive.ts
|
+-- layouts/
|   +-- public-layout/                 # Header + footer for public pages
|   |   +-- public-layout.component.ts
|   +-- dashboard-layout/             # Sidebar + header for authenticated pages
|   |   +-- dashboard-layout.component.ts
|   +-- admin-layout/                 # Admin sidebar + header
|       +-- admin-layout.component.ts
|
+-- features/
    |
    +-- home/
    |   +-- home.component.ts                # Landing page
    |   +-- components/
    |       +-- hero-section.component.ts
    |       +-- services-overview.component.ts
    |       +-- featured-trainers.component.ts
    |       +-- testimonials-carousel.component.ts
    |       +-- call-to-action.component.ts
    |       +-- stats-section.component.ts
    |
    +-- auth/
    |   +-- auth.routes.ts
    |   +-- pages/
    |   |   +-- login/
    |   |   |   +-- login.component.ts
    |   |   +-- register/
    |   |   |   +-- register.component.ts
    |   |   +-- forgot-password/
    |   |   |   +-- forgot-password.component.ts
    |   |   +-- reset-password/
    |   |   |   +-- reset-password.component.ts
    |   |   +-- verify-email/
    |   |   |   +-- verify-email.component.ts
    |   |   +-- oauth-callback/
    |   |       +-- oauth-callback.component.ts
    |   +-- components/
    |       +-- google-login-button.component.ts
    |       +-- password-strength-meter.component.ts
    |
    +-- services/                      # Public services pages
    |   +-- services.routes.ts
    |   +-- pages/
    |   |   +-- services-list/
    |   |   |   +-- services-list.component.ts
    |   |   +-- service-detail/
    |   |   |   +-- service-detail.component.ts
    |   |   +-- packages/
    |   |       +-- packages.component.ts
    |   +-- components/
    |       +-- service-card.component.ts
    |       +-- package-card.component.ts
    |       +-- pricing-table.component.ts
    |
    +-- trainers/                      # Public trainer pages
    |   +-- trainers.routes.ts
    |   +-- pages/
    |   |   +-- trainer-list/
    |   |   |   +-- trainer-list.component.ts
    |   |   +-- trainer-profile/
    |   |       +-- trainer-profile.component.ts
    |   +-- components/
    |       +-- trainer-card.component.ts
    |       +-- trainer-availability-calendar.component.ts
    |       +-- trainer-reviews-section.component.ts
    |
    +-- classes/                        # Public class schedule
    |   +-- classes.routes.ts
    |   +-- pages/
    |   |   +-- class-schedule/
    |   |   |   +-- class-schedule.component.ts
    |   |   +-- class-detail/
    |   |       +-- class-detail.component.ts
    |   +-- components/
    |       +-- class-card.component.ts
    |       +-- class-calendar.component.ts
    |       +-- enrollment-form.component.ts
    |       +-- waitlist-badge.component.ts
    |
    +-- booking/
    |   +-- booking.routes.ts
    |   +-- pages/
    |   |   +-- book-session/
    |   |   |   +-- book-session.component.ts     # Multi-step booking wizard
    |   |   +-- booking-success/
    |   |   |   +-- booking-success.component.ts
    |   |   +-- booking-cancel/
    |   |       +-- booking-cancel.component.ts
    |   +-- components/
    |       +-- step-select-service.component.ts
    |       +-- step-select-dog.component.ts
    |       +-- step-select-trainer.component.ts
    |       +-- step-select-time.component.ts
    |       +-- step-review-confirm.component.ts
    |       +-- booking-summary-card.component.ts
    |       +-- time-slot-picker.component.ts
    |
    +-- dashboard/                     # Client dashboard
    |   +-- dashboard.routes.ts
    |   +-- pages/
    |   |   +-- dashboard-home/
    |   |   |   +-- dashboard-home.component.ts
    |   |   +-- my-bookings/
    |   |   |   +-- my-bookings.component.ts
    |   |   +-- my-dogs/
    |   |   |   +-- my-dogs.component.ts
    |   |   +-- dog-profile/
    |   |   |   +-- dog-profile.component.ts
    |   |   +-- dog-add-edit/
    |   |   |   +-- dog-add-edit.component.ts
    |   |   +-- training-progress/
    |   |   |   +-- training-progress.component.ts
    |   |   +-- payment-history/
    |   |   |   +-- payment-history.component.ts
    |   |   +-- my-packages/
    |   |   |   +-- my-packages.component.ts
    |   |   +-- profile-settings/
    |   |   |   +-- profile-settings.component.ts
    |   |   +-- notifications/
    |   |       +-- notifications.component.ts
    |   +-- components/
    |       +-- upcoming-appointments-card.component.ts
    |       +-- dog-quick-card.component.ts
    |       +-- training-progress-chart.component.ts
    |       +-- recent-activity-feed.component.ts
    |       +-- vaccination-tracker.component.ts
    |       +-- homework-list.component.ts
    |       +-- media-gallery.component.ts
    |
    +-- board-train/
    |   +-- board-train.routes.ts
    |   +-- pages/
    |   |   +-- board-train-request/
    |   |   |   +-- board-train-request.component.ts
    |   |   +-- board-train-detail/
    |   |       +-- board-train-detail.component.ts
    |   +-- components/
    |       +-- daily-update-card.component.ts
    |       +-- board-train-timeline.component.ts
    |
    +-- reviews/
    |   +-- reviews.routes.ts
    |   +-- pages/
    |   |   +-- reviews-page/
    |   |       +-- reviews-page.component.ts
    |   +-- components/
    |       +-- review-card.component.ts
    |       +-- review-form.component.ts
    |       +-- review-stats-summary.component.ts
    |
    +-- referrals/
    |   +-- pages/
    |       +-- referral-page/
    |           +-- referral-page.component.ts
    |
    +-- contact/
    |   +-- pages/
    |       +-- contact-page/
    |           +-- contact-page.component.ts
    |
    +-- about/
    |   +-- pages/
    |       +-- about-page/
    |           +-- about-page.component.ts
    |
    +-- chatbot/
    |   +-- chatbot.component.ts               # Floating chat widget
    |   +-- components/
    |       +-- chat-message.component.ts
    |       +-- chat-input.component.ts
    |       +-- chat-suggestions.component.ts
    |
    +-- trainer-portal/                        # Trainer-specific views
    |   +-- trainer-portal.routes.ts
    |   +-- pages/
    |   |   +-- trainer-dashboard/
    |   |   |   +-- trainer-dashboard.component.ts
    |   |   +-- trainer-schedule/
    |   |   |   +-- trainer-schedule.component.ts
    |   |   +-- trainer-clients/
    |   |   |   +-- trainer-clients.component.ts
    |   |   +-- training-log-create/
    |   |   |   +-- training-log-create.component.ts
    |   |   +-- trainer-availability-manage/
    |   |       +-- trainer-availability-manage.component.ts
    |   +-- components/
    |       +-- session-card.component.ts
    |       +-- client-dog-card.component.ts
    |       +-- log-entry-form.component.ts
    |       +-- media-upload.component.ts
    |
    +-- admin/
        +-- admin.routes.ts
        +-- pages/
        |   +-- admin-dashboard/
        |   |   +-- admin-dashboard.component.ts
        |   +-- manage-users/
        |   |   +-- manage-users.component.ts
        |   +-- manage-services/
        |   |   +-- manage-services.component.ts
        |   +-- manage-classes/
        |   |   +-- manage-classes.component.ts
        |   +-- manage-bookings/
        |   |   +-- manage-bookings.component.ts
        |   +-- manage-reviews/
        |   |   +-- manage-reviews.component.ts
        |   +-- manage-inquiries/
        |   |   +-- manage-inquiries.component.ts
        |   +-- revenue-reports/
        |   |   +-- revenue-reports.component.ts
        |   +-- manage-trainers/
        |       +-- manage-trainers.component.ts
        +-- components/
            +-- stats-card.component.ts
            +-- revenue-chart.component.ts
            +-- booking-chart.component.ts
            +-- client-growth-chart.component.ts
            +-- popular-services-chart.component.ts
            +-- data-table.component.ts
            +-- calendar-view.component.ts
```

### Chatbot Architecture

The chatbot widget communicates with the MCP server via Server-Sent Events (SSE):

```typescript
// chatbot.service.ts
@Injectable({ providedIn: 'root' })
export class ChatbotService {
    private mcpBaseUrl = environment.mcpServerUrl; // http://localhost:8081

    sendMessage(message: string, conversationHistory: ChatMessage[]): Observable<string> {
        // POST to a chatbot relay endpoint on the MCP server
        // The MCP server uses Spring AI's ChatClient + MCP tools to process the request
        // Returns streamed response
    }
}
```

The MCP server includes a `/chat` endpoint that acts as a relay:
- Receives user message
- Uses Spring AI's `ChatClient` with the MCP tools registered as function callbacks
- Calls an LLM (e.g., OpenAI, Anthropic) with the tools available
- Streams the response back to the frontend

---

## 9. Additional Impressive Features

### Feature 1: Real-Time Training Progress Dashboard

A visual dashboard showing each dog's training journey with:
- Skill radar charts (sit, stay, recall, leash walking, etc.) updated after each session
- Timeline view of all sessions with notes
- Goal completion progress bars
- Before/after media comparisons
- This uses Chart.js or ngx-charts for visualization

### Feature 2: Interactive Booking Wizard with Conflict Detection

A multi-step booking flow that:
- Shows real-time trainer availability from the calendar
- Detects scheduling conflicts
- Suggests alternative times if preferred slot is taken
- Calculates pricing dynamically (with package discounts, referral codes)
- Shows estimated travel time if multiple locations

### Feature 3: Board & Train Live Updates

For board-and-train clients:
- Daily photo/video updates from the trainer
- Live progress notes that the owner can view
- A timeline view of the entire stay
- Push notifications when updates are posted
- This is a standout feature for actual business use

### Feature 4: Smart Notification System

Multi-channel notifications:
- **In-app**: WebSocket-based real-time notifications with a bell icon + unread count
- **Email**: Transactional emails via SendGrid/AWS SES (booking confirmations, reminders, receipts)
- **SMS** (optional/impressive): Twilio integration for appointment reminders 24 hours before
- Notification preferences management in user settings

### Feature 5: Admin Analytics Dashboard

Charts and KPIs including:
- Revenue over time (daily/weekly/monthly), broken down by service type
- Client acquisition funnel (inquiries -> registrations -> first booking -> repeat bookings)
- Trainer utilization rates (hours booked / available hours)
- Popular time slots heatmap
- Class fill rates and waitlist conversion
- Client retention metrics
- Dog breed distribution (fun stat for the business)

### Feature 6: Training Curriculum Templates

Trainers can create reusable training plan templates:
- Define a sequence of skills/milestones
- Assign a template to a dog when they start training
- Track progress against the template
- Clone and customize templates per dog
- Export reports for clients

### Feature 7: Referral Program with Dashboard

- Each client gets a unique referral code
- Referred clients get a discount on first booking
- Referrer earns credit toward future sessions
- Referral dashboard shows code, times used, credits earned
- Shareable referral link with tracking

### Feature 8: Vaccination Compliance Tracker

- Upload vaccination records with expiration dates
- Automatic alerts when vaccinations are expiring
- Block booking if required vaccinations are expired
- Color-coded compliance status on dog profiles
- This is critical for a real business (liability protection)

### Feature 9: PWA / Mobile-Ready

- Service worker for offline support
- Push notifications via Web Push API
- Install prompt for "Add to Home Screen"
- Responsive design that works on phones and tablets
- This demonstrates advanced web concepts

### Feature 10: AI-Powered Chatbot

The chatbot on the frontend:
- Answers common questions (hours, pricing, services, policies)
- Helps users find the right service for their dog
- Can check availability and start booking process
- Provides training tips and homework reminders
- Uses the MCP server tools to access live business data

---

## 10. Detailed Frontend Design Prompt

Below is a comprehensive prompt to provide to another AI agent responsible for designing the UI/UX.

---

**BEGIN FRONTEND DESIGN PROMPT**

You are designing the complete UI/UX for **PawForward Academy**, a professional dog training business web application. The design should be **modern, warm, professional, and trustworthy** -- combining the polish of a premium SaaS product with the approachability of a pet business. The tech stack is Angular 19 with Tailwind CSS.

### Brand Identity

- **Name**: PawForward Academy
- **Tagline**: "Every paw, one step forward."
- **Color Palette**:
  - Primary: Deep teal (`#0D7377`) -- trust, professionalism
  - Secondary: Warm amber/golden (`#F59E0B`) -- energy, warmth, dogs
  - Accent: Coral (`#F87171`) -- calls-to-action, urgency
  - Neutrals: Slate grays (`#1E293B` through `#F8FAFC`) for text and backgrounds
  - Success: Emerald green (`#10B981`)
  - Background: Off-white (`#FAFBFC`) with white cards
- **Typography**:
  - Headings: "Plus Jakarta Sans" (bold, modern, geometric)
  - Body: "Inter" (clean, highly readable)
- **Visual Style**: Clean, spacious layouts with subtle shadows. Rounded corners on cards (12px) and buttons (8px). Paw-print motif used sparingly as decorative elements. Real dog photography for hero images and backgrounds (placeholder for now).

### Global Elements

**Navigation Bar (Public)**:
- Sticky top bar, white background with subtle bottom shadow
- Left: PawForward Academy logo (paw icon + text)
- Center/Right nav links: Home, Services, Trainers, Classes, About, Contact
- Right: "Log In" text button, "Get Started" primary filled button
- Mobile: Hamburger menu that opens a full-screen slide-in overlay from the right

**Navigation Bar (Authenticated -- Client)**:
- Same logo on left
- Center links: Dashboard, My Dogs, Bookings, Classes
- Right: Notification bell icon with red unread count badge, User avatar dropdown (Profile, Settings, Payment History, Referrals, Log Out)

**Navigation Bar (Authenticated -- Trainer)**:
- Left: Logo
- Center: My Schedule, My Clients, Training Logs
- Right: Notification bell, avatar dropdown

**Navigation Bar (Admin)**:
- Persistent left sidebar (collapsible on mobile):
  - Dashboard (with chart icon)
  - Users (with people icon)
  - Services (with list icon)
  - Classes (with calendar icon)
  - Bookings (with clipboard icon)
  - Reviews (with star icon)
  - Inquiries (with mail icon)
  - Revenue (with dollar icon)
  - Trainers (with badge icon)
- Top bar: PawForward Admin label, notification bell, admin avatar

**Footer**:
- 4-column layout on desktop (About, Services, Support, Connect)
- About column: Brief description, address, phone
- Services column: Links to each service type
- Support column: FAQ, Contact, Privacy Policy, Terms
- Connect column: Social media icons, newsletter email signup
- Bottom bar: copyright notice
- Mobile: stacked single column

**Chatbot Widget**:
- Floating circular button in bottom-right corner, teal background with paw-print icon
- Clicking opens a 400px wide x 550px tall chat panel
- Panel has: header bar (PawForward Assistant, minimize button, close button), scrollable message area, input bar with send button
- Messages styled as bubbles (user on right, teal; assistant on left, gray)
- Typing indicator (three animated dots) while waiting
- Quick-suggestion chips below the input for common questions ("View services", "Book a session", "Training tips")
- On mobile: chat panel takes full screen width

### Page-by-Page Design Specifications

#### 1. HOME PAGE (`/`)

**Hero Section**:
- Full-width section with gradient overlay on a high-quality dog training photo
- Large heading: "Professional Dog Training That Gets Results"
- Subheading: "From puppy basics to advanced agility -- PawForward Academy builds confident, well-behaved dogs through positive reinforcement training."
- Two CTAs: "Book a Session" (primary amber button) and "View Our Services" (outlined white button)
- Below hero: Three floating stat cards in a row with subtle animation on scroll-in:
  - "500+ Dogs Trained" with paw icon
  - "15+ Years Experience" with trophy icon
  - "4.9 Star Rating" with star icon

**Services Overview Section**:
- Section heading: "Our Training Programs"
- 3-column grid of service category cards:
  - **Private Training**: Icon (person + dog), brief description, starting price, "Learn More" link
  - **Group Classes**: Icon (group), brief description, starting price, "View Schedule" link
  - **Board & Train**: Icon (house), brief description, starting price, "Learn More" link
- Each card: white background, teal top border accent, hover shadow elevation

**Meet Our Trainers Section**:
- Section heading: "Meet Your Trainers"
- Horizontal scrollable cards (3 visible on desktop, 1 on mobile)
- Each trainer card: circular photo, name, title, specializations as small badges, star rating, "View Profile" link

**Testimonials Section**:
- Section heading: "What Our Clients Say"
- Carousel/slider of testimonial cards
- Each card: 5-star rating display, quote text (italicized), client name, dog name + breed, client photo (small circular)
- Auto-rotate with manual arrows and dot indicators

**CTA Section**:
- Teal background section
- "Ready to Start Your Dog's Training Journey?"
- "Book your free consultation today and see the PawForward difference."
- Single large "Schedule a Consultation" amber button

#### 2. SERVICES LIST PAGE (`/services`)

- Page heading: "Our Training Services"
- Brief intro paragraph about the training philosophy
- Tabbed or segmented control: All | Private Sessions | Group Classes | Board & Train
- Grid of service cards (2 columns on desktop, 1 on mobile):
  - Service image (placeholder or icon)
  - Service name
  - Category badge (teal for private, amber for group, coral for B&T)
  - Short description (2-3 lines, truncated)
  - Duration (e.g., "60 minutes")
  - Price (e.g., "$85/session" or "Starting at $450")
  - "View Details" button
- Sidebar on desktop (or bottom section on mobile): "Session Packages" section showing package deals

#### 3. SERVICE DETAIL PAGE (`/services/:id`)

- Breadcrumb: Home > Services > [Service Name]
- Hero area: Service name (large heading), category badge, hero image
- Two-column layout:
  - Left (wider): Full description, what to expect, prerequisites, what to bring
  - Right (sidebar): Pricing card with price, duration, deposit info, "Book Now" primary button; if group class: next available date; related packages section
- Below: "What You'll Learn" section with icon-list of skills
- Below: Related trainer profiles who teach this service
- Below: Reviews specific to this service

#### 4. TRAINERS LIST PAGE (`/trainers`)

- Page heading: "Our Training Team"
- Grid of trainer cards (3 per row desktop, 1 mobile):
  - Large photo (rectangular, rounded corners)
  - Name and credentials
  - Specialization badges (e.g., "Puppy Training", "Aggression", "Agility")
  - Star rating with review count
  - Years of experience
  - "View Profile" button

#### 5. TRAINER PROFILE PAGE (`/trainers/:id`)

- Large banner photo area with trainer photo
- Name, title, certifications listed
- Bio section (2-3 paragraphs)
- Specializations as large badges
- "Book with [Name]" CTA button
- Availability calendar widget (weekly view, shows open slots in green, booked in gray)
- Reviews section: Average rating, rating distribution bar chart, list of reviews with pagination
- Photo gallery section (optional): photos from training sessions

#### 6. CLASS SCHEDULE PAGE (`/classes`)

- Page heading: "Group Class Schedule"
- Filter bar: Category dropdown, Date range picker, Trainer dropdown
- View toggle: Calendar View | List View
- **Calendar View**: Monthly calendar with class dots on dates; clicking a date shows that day's classes in a side panel
- **List View**: Cards sorted by start date:
  - Class name
  - Trainer name + small photo
  - Schedule (e.g., "Saturdays, 10:00 AM - 11:00 AM, Apr 5 - May 24")
  - Location
  - Spots remaining (progress bar: "8/12 spots filled") or "WAITLIST" badge if full
  - Price
  - "Enroll Now" or "Join Waitlist" button

#### 7. CLASS DETAIL PAGE (`/classes/:id`)

- Class name, category, trainer
- Full description, what the class covers week by week
- Schedule details with all session dates listed
- Enrollment status bar (spots filled / max)
- Prerequisites section
- Price and "Enroll Now" button (opens payment flow) or "Join Waitlist" if full
- Trainer mini-profile card
- Reviews from past participants of this class type

#### 8. BOOKING WIZARD PAGE (`/book`)

Multi-step wizard with progress indicator at top (Step 1 of 5 style dots with labels).

**Step 1: Select Service**
- List of service types as selectable cards
- Selected card gets a teal border highlight
- "Next" button at bottom

**Step 2: Select Your Dog**
- List of user's dogs as selectable cards (photo, name, breed)
- "Add a New Dog" card with plus icon (opens a modal form)
- Vaccination compliance warning if any required vaccinations are expired
- "Next" / "Back" buttons

**Step 3: Select Trainer** (for private sessions)
- Grid of available trainers for the selected service
- Each shows photo, name, specializations, next available date
- "Any Available Trainer" option at top
- "Next" / "Back" buttons

**Step 4: Select Date & Time**
- Calendar date picker (available dates highlighted in teal)
- Selecting a date shows available time slots as clickable chips below
- Available slots in teal/white, unavailable grayed out
- "Next" / "Back" buttons

**Step 5: Review & Confirm**
- Summary card showing: Service, Dog, Trainer, Date/Time, Location, Price
- Referral code input field with "Apply" button
- Package usage option: "Use session from [Package Name] (3 remaining)" radio
- Price breakdown: Subtotal, Discount, Total
- Cancellation policy note
- "Proceed to Payment" primary button (redirects to Stripe Checkout)
- "Back" button

#### 9. BOOKING SUCCESS PAGE (`/booking/success`)

- Large checkmark icon (animated green circle)
- "Booking Confirmed!" heading
- Summary of booking details
- "Add to Calendar" button (generates .ics file)
- "View My Bookings" button
- "Book Another Session" link

#### 10. LOGIN PAGE (`/auth/login`)

- Centered card on a subtle pattern background
- PawForward Academy logo at top
- "Welcome Back" heading
- Email input field
- Password input field with show/hide toggle
- "Remember me" checkbox
- "Forgot your password?" link
- "Log In" primary button (full width)
- Divider: "or continue with"
- "Sign in with Google" button (Google branded, outlined)
- Bottom: "Don't have an account? Sign Up" link

#### 11. REGISTER PAGE (`/auth/register`)

- Same centered card layout
- "Create Your Account" heading
- First name + Last name (side by side)
- Email input
- Phone input (optional)
- Password input with real-time strength meter below (bar that fills green/yellow/red with text like "Strong")
- Confirm password input
- "I agree to the Terms and Privacy Policy" checkbox with links
- "Create Account" primary button
- Divider: "or continue with"
- "Sign up with Google" button
- Bottom: "Already have an account? Log In" link

#### 12. CLIENT DASHBOARD (`/dashboard`)

- Greeting: "Welcome back, [First Name]!" with date
- 4-column stat cards across the top:
  - Upcoming Appointments (count)
  - Dogs Registered (count)
  - Sessions Completed (count)
  - Packages Remaining (count)

**Upcoming Appointments Section** (left 2/3):
- List of next 3 upcoming appointments as cards:
  - Date/time, service name, trainer name + photo, dog name
  - Location
  - "View Details" and "Cancel" buttons
- "View All Bookings" link

**Quick Actions** (right 1/3):
- Vertical stack of action cards:
  - "Book a Session" with calendar icon
  - "Add a Dog" with plus icon
  - "View Training Progress" with chart icon
  - "Leave a Review" with star icon

**Recent Training Activity** (full width):
- Timeline-style feed of recent training logs
- Each entry: date, trainer, dog, summary snippet, skill tags
- "View Full Log" links

**Homework Section**:
- Card listing current homework assignments from trainers
- Each: assignment text, assigned date, trainer name

#### 13. MY DOGS PAGE (`/dashboard/dogs`)

- "My Dogs" heading with "Add Dog" button top right
- Grid of dog cards:
  - Dog photo (or placeholder paw icon)
  - Name, breed, age (computed from DOB)
  - Training status badge (e.g., "Currently in training", "3 active goals")
  - Vaccination status indicator (green checkmark = compliant, amber warning = expiring soon, red = expired)
  - "View Profile" button

#### 14. DOG PROFILE PAGE (`/dashboard/dogs/:id`)

- Dog photo (large), name, breed, age, weight
- Tab navigation: Overview | Training Progress | Vaccinations | Media

**Overview Tab**:
- Dog details card (gender, spayed/neutered, microchip ID, vet info, special needs)
- "Edit" button
- Active training goals section with progress bars
- Recent session summaries

**Training Progress Tab**:
- Training goals list with progress bars and status
- Skill radar chart (visual representation of proficiency in various skills)
- Session history timeline with trainer notes
- Homework assignments

**Vaccinations Tab**:
- Table of vaccinations: Name, Date, Expiration, Status (badge), Document (view/upload)
- "Add Vaccination" button opens a form modal
- Expired/expiring items highlighted

**Media Tab**:
- Photo/video grid gallery from training sessions
- Lightbox on click
- Filter by date range

#### 15. ADD/EDIT DOG PAGE (`/dashboard/dogs/new`, `/dashboard/dogs/:id/edit`)

- Form with sections:
  - Basic Info: Name, Breed (autocomplete dropdown), Date of Birth (date picker), Weight, Gender (radio), Spayed/Neutered (toggle)
  - Photo Upload: Drag-and-drop area or click to upload, image preview with crop
  - Health Info: Special Needs (textarea), Vet Name, Vet Phone, Microchip ID
  - Vaccinations: Inline table with "Add Row" to add vaccination records
- "Save" and "Cancel" buttons

#### 16. MY BOOKINGS PAGE (`/dashboard/bookings`)

- Tabs: Upcoming | Past | Cancelled
- Each tab shows a list of booking cards:
  - Service name, date/time, trainer, dog, status badge
  - For upcoming: "Cancel" button (with confirmation dialog)
  - For past: "Leave Review" button, "Rebook" button
  - For cancelled: Refund status

#### 17. TRAINING PROGRESS PAGE (`/dashboard/training`)

- Dog selector dropdown at top (if multiple dogs)
- Active Goals section: Cards with goal title, description, progress bar, target date, status
- Skills Overview: Radar chart of skill proficiency
- Session History: Paginated list of training log cards
- Each log card: Date, trainer, summary, skills worked (as tags), behavior notes, homework

#### 18. PAYMENT HISTORY PAGE (`/dashboard/payments`)

- Table/list of payments: Date, Description, Amount, Status badge (Succeeded/Failed/Refunded), Receipt link
- Filter by date range
- Summary card: Total spent this month, total spent all time

#### 19. MY PACKAGES PAGE (`/dashboard/packages`)

- Cards for each purchased package:
  - Package name
  - Sessions remaining / total (visual progress ring)
  - Expiration date
  - "Book Using Package" button
  - Status badge (Active/Expired/Depleted)
- "Buy More Packages" button linking to packages page

#### 20. PROFILE SETTINGS PAGE (`/dashboard/profile`)

- Tabs: Profile | Security | Notifications | Referrals

**Profile Tab**:
- Avatar upload (circular preview, change button)
- Edit form: First name, Last name, Email (read-only), Phone
- "Save Changes" button

**Security Tab**:
- Change Password: Current password, New password (with strength meter), Confirm new password
- Connected Accounts: Google (Connected/Not Connected, Connect/Disconnect button)
- Active Sessions list (optional, impressive)

**Notifications Tab**:
- Toggles for notification types:
  - Session reminders (email, SMS)
  - Training updates (email, in-app)
  - Payment receipts (email)
  - Promotional offers (email)
  - Waitlist notifications (email, SMS, in-app)

**Referrals Tab**:
- Personal referral code displayed prominently with "Copy" button
- Shareable link
- Stats: Times used, Credits earned
- Redemption history table

#### 21. NOTIFICATIONS PAGE/PANEL (`/dashboard/notifications`)

- Can also be a slide-in panel from the notification bell
- List of notifications with icons based on type
- Unread items have a subtle background highlight
- "Mark All Read" button at top
- Clicking a notification navigates to the relevant page (booking, training log, etc.)
- Types with distinct icons: booking confirmed (calendar), session reminder (clock), payment (dollar), training update (chart), waitlist update (list)

#### 22. BOARD & TRAIN REQUEST PAGE (`/board-train/request`)

- Form:
  - Dog selector
  - Preferred start date picker
  - Program length selector (1 week, 2 weeks, 3 weeks, 4 weeks)
  - Goals textarea ("What would you like us to focus on?")
  - Pickup/dropoff instructions
  - Emergency contact fields
  - Special instructions
- Price estimate section that updates based on selections
- "Submit Request" button (sends inquiry, admin reviews)

#### 23. BOARD & TRAIN DETAIL PAGE (`/board-train/:id`)

- Program header: Dog name, dates, trainer, status badge
- Progress timeline: Visual timeline from drop-off to pick-up
- Daily Updates section (reverse chronological):
  - Each day card: Date, summary, photos/videos (inline gallery), skills worked, mood/behavior notes
  - Clients see this as a "live journal" of their dog's stay
- Goals progress section: How the goals set at intake are progressing

#### 24. REVIEWS PAGE (`/reviews`)

- "Client Reviews" heading
- Overall stats: Average rating (large number with stars), total reviews, rating distribution chart
- Filter: All ratings, 5-star only, 4-star, etc.
- Sort: Newest, Highest, Lowest
- Review cards: Star rating, review title, review body, reviewer name, dog breed, date
- Featured reviews highlighted with a "Featured" badge

#### 25. CONTACT PAGE (`/contact`)

- Two-column layout:
  - Left: Contact form (Name, Email, Phone, Service of Interest dropdown, Dog's Name, Message textarea, "Send Message" button)
  - Right: Contact info (Address with embedded map, Phone, Email, Hours of Operation), Social media links
- Below: FAQ accordion section with common questions

#### 26. ABOUT PAGE (`/about`)

- Hero section with business story
- "Our Philosophy" section (positive reinforcement training approach)
- Team section with all trainer profiles
- Certifications and affiliations
- Photo gallery of the facility and training in action

#### 27. TRAINER PORTAL -- DASHBOARD (`/trainer/dashboard`)

- Greeting with today's date
- Today's Schedule: Timeline view of today's sessions
  - Each session card: Time, client name, dog name + breed, service type, location, notes preview
  - "Start Session" button on current/next session
- Quick Stats: Sessions this week, clients served, training logs due
- Recent Training Logs: List of recently submitted logs
- Upcoming board & train programs

#### 28. TRAINER PORTAL -- SCHEDULE (`/trainer/schedule`)

- Full calendar view (weekly default, monthly toggle)
- Color-coded sessions (private = teal, group = amber, board & train = coral)
- Click on empty slot to create a session
- Click on session to view details or mark complete
- Day view shows detailed timeline

#### 29. TRAINER PORTAL -- MY CLIENTS (`/trainer/clients`)

- List/grid of client-dog pairs assigned to this trainer
- Each card: Client name, dog photo + name + breed, active goals, last session date, vaccination status
- Click to view full training history and create logs

#### 30. TRAINER PORTAL -- CREATE TRAINING LOG (`/trainer/training-log/new`)

- Form:
  - Client/Dog selector (searchable dropdown)
  - Session selector (links to a scheduled session)
  - Date (defaults to today)
  - Summary textarea
  - Skills worked (multi-select tags from a predefined + custom list)
  - Behavior Notes textarea
  - Homework assigned textarea
  - Session rating (1-5, trainer's assessment of progress)
  - Media upload: Drag and drop area for photos/videos, with preview thumbnails
- "Save Log" button

#### 31. TRAINER PORTAL -- MANAGE AVAILABILITY (`/trainer/availability`)

- Weekly grid: 7 columns (days) x time rows
- Click and drag to set available time blocks
- Toggle recurring vs. specific date
- Block off time for vacations or personal time
- Visual: Available blocks in green, blocked in red/gray

#### 32. ADMIN DASHBOARD (`/admin/dashboard`)

- Full-width stats bar: Total Revenue (this month), Active Clients, Sessions This Month, Pending Inquiries
- Charts section (2x2 grid):
  - Revenue Over Time (line chart, date range selector)
  - Bookings by Service Type (pie/donut chart)
  - Client Growth (line chart, cumulative)
  - Popular Time Slots (heatmap, days of week x hours)
- Recent Activity feed: Latest bookings, payments, reviews, signups
- Action items: Pending review approvals, unanswered inquiries, upcoming sessions

#### 33. ADMIN -- MANAGE USERS (`/admin/users`)

- Data table: Name, Email, Role (editable dropdown), Status (Active/Disabled toggle), Dogs count, Bookings count, Joined date
- Search bar and role filter
- Click row to view user detail drawer/modal
- Bulk actions: Export CSV

#### 34. ADMIN -- MANAGE SERVICES (`/admin/services`)

- List of service types with inline editing capability
- "Add Service" button opens form modal: Name, Category, Description, Duration, Price, Deposit, Max Participants, Image, Sort Order, Active toggle
- Drag-to-reorder
- Toggle active/inactive

#### 35. ADMIN -- MANAGE CLASSES (`/admin/classes`)

- Calendar view of all class series
- "Create Class Series" button
- Form: Service type, Trainer, Title, Description, Start/End dates, Day of week, Time, Location, Max participants
- Existing classes show enrollment counts, waitlist counts
- Quick actions: Cancel class, send announcement to enrollees

#### 36. ADMIN -- MANAGE BOOKINGS (`/admin/bookings`)

- Data table with filters: Date range, Trainer, Status, Service type
- Columns: Date, Time, Client, Dog, Trainer, Service, Status, Payment status
- Click to view/edit booking
- Quick actions: Cancel, Reschedule, Mark complete, Mark no-show

#### 37. ADMIN -- MANAGE REVIEWS (`/admin/reviews`)

- Two tabs: Pending Approval | All Reviews
- Pending reviews shown as cards with Approve/Reject buttons
- All Reviews table with Featured toggle, Approve/Unapprove toggle

#### 38. ADMIN -- REVENUE REPORTS (`/admin/revenue`)

- Date range picker
- Summary cards: Total revenue, Average per session, Total sessions, Refunds
- Revenue by service type (bar chart)
- Revenue by trainer (bar chart)
- Monthly revenue trend (line chart)
- Detailed transaction table with export to CSV
- Package sales summary

### Responsive Design Requirements

- All pages must be fully responsive using Tailwind breakpoints (sm, md, lg, xl)
- Mobile (< 768px): Single column layouts, hamburger menu, bottom navigation bar for authenticated pages
- Tablet (768-1024px): Two-column layouts where appropriate, collapsible sidebar
- Desktop (> 1024px): Full layouts as described above

### Animation and Micro-interactions

- Page transitions: Subtle fade-in on route change
- Cards: Hover elevation (shadow increase)
- Buttons: Subtle scale on hover (1.02), press effect on active
- Loading states: Skeleton loaders matching the shape of content
- Toast notifications: Slide in from top-right, auto-dismiss after 5 seconds
- Modals: Fade-in with backdrop, slide-up on mobile
- Progress bars: Smooth animated fill
- Number counters: Animated count-up on dashboard stats
- Scroll animations: Subtle fade-up on sections as they enter viewport (on landing page only)

### Accessibility Requirements

- WCAG 2.1 AA compliance
- All interactive elements keyboard-navigable
- ARIA labels on icons and non-text elements
- Color contrast ratios meet AA standards
- Focus indicators visible
- Form validation messages associated with inputs via aria-describedby
- Skip navigation link

**END FRONTEND DESIGN PROMPT**

---

## 11. Implementation Phases

### Phase 1: Project Scaffolding and Core Infrastructure (Week 1)

1. Initialize the Git repository with `.gitignore` (Java, Node, IDE files)
2. Create `docker-compose.yml` with PostgreSQL 16 and pgAdmin
3. Generate Spring Boot 3.5 project (`pawforward-api`) with Maven:
   - Dependencies: Spring Web, Spring Security, Spring Data JPA, PostgreSQL Driver, Flyway, Lombok, Validation, OAuth2 Client, OAuth2 Resource Server
4. Set up multi-module Maven build (parent POM + `pawforward-api` + `pawforward-mcp`)
5. Configure `application.yml` with dev/prod profiles
6. Create `BaseEntity` abstract class with JPA auditing
7. Create the Angular 19 project with Tailwind CSS setup:
   - `ng new pawforward-frontend --standalone --routing --style=css`
   - Install and configure Tailwind CSS
   - Set up folder structure: `core/`, `shared/`, `features/`, `layouts/`
   - Configure `app.config.ts` with providers
8. Set up ESLint, Prettier for frontend; Checkstyle for backend

### Phase 2: Authentication System (Week 2)

1. Create Flyway migrations `V1__create_users_table.sql`, `V2__create_oauth_accounts.sql`, `V3__create_refresh_tokens.sql`
2. Implement `User` entity, `UserRepository`
3. Implement `SecurityConfig.java` with stateless JWT setup
4. Implement `JwtTokenProvider` (generate, validate, parse)
5. Implement `JwtAuthenticationFilter`
6. Implement `CustomUserDetailsService`
7. Implement `AuthController` with register, login, refresh, logout endpoints
8. Implement email verification flow (with Spring Mail or mock for dev)
9. Implement Google OAuth2 flow: `OAuth2UserService`, `OAuth2AuthenticationSuccessHandler`
10. Frontend: Create auth feature pages (login, register, forgot-password, reset-password, oauth-callback)
11. Frontend: Create `auth.service.ts`, `auth.interceptor.ts`, `auth.guard.ts`
12. Frontend: Token management (access token in memory, refresh token rotation)
13. Test the full auth flow end-to-end

### Phase 3: Core Domain Entities and CRUD (Week 3)

1. Flyway migrations for dogs, trainer_profiles, trainer_availability, service_types, sessions, bookings, class_series, class_enrollments
2. Implement entities: `Dog`, `DogVaccination`, `TrainerProfile`, `TrainerAvailability`, `ServiceType`, `Session`, `Booking`, `ClassSeries`, `ClassEnrollment`
3. Implement repositories with Spring Data JPA
4. Implement service layer for each feature
5. Implement DTOs and MapStruct mappers
6. Implement controllers for: dogs, trainers, services, scheduling, bookings
7. Implement `GlobalExceptionHandler`
8. Frontend: Model interfaces for all entities
9. Frontend: API service for each domain
10. Frontend: Public layout with navbar and footer
11. Frontend: Home page with hero, services overview, trainer preview, testimonials

### Phase 4: Booking and Scheduling System (Week 4)

1. Implement trainer availability logic (recurring + overrides)
2. Implement available-slots computation algorithm
3. Implement booking conflict detection
4. Implement class enrollment with capacity checking
5. Implement waitlist system
6. Frontend: Multi-step booking wizard (5 steps)
7. Frontend: Class schedule page with calendar and list views
8. Frontend: Class detail page with enrollment
9. Frontend: Time slot picker component
10. Test booking edge cases (double-booking prevention, concurrent enrollment)

### Phase 5: Stripe Payment Integration (Week 5)

1. Flyway migrations for payments, packages, client_packages
2. Implement `StripeService` with Checkout Session creation
3. Implement `StripeWebhookController` with signature verification
4. Implement payment lifecycle handling (success, failure, refund)
5. Implement session packages (purchase, track remaining, use for booking)
6. Set up Stripe CLI for local webhook testing
7. Frontend: Payment flow integration (redirect to Stripe Checkout, handle success/cancel callbacks)
8. Frontend: Payment history page, packages page
9. Test payment flows with Stripe test cards

### Phase 6: Board & Train and Training Progress (Week 6)

1. Flyway migrations for board_train_programs, training_goals, training_logs, training_media
2. Implement `BoardTrainService` with daily notes and updates
3. Implement `TrainingGoalService` with progress tracking
4. Implement `TrainingLogService` with media attachments
5. Set up media storage (AWS S3 or Cloudinary) for photo/video uploads
6. Frontend: Board & Train request form and detail page with daily updates timeline
7. Frontend: Dog profile page with training progress tab, skill radar chart
8. Frontend: Training log creation form for trainers
9. Frontend: Media gallery component

### Phase 7: Client Dashboard and Trainer Portal (Week 7)

1. Frontend: Client dashboard with upcoming appointments, stats, activity feed, homework
2. Frontend: My Dogs page, My Bookings page, Payment History
3. Frontend: Profile settings with all tabs
4. Frontend: Trainer portal dashboard, schedule, clients list
5. Frontend: Trainer availability management (drag-to-select grid)
6. Frontend: Training log creation interface for trainers
7. Backend: Dashboard aggregation endpoints for client and trainer views

### Phase 8: Notifications and Real-Time Features (Week 8)

1. Flyway migration for notifications
2. Implement `NotificationService` (in-app creation)
3. Implement WebSocket endpoint with Spring WebSocket/STOMP for real-time push
4. Implement email notification service (SendGrid or Spring Mail with templates)
5. Create notification templates (booking confirmation, session reminder, payment receipt, training update, waitlist update)
6. Frontend: Notification bell with unread count, dropdown panel
7. Frontend: Full notifications page
8. Frontend: WebSocket connection in `notification.service.ts`
9. Frontend: Toast notification component for real-time alerts

### Phase 9: Reviews, Referrals, and Contact (Week 8-9)

1. Flyway migrations for reviews, referral_codes, referral_redemptions, contact_inquiries
2. Implement review submission, approval workflow, featured reviews
3. Implement referral code generation, validation, redemption with Stripe discount
4. Implement contact inquiry system
5. Frontend: Reviews page (public), review submission form
6. Frontend: Referral dashboard in profile settings
7. Frontend: Contact page with form and FAQ accordion
8. Frontend: About page

### Phase 10: Admin Dashboard (Week 9-10)

1. Implement admin dashboard aggregation queries (revenue, bookings, clients, popular services)
2. Frontend: Admin layout with sidebar
3. Frontend: Admin dashboard with charts (using ngx-charts or Chart.js)
4. Frontend: Manage users, services, classes, bookings, reviews, inquiries pages
5. Frontend: Revenue reports with date range filtering and CSV export
6. Frontend: Data table component (sortable, filterable, paginated)

### Phase 11: MCP Server and Chatbot (Week 10-11)

1. Create `pawforward-mcp` module with `spring-ai-starter-mcp-server-webmvc`
2. Implement `PawForwardApiClient` (HTTP client for REST API)
3. Implement all MCP tool classes (BookingTools, SchedulingTools, ServiceTools, etc.)
4. Implement MCP resources (BusinessInfo, ServiceCatalog, FAQ, Policies)
5. Configure MCP server with SSE transport
6. Add a `/chat` relay endpoint that uses Spring AI `ChatClient` + MCP tools
7. Frontend: Chatbot widget component (floating button, expandable panel)
8. Frontend: Chat message rendering, typing indicator, suggestion chips
9. Frontend: `chatbot.service.ts` communicating with `/chat` endpoint
10. Test chatbot interactions: browsing services, checking availability, answering FAQs

### Phase 12: Polish, Testing, and Deployment Prep (Week 11-12)

1. Write comprehensive unit tests for all service classes (JUnit 5 + Mockito)
2. Write integration tests for controllers (MockMvc + Testcontainers for PostgreSQL)
3. Write E2E tests for critical flows (Cypress or Playwright)
4. Frontend unit tests with Vitest for key services and components
5. Add OpenAPI/Swagger documentation via Springdoc
6. Performance testing: Pagination on all list endpoints, query optimization with indexes
7. Security hardening: Rate limiting on auth endpoints, CORS configuration, input sanitization
8. Set up GitHub Actions CI pipeline (build, test, lint)
9. Write comprehensive README with setup instructions
10. Final responsive design QA across devices
11. Add PWA manifest and service worker configuration
12. Lighthouse audit and performance optimization

---

## Technology Version Summary

| Technology | Version | Rationale |
|---|---|---|
| Java | 21 (LTS) | Required by Spring Boot 3.5, modern language features |
| Spring Boot | 3.5.x | Latest stable with full ecosystem support |
| Spring Security | 6.4.x | Included with Spring Boot 3.5 |
| Spring AI | 1.0.x | MCP server starters |
| Angular | 19.x | Standalone-by-default, stable, strong ecosystem |
| Tailwind CSS | 3.4.x | Utility-first CSS, rapid UI development |
| PostgreSQL | 16 | Latest stable, JSONB support, arrays |
| Flyway | 10.x | Database migration management |
| Stripe Java SDK | 25.x+ | Payment processing |
| Lombok | Latest | Boilerplate reduction |
| MapStruct | 1.5.x | Compile-time DTO mapping |
| Chart.js / ngx-charts | Latest | Dashboard visualizations |
| Docker Compose | v2 | Local development environment |

---

### Critical Files for Implementation

- **`C:\Users\langn\Skillstorm\Training\projects\PetTraning\backend\pawforward-api\src\main\java\com\pawforward\api\config\SecurityConfig.java`** - The security configuration is the most critical file: it defines the entire auth flow (JWT + OAuth2), endpoint authorization rules, CORS policy, and filter chain. Everything else depends on it working correctly.

- **`C:\Users\langn\Skillstorm\Training\projects\PetTraning\backend\pawforward-api\src\main\java\com\pawforward\api\payment\StripeService.java`** - Central orchestrator for all Stripe interactions (checkout sessions, customer management, webhook processing, refunds, package purchases). This handles the money and must be implemented carefully.

- **`C:\Users\langn\Skillstorm\Training\projects\PetTraning\backend\pawforward-mcp\src\main\java\com\pawforward\mcp\tools\BookingTools.java`** - The most complex MCP tool class, as it needs to orchestrate availability checking, booking creation, and payment initiation through the API client. It is the primary demonstration of the MCP integration.

- **`C:\Users\langn\Skillstorm\Training\projects\PetTraning\frontend\src\app\features\booking\pages\book-session\book-session.component.ts`** - The multi-step booking wizard is the most complex frontend component. It manages multi-step state, communicates with several backend endpoints (services, dogs, trainers, availability, payments), and must handle edge cases gracefully.

- **`C:\Users\langn\Skillstorm\Training\projects\PetTraning\backend\pawforward-api\src\main\resources\db\migration\V1__initial_schema.sql`** - The initial Flyway migration that creates the entire database schema. Getting this right from the start avoids painful migration headaches later. All entity classes derive from this schema.