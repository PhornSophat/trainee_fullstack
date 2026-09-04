# Supabase Setup (Trainee Platform)

This folder contains the SQL scripts for the Trainee platform database.

## Run order

Run these in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query), in this order:

| # | File | What it does |
|---|------|--------------|
| 1 | `schema.sql` | Creates all tables, enums, and indexes (run **first**, on an empty DB) |
| 2 | `seed.sql` | Inserts sample data (users, courses, chapters, lessons, homework, chat...) |

> `seed.sql` references auto-assigned IDs (courses 1–6, chapters 1–3, lessons 1–7, tasks 1–3). Only run it once on an empty database. It is wrapped in `BEGIN;`/`COMMIT;`, so if any insert fails, nothing is saved.

## After the scripts

1. **Create storage buckets** (Dashboard → Storage → New bucket):
   - `homework` (public) — homework submission files
   - `images` (public) — course thumbnails
   - `videos` (public) — fallback video hosting (or use Mux instead, see below)

2. **Mux video** — videos are hosted on Mux, not Supabase. After uploading a video through Mux, save its IDs into `lessons.mux_asset_id` and `lessons.mux_playback_id` (your NestJS webhook will do this).

3. **Fix the placeholder URLs** in `seed.sql`:
   - `https://picsum.photos/...` in `courses.image_url` → replace with your real images
   - `https://xxxx.supabase.co/...` in `submission_attachments.file_url` → replace with your real Supabase project URL

## Key design decisions

- **No auth** — users only have a name (`users.name`).
- **Videos on Mux** — the DB stores `mux_playback_id`, not the video file.
- **Multiple files per submission** — stored in `submission_attachments` (one row per file), not on `submissions`.
- **Chat thread = one submission** — `chat_messages.submission_id` points to a submission, whose `user_id` is the student and `instructor_id` is the instructor.
- **Progress is per student** — `lesson_progress` has a composite primary key `(user_id, lesson_id)`.