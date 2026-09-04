-- ============================================================
-- TRAINEE PLATFORM — SUPABASE SCHEMA
-- Run in the Supabase SQL Editor, in order.
-- No auth: users only have a name.
-- Videos hosted on Mux (lessons store mux_playback_id).
-- Files stored in Supabase Storage (attachment tables store URLs).
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE course_level AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE approval_status AS ENUM ('NOT_REQUESTED', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE lesson_type AS ENUM ('VIDEO', 'DOC');
CREATE TYPE homework_type AS ENUM ('TASK', 'QUIZ');
CREATE TYPE homework_status AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'GRADED', 'LATE');
CREATE TYPE enrollment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE reaction_type AS ENUM ('LIKE', 'DISLIKE');
CREATE TYPE chat_sender AS ENUM ('STUDENT', 'INSTRUCTOR');

-- ============================================================
-- 2. USERS (just a name, no auth)
-- ============================================================
CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- ============================================================
-- 4. COURSES
-- ============================================================
CREATE TABLE courses (
    id              BIGSERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    khmer_title     TEXT,
    description     TEXT,
    image_url       TEXT,
    level           course_level NOT NULL DEFAULT 'BASIC',
    duration        TEXT,
    approval_status approval_status NOT NULL DEFAULT 'NOT_REQUESTED',
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE course_categories (
    course_id   BIGINT NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, category_id)
);

CREATE TABLE course_instructors (
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id   UUID   NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    PRIMARY KEY (course_id, user_id)
);

CREATE TABLE course_skills (
    id        BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    text      TEXT NOT NULL,
    position  INT NOT NULL DEFAULT 0
);

CREATE TABLE key_lessons (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    code        TEXT,
    title       TEXT NOT NULL,
    description TEXT,
    position    INT NOT NULL DEFAULT 0
);

CREATE TABLE course_technologies (
    id        BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name      TEXT NOT NULL,
    icon      TEXT
);

CREATE TABLE course_faqs (
    id        BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    question  TEXT NOT NULL,
    answer    TEXT,
    position  INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 5. CURRICULUM (chapters + lessons)
-- ============================================================
CREATE TABLE chapters (
    id        BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title     TEXT NOT NULL,
    position  INT NOT NULL DEFAULT 0
);

CREATE TABLE lessons (
    id               BIGSERIAL PRIMARY KEY,
    chapter_id       BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT,
    type             lesson_type NOT NULL DEFAULT 'VIDEO',
    duration         TEXT,
    video_url        TEXT,
    mux_asset_id     TEXT,
    mux_playback_id  TEXT,
    position         INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 6. PER-USER PROGRESS
-- ============================================================
CREATE TABLE lesson_progress (
    user_id            UUID   NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    lesson_id          BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    completed_at       TIMESTAMPTZ,
    last_watched_at    TIMESTAMPTZ,
    PRIMARY KEY (user_id, lesson_id)
);

-- ============================================================
-- 7. HOMEWORK (homeworks -> tasks -> submissions -> attachments)
-- ============================================================
CREATE TABLE homeworks (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT
);

CREATE TABLE homework_tasks (
    id          BIGSERIAL PRIMARY KEY,
    homework_id BIGINT NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    type        homework_type NOT NULL DEFAULT 'TASK',
    max_score   INT NOT NULL DEFAULT 100,
    due_date    TIMESTAMPTZ
);

CREATE TABLE submissions (
    id            BIGSERIAL PRIMARY KEY,
    task_id       BIGINT NOT NULL REFERENCES homework_tasks(id) ON DELETE CASCADE,
    user_id       UUID   NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    instructor_id UUID   REFERENCES users(id),
    status        homework_status NOT NULL DEFAULT 'NOT_SUBMITTED',
    score         INT CHECK (score >= 0),
    submitted_at  TIMESTAMPTZ,
    UNIQUE (task_id, user_id)
);

CREATE TABLE submission_attachments (
    id            BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_name     TEXT NOT NULL,
    file_url      TEXT NOT NULL,
    file_size     BIGINT,
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. ENROLLMENT / ENGAGEMENT
-- ============================================================
CREATE TABLE enrollments (
    id                  BIGSERIAL PRIMARY KEY,
    course_id           BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id             UUID   NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    status              enrollment_status NOT NULL DEFAULT 'PENDING',
    progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (course_id, user_id)
);

CREATE TABLE favorites (
    user_id    UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE reviews (
    id         BIGSERIAL PRIMARY KEY,
    course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id    UUID   NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (course_id, user_id)
);

CREATE TABLE course_reactions (
    id        BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id   UUID   NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    type      reaction_type NOT NULL,
    UNIQUE (course_id, user_id)
);

-- ============================================================
-- 9. CHAT (one thread per submission: student <-> instructor)
-- ============================================================
CREATE TABLE chat_messages (
    id            BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    sender_name   TEXT NOT NULL,
    sender        chat_sender NOT NULL,
    text          TEXT NOT NULL,
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. INDEXES
-- ============================================================
CREATE INDEX idx_lessons_chapter        ON lessons(chapter_id);
CREATE INDEX idx_chapters_course        ON chapters(course_id);
CREATE INDEX idx_homeworks_course       ON homeworks(course_id);
CREATE INDEX idx_homework_tasks_hw      ON homework_tasks(homework_id);
CREATE INDEX idx_submissions_task       ON submissions(task_id);
CREATE INDEX idx_enrollments_user       ON enrollments(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_chat_messages_sub      ON chat_messages(submission_id);
CREATE INDEX idx_attachments_submission ON submission_attachments(submission_id);
