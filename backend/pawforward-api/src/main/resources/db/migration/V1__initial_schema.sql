-- =============================================
-- PawForward Academy - Initial Database Schema
-- =============================================

-- === USERS & AUTH ===

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    phone               VARCHAR(20),
    avatar_url          VARCHAR(500),
    role                VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    email_verified      BOOLEAN DEFAULT FALSE,
    enabled             BOOLEAN DEFAULT TRUE,
    stripe_customer_id  VARCHAR(255),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_oauth_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider            VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

CREATE TABLE refresh_tokens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token               VARCHAR(500) UNIQUE NOT NULL,
    expires_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === DOGS ===

CREATE TABLE dogs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    breed               VARCHAR(100),
    date_of_birth       DATE,
    weight_lbs          DECIMAL(5,1),
    gender              VARCHAR(10),
    spayed_neutered     BOOLEAN,
    microchip_id        VARCHAR(50),
    veterinarian_name   VARCHAR(200),
    veterinarian_phone  VARCHAR(20),
    special_needs       TEXT,
    profile_photo_url   VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dog_vaccinations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id              UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    vaccination_name    VARCHAR(100) NOT NULL,
    administered_date   DATE NOT NULL,
    expiration_date     DATE,
    document_url        VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === TRAINERS ===

CREATE TABLE trainer_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio                 TEXT,
    specializations     TEXT[],
    certifications      TEXT[],
    years_experience    INTEGER,
    hourly_rate         DECIMAL(8,2),
    profile_photo_url   VARCHAR(500),
    is_accepting_clients BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE trainer_availability (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id          UUID NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
    day_of_week         SMALLINT NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    is_recurring        BOOLEAN DEFAULT TRUE,
    specific_date       DATE,
    is_available        BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === SERVICES ===

CREATE TABLE service_types (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    category            VARCHAR(50) NOT NULL,
    description         TEXT,
    duration_minutes    INTEGER,
    max_participants    INTEGER,
    price               DECIMAL(8,2) NOT NULL,
    deposit_amount      DECIMAL(8,2),
    is_active           BOOLEAN DEFAULT TRUE,
    sort_order          INTEGER DEFAULT 0,
    image_url           VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- === SCHEDULING ===

CREATE TABLE class_series (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type_id     UUID NOT NULL REFERENCES service_types(id),
    trainer_id          UUID NOT NULL REFERENCES trainer_profiles(id),
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    day_of_week         SMALLINT NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    location            VARCHAR(200),
    max_participants    INTEGER NOT NULL,
    current_enrollment  INTEGER DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'OPEN',
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type_id     UUID REFERENCES service_types(id),
    class_series_id     UUID REFERENCES class_series(id),
    trainer_id          UUID NOT NULL REFERENCES trainer_profiles(id),
    session_date        DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    location            VARCHAR(200),
    status              VARCHAR(20) DEFAULT 'SCHEDULED',
    notes               TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL REFERENCES sessions(id),
    client_id           UUID NOT NULL REFERENCES users(id),
    dog_id              UUID NOT NULL REFERENCES dogs(id),
    status              VARCHAR(20) DEFAULT 'CONFIRMED',
    cancellation_reason TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE class_enrollments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_series_id     UUID NOT NULL REFERENCES class_series(id),
    client_id           UUID NOT NULL REFERENCES users(id),
    dog_id              UUID NOT NULL REFERENCES dogs(id),
    status              VARCHAR(20) DEFAULT 'ENROLLED',
    waitlist_position   INTEGER,
    enrolled_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === BOARD & TRAIN ===

CREATE TABLE board_train_programs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type_id         UUID NOT NULL REFERENCES service_types(id),
    client_id               UUID NOT NULL REFERENCES users(id),
    dog_id                  UUID NOT NULL REFERENCES dogs(id),
    trainer_id              UUID NOT NULL REFERENCES trainer_profiles(id),
    start_date              DATE NOT NULL,
    end_date                DATE NOT NULL,
    status                  VARCHAR(20) DEFAULT 'PENDING',
    daily_notes             JSONB DEFAULT '[]'::jsonb,
    pickup_instructions     TEXT,
    dropoff_instructions    TEXT,
    emergency_contact_name  VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- === TRAINING PROGRESS ===

CREATE TABLE training_goals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id              UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    trainer_id          UUID REFERENCES trainer_profiles(id),
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    target_date         DATE,
    status              VARCHAR(20) DEFAULT 'IN_PROGRESS',
    progress_percent    INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE training_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID REFERENCES sessions(id),
    dog_id              UUID NOT NULL REFERENCES dogs(id),
    trainer_id          UUID NOT NULL REFERENCES trainer_profiles(id),
    log_date            DATE NOT NULL DEFAULT CURRENT_DATE,
    summary             TEXT NOT NULL,
    skills_worked       TEXT[],
    behavior_notes      TEXT,
    homework            TEXT,
    rating              SMALLINT CHECK (rating BETWEEN 1 AND 5),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE training_media (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_log_id     UUID REFERENCES training_logs(id) ON DELETE CASCADE,
    dog_id              UUID REFERENCES dogs(id),
    media_type          VARCHAR(20) NOT NULL,
    url                 VARCHAR(500) NOT NULL,
    thumbnail_url       VARCHAR(500),
    caption             TEXT,
    uploaded_by         UUID REFERENCES users(id),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === PAYMENTS ===

CREATE TABLE payments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id                   UUID NOT NULL REFERENCES users(id),
    booking_id                  UUID REFERENCES bookings(id),
    class_enrollment_id         UUID REFERENCES class_enrollments(id),
    board_train_id              UUID REFERENCES board_train_programs(id),
    amount                      DECIMAL(10,2) NOT NULL,
    currency                    VARCHAR(3) DEFAULT 'usd',
    payment_type                VARCHAR(20) NOT NULL,
    status                      VARCHAR(20) NOT NULL,
    stripe_payment_intent_id    VARCHAR(255),
    stripe_checkout_session_id  VARCHAR(255),
    description                 TEXT,
    metadata                    JSONB,
    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE packages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    session_count       INTEGER NOT NULL,
    price               DECIMAL(8,2) NOT NULL,
    per_session_price   DECIMAL(8,2),
    valid_days          INTEGER,
    service_type_id     UUID REFERENCES service_types(id),
    is_active           BOOLEAN DEFAULT TRUE,
    stripe_price_id     VARCHAR(255),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE client_packages (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id               UUID NOT NULL REFERENCES users(id),
    package_id              UUID NOT NULL REFERENCES packages(id),
    sessions_remaining      INTEGER NOT NULL,
    purchased_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at              TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id  VARCHAR(255),
    status                  VARCHAR(20) DEFAULT 'ACTIVE',
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === REVIEWS ===

CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           UUID NOT NULL REFERENCES users(id),
    trainer_id          UUID REFERENCES trainer_profiles(id),
    service_type_id     UUID REFERENCES service_types(id),
    rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title               VARCHAR(200),
    body                TEXT,
    is_featured         BOOLEAN DEFAULT FALSE,
    is_approved         BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === NOTIFICATIONS ===

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(50) NOT NULL,
    title               VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    data                JSONB,
    is_read             BOOLEAN DEFAULT FALSE,
    channel             VARCHAR(20) DEFAULT 'IN_APP',
    sent_at             TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === REFERRALS ===

CREATE TABLE referral_codes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id         UUID NOT NULL REFERENCES users(id),
    code                VARCHAR(20) UNIQUE NOT NULL,
    discount_percent    INTEGER DEFAULT 10,
    max_uses            INTEGER,
    times_used          INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE referral_redemptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code_id    UUID NOT NULL REFERENCES referral_codes(id),
    referred_user_id    UUID NOT NULL REFERENCES users(id),
    payment_id          UUID REFERENCES payments(id),
    discount_applied    DECIMAL(8,2),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === WAITLIST ===

CREATE TABLE waitlist_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_series_id     UUID NOT NULL REFERENCES class_series(id),
    client_id           UUID NOT NULL REFERENCES users(id),
    dog_id              UUID NOT NULL REFERENCES dogs(id),
    position            INTEGER NOT NULL,
    notified            BOOLEAN DEFAULT FALSE,
    status              VARCHAR(20) DEFAULT 'WAITING',
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === CONTACT ===

CREATE TABLE contact_inquiries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),
    subject             VARCHAR(200),
    message             TEXT NOT NULL,
    dog_name            VARCHAR(100),
    service_interest    VARCHAR(50),
    status              VARCHAR(20) DEFAULT 'NEW',
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- === INDEXES ===

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
CREATE INDEX idx_class_enrollments_series ON class_enrollments(class_series_id);
CREATE INDEX idx_waitlist_series ON waitlist_entries(class_series_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = TRUE;
