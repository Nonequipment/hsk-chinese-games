# HSK Mission: Cloudflare Pages and Supabase migration

## Goal

Publish HSK Mission as an independent, fast mobile web app on Cloudflare without any dependency on ChatGPT authentication or the Site Creator runtime. Learners may browse and practise without signing in, then use email one-time passwords (OTP) to save and continue their progress across devices.

## Chosen architecture

The application becomes a static React single-page application built with Vite and deployed to Cloudflare Pages. Cloudflare serves versioned static assets only. The browser uses the Supabase JavaScript client with a public publishable key to handle email OTP authentication and read/write learner-owned data.

This replaces the current Vinext/Cloudflare Worker, Site Creator authentication routes, D1 binding, and Drizzle persistence layer. The checked-in vocabulary JSON remains static content and is loaded on demand by the library and learning routes.

### Why this architecture

- Static Pages avoids the Worker runtime and ChatGPT-specific headers that make the current deployment fail outside the original hosting platform.
- Supabase Auth supplies a standard, cross-device account session.
- Supabase Row Level Security (RLS) protects learner data without a custom API or a private key in the browser.
- The app has no server-side rendering requirement: curriculum content is public and learner progress is personal client data.

## Authentication

The sign-in flow uses an email address and a six-digit OTP.

1. A guest can use all public learning screens and games.
2. A guest who selects a save-required action sees a sign-in sheet and enters an email address.
3. The app calls Supabase Auth to send an OTP.
4. The learner enters the code; the client verifies it and receives a session.
5. The app resumes the original screen and syncs local, unsaved progress only after the learner explicitly confirms the merge when data exists.
6. Sign-out clears the local session and returns to guest mode; it does not delete cloud progress.

Supabase project settings must list the Cloudflare Pages production URL and preview URL pattern as allowed redirect URLs. Email OTP is enabled and the email template contains the OTP token.

## Data model

All tables live in Supabase `public` schema and have RLS enabled.

### `profiles`

One row per authenticated user. Fields: `id` (UUID, references `auth.users.id`), `display_name`, `started_at`, `target_date`, `created_at`, and `updated_at`.

### `study_progress`

One row per learner and vocabulary item. Fields: `user_id`, `word_id`, `set_id`, `studied_at`, `review_count`, and `last_mode`. A unique key on `(user_id, word_id)` makes updates idempotent.

### `set_progress`

One row per learner and set. Fields: `user_id`, `set_id`, `studied_count`, `is_study_complete`, `exam_unlocked_at`, `passed_at`, and `updated_at`. The client derives dashboard recommendations from the set totals and target date; it does not trust a client-provided completion state without recomputing it from `study_progress`.

### `exam_attempts`

An immutable record for each completed exam stage. Fields: `id`, `user_id`, `set_id`, `stage` (`meaning`, `typing`, or `tone`), `score`, `total`, `passed`, `answers`, and `completed_at`. A stage passes only when `score = total`.

## Access control

- Every table enables RLS.
- Select, insert, update, and delete policies apply only to `authenticated` users and require `user_id = auth.uid()` (or `id = auth.uid()` for `profiles`).
- Update policies include both `USING` and `WITH CHECK` ownership rules.
- The client uses only the Supabase URL and publishable key. It never includes a service-role key.
- Vocabulary remains static public data and does not need database access.

## Application routes and UI

The app is mobile-first and uses a persistent bottom navigation with Dashboard, Learn, Practise, Library, and Profile.

- **Dashboard:** today’s recommended sets, days remaining to 17 October, streak, overall progress, and a primary resume button.
- **Learn:** one flashcard at a time, showing Chinese, a pinyin visibility switch, Thai translation, sound, and stroke-order reference. Completing all cards unlocks the exam.
- **Practise:** existing meaning, pinyin, Chinese typing, and tone games. Each answer can update local state and syncs when signed in.
- **Exam:** three full-set stages: meaning with pinyin hidden, Chinese typing, and tone selection. A set is passed only after every stage receives 100%.
- **Library:** search and browse all 60 sets. The vocabulary JSON downloads only when this route needs it.
- **Profile:** current email, target date, sync status, and sign-out.

Guests see an unobtrusive save prompt instead of being redirected away from learning.

## Sync and failure behaviour

- The client keeps the latest unsynced actions in local storage.
- Signed-in users write progress optimistically and retry failed requests when the app returns online.
- A failed sync shows a visible retry state without losing the learner’s current answer.
- If Supabase configuration is absent, the app still runs in guest mode and clearly says that cross-device sync is unavailable.

## Deployment

1. Remove Site Creator auth plugin integration, D1/Drizzle code, and the worker-specific build path.
2. Add a standard Vite production build that outputs a static `dist/` directory.
3. Configure the existing GitHub repository in Cloudflare Pages: production branch `main`, build command `pnpm build`, output directory `dist`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Cloudflare Pages environment variables for production and preview deployments.
5. Create the Supabase schema and RLS policies via a reviewed migration.

## Verification

- Unit tests cover progress aggregation, exam 100% gates, the daily recommendation calculation, and guest-to-account handoff.
- Browser tests cover email OTP UI states with Supabase mocked.
- A production build must have no ChatGPT, Site Creator, D1, or service-role key references.
- Manual acceptance tests verify sign-in on one device, a progress update, and the same progress appearing after sign-in on a second device.
- Cloudflare Pages preview is checked on a 390 px wide viewport before production deployment.
