# HSK Mission Cloudflare Pages and Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ChatGPT-dependent Worker application with a mobile-first static Cloudflare Pages app that stores authenticated learner progress in Supabase.

**Architecture:** Vite builds a React SPA into `dist/`, which Cloudflare Pages serves with a single-page fallback. Public curriculum remains checked-in JSON; a browser-only Supabase client authenticates using email OTP and persists learner-owned progress through RLS-protected tables. Local storage queues progress while offline and syncs after authentication returns.

**Tech Stack:** React 19, TypeScript, Vite, React Router, Tailwind CSS 4, Supabase JavaScript client, Vitest, Testing Library, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-21-cloudflare-supabase-migration-design.md`

## Global Constraints

- Build a static `dist/` directory; production must not require a Worker, D1, Drizzle, or Site Creator runtime.
- Use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in browser code; never include a Supabase service-role key.
- Support guest learning and games. Require sign-in only for cloud persistence and cross-device progress.
- Use email OTP with six digits and configure Cloudflare production and preview URLs in Supabase Auth redirect settings.
- Enable RLS on every exposed Supabase table; all user records must enforce ownership with `auth.uid()`.
- Preserve existing 1,200-word curriculum, 60 sets, games, 100% exam gates, pinyin visibility switch, audio controls, and stroke-order learning reference.
- Verify at a 390 px viewport before production deployment.

## Review Focus

- A guest completes cards offline, signs in, then merges local cards without overwriting cloud records.
- An authenticated user cannot select, insert, update, or delete another user’s progress through Supabase.
- A 19/20 exam stage does not unlock a completed set, while 20/20 in all three stages does.
- Supabase configuration is missing or unreachable: learning continues in guest mode and shows a retryable sync state.
- Visiting `/learn/set-01` or refreshing on any nested route returns the SPA rather than a Cloudflare 404.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | SPA bootstrap, providers, browser router |
| `src/App.tsx` | Route tree and static route fallback |
| `src/lib/supabase/client.ts` | Validated singleton Supabase browser client |
| `src/lib/auth/auth-provider.tsx` | OTP sign-in state, session changes, sign-out |
| `src/lib/progress/progress-store.ts` | Guest cache, queued mutations, cloud reads/writes |
| `src/lib/progress/progress-types.ts` | Supabase-facing progress types and conversion helpers |
| `src/features/auth/sign-in-sheet.tsx` | Email and six-digit OTP interface |
| `src/features/dashboard/dashboard-page.tsx` | Dashboard, daily target and resume action |
| `src/features/learn/learn-page.tsx` | Flashcards, stroke-order, pinyin/audio controls, save state |
| `src/features/practice/practice-page.tsx` | Existing game modes and score persistence |
| `src/features/exam/exam-page.tsx` | Three-stage 100% exam flow and attempt persistence |
| `src/features/library/library-page.tsx` | On-demand vocabulary search and set grid |
| `src/components/app-shell.tsx` | Mobile-first shell and bottom navigation |
| `src/styles.css` | Modern Chinese Learning colour system and responsive layout |
| `supabase/migrations/202609210001_hsk_progress.sql` | Tables, indexes, trigger and RLS policies |
| `public/_redirects` | Cloudflare Pages SPA fallback |
| `.env.example` | Names of required public Supabase variables only |
| `vite.config.ts` | Vite static build configuration |
| `package.json` | Static build, test and Pages scripts/dependencies |
| `README.md` | Local run, Supabase setup, Cloudflare Pages deployment |

### Task 1: Replace the runtime with a static SPA shell

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `public/_redirects`
- Modify: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Delete: `app/`, `build/`, `db/`, `drizzle/`, `drizzle.config.ts`, `next.config.ts`, `cloudflare-env.d.ts`
- Test: `tests/smoke/app-routes.test.tsx`

**Interfaces:**
- Produces: `App`, mounted by `main.tsx`; route params supplied by `react-router-dom`.
- Consumes: `data/curriculum.json` via existing curriculum parser moved under `src/lib/curriculum/`.

- [ ] **Step 1: Write the failing route test**

```tsx
it('renders a learning route after a direct navigation', async () => {
  render(<MemoryRouter initialEntries={['/learn/set-01']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: /เรียน set 1/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/smoke/app-routes.test.tsx`

Expected: FAIL because `src/App.tsx` does not exist.

- [ ] **Step 3: Install the static SPA dependencies and create routes**

```tsx
export function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/learn/:setId" element={<LearnPage />} />
      <Route path="/practice/:setId" element={<PracticePage />} />
      <Route path="/exam/:setId" element={<ExamPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
```

Set `public/_redirects` to `/* /index.html 200` and set Vite `build.outDir` to `dist`.

- [ ] **Step 4: Run the route test and production build**

Run: `pnpm vitest run tests/smoke/app-routes.test.tsx && pnpm build`

Expected: PASS and `dist/index.html` exists.

- [ ] **Step 5: Commit the static shell**

```bash
git add package.json pnpm-lock.yaml vite.config.ts tsconfig.json index.html public/_redirects src tests/smoke/app-routes.test.tsx
git rm -r app build db drizzle drizzle.config.ts next.config.ts cloudflare-env.d.ts
git commit -m "refactor: replace Worker runtime with static SPA shell"
```

### Task 2: Create the Supabase schema and enforce RLS

**Files:**
- Create: `supabase/migrations/202609210001_hsk_progress.sql`
- Create: `tests/supabase/schema-contract.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: tables `profiles`, `study_progress`, `set_progress`, `exam_attempts`.
- Consumes: `auth.uid()` supplied by Supabase Auth.

- [ ] **Step 1: Write the failing schema contract test**

```ts
it('defines RLS and owner predicates for every learner table', () => {
  const sql = readFileSync('supabase/migrations/202609210001_hsk_progress.sql', 'utf8');
  for (const table of ['profiles', 'study_progress', 'set_progress', 'exam_attempts']) {
    expect(sql).toContain(`alter table public.${table} enable row level security`);
  }
  expect(sql).toContain('(select auth.uid()) = user_id');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/supabase/schema-contract.test.ts`

Expected: FAIL because the migration is absent.

- [ ] **Step 3: Add migration SQL**

```sql
create table public.study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  set_id text not null,
  studied_at timestamptz not null default now(),
  review_count integer not null default 1 check (review_count > 0),
  last_mode text not null,
  primary key (user_id, word_id)
);
alter table public.study_progress enable row level security;
create policy "study progress owner write" on public.study_progress
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

Apply the same ownership pattern to every table, use `id = (select auth.uid())` for `profiles`, and add indexes for `(user_id, set_id)` and `(user_id, completed_at desc)`.

- [ ] **Step 4: Run the schema contract test**

Run: `pnpm vitest run tests/supabase/schema-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Apply and verify in the selected Supabase project**

Run: apply `supabase/migrations/202609210001_hsk_progress.sql` in Supabase SQL Editor, then query `pg_policies` and verify four tables have RLS enabled.

Expected: each table has owner-only policies and an unauthenticated request receives no learner rows.

- [ ] **Step 6: Commit the schema**

```bash
git add supabase/migrations/202609210001_hsk_progress.sql tests/supabase/schema-contract.test.ts .env.example
git commit -m "feat: add Supabase learner progress schema"
```

### Task 3: Implement the Supabase auth provider and OTP sheet

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/auth/auth-provider.tsx`, `src/features/auth/sign-in-sheet.tsx`
- Create: `tests/auth/auth-provider.test.tsx`
- Modify: `src/main.tsx`, `src/components/app-shell.tsx`

**Interfaces:**
- Produces: `useAuth(): { user: User | null; status: 'guest' | 'loading' | 'signed-in'; sendOtp(email: string): Promise<void>; verifyOtp(email: string, token: string): Promise<void>; signOut(): Promise<void> }`.
- Consumes: `createClient` from `@supabase/supabase-js` and the two `VITE_SUPABASE_*` variables.

- [ ] **Step 1: Write failing OTP tests**

```tsx
it('sends an OTP then verifies six digits', async () => {
  const auth = { signInWithOtp: vi.fn().mockResolvedValue({ error: null }), verifyOtp: vi.fn().mockResolvedValue({ error: null }) };
  render(<AuthProvider client={mockClient(auth)}><SignInSheet open /></AuthProvider>);
  await userEvent.type(screen.getByLabelText(/อีเมล/i), 'learner@example.com');
  await userEvent.click(screen.getByRole('button', { name: /ส่งรหัส/i }));
  await userEvent.type(await screen.findByLabelText(/รหัส 6 หลัก/i), '123456');
  expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'learner@example.com', token: '123456', type: 'email' });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/auth/auth-provider.test.tsx`

Expected: FAIL because the provider and sheet do not exist.

- [ ] **Step 3: Implement configuration-safe client and auth provider**

```ts
export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createClient(url, key) : null;
}
```

`sendOtp` calls `client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`; `verifyOtp` validates `/^\\d{6}$/` before calling `client.auth.verifyOtp`. When client configuration is missing, expose `guest` state with message `การซิงก์ข้ามอุปกรณ์ยังไม่พร้อมใช้งาน`.

- [ ] **Step 4: Run the auth tests**

Run: `pnpm vitest run tests/auth/auth-provider.test.tsx`

Expected: PASS, including invalid OTP and absent configuration cases.

- [ ] **Step 5: Commit the auth flow**

```bash
git add src/lib/supabase src/lib/auth src/features/auth src/main.tsx src/components/app-shell.tsx tests/auth/auth-provider.test.tsx
git commit -m "feat: add Supabase email OTP authentication"
```

### Task 4: Move learning, game, and exam persistence to a guest-first progress store

**Files:**
- Create: `src/lib/progress/progress-types.ts`, `src/lib/progress/progress-store.ts`, `src/lib/progress/local-queue.ts`
- Create: `tests/progress/progress-store.test.ts`, `tests/progress/exam-gate.test.ts`
- Modify: `src/lib/planning/adaptive-plan.ts`

**Interfaces:**
- Produces: `ProgressStore.markStudied(input)`, `getSetProgress(setId)`, `recordExam(input)`, `sync()`, and `getDashboardSummary(targetDate)`.
- Consumes: `AuthContext.user`, curriculum set size, `localStorage`, and Supabase tables from Task 2.

- [ ] **Step 1: Write failing progress and exam tests**

```ts
it('keeps guest cards queued and merges them after sign-in', async () => {
  const store = createProgressStore({ client: null, storage: memoryStorage() });
  await store.markStudied({ wordId: '1', setId: 'set-01', mode: 'flashcard' });
  expect(store.pendingCount()).toBe(1);
  await store.attachClient(mockSupabase());
  await store.sync();
  expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ word_id: '1' }));
});

it('marks a set passed only after all three perfect stages', async () => {
  const store = createProgressStore({ client: mockSupabase(), storage: memoryStorage() });
  await store.recordExam({ setId: 'set-01', stage: 'meaning', score: 20, total: 20 });
  await store.recordExam({ setId: 'set-01', stage: 'typing', score: 20, total: 20 });
  await store.recordExam({ setId: 'set-01', stage: 'tone', score: 19, total: 20 });
  expect(await store.getSetProgress('set-01')).toMatchObject({ completed: false });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/progress/progress-store.test.ts tests/progress/exam-gate.test.ts`

Expected: FAIL because `createProgressStore` is absent.

- [ ] **Step 3: Implement local-first mutation queue and Supabase upserts**

```ts
export type StudyMutation = { wordId: string; setId: string; mode: string; occurredAt: string };

export async function markStudied(input: Omit<StudyMutation, 'occurredAt'>) {
  const mutation = { ...input, occurredAt: new Date().toISOString() };
  queue.push(mutation);
  await persistQueue(queue);
  if (client && userId) await sync();
}
```

On cloud sync, upsert `study_progress` using `{ onConflict: 'user_id,word_id' }`, calculate studied count from distinct persisted word IDs, and write `exam_attempts` only after every answer is available. Persist `set_progress` as a cache, but derive `is_study_complete` and completed status from source records before displaying it.

- [ ] **Step 4: Run progress tests**

Run: `pnpm vitest run tests/progress/progress-store.test.ts tests/progress/exam-gate.test.ts tests/planning/adaptive-plan.test.ts`

Expected: PASS; 19/20 never passes and guest actions survive refresh.

- [ ] **Step 5: Commit the progress store**

```bash
git add src/lib/progress src/lib/planning/adaptive-plan.ts tests/progress tests/planning/adaptive-plan.test.ts
git commit -m "feat: sync learner progress with Supabase"
```

### Task 5: Rebuild the mobile learning experience on the new store

**Files:**
- Create: `src/components/app-shell.tsx`, `src/features/dashboard/dashboard-page.tsx`, `src/features/learn/learn-page.tsx`, `src/features/practice/practice-page.tsx`, `src/features/exam/exam-page.tsx`, `src/features/library/library-page.tsx`, `src/features/profile/profile-page.tsx`
- Modify: `src/styles.css`, `src/lib/curriculum/load.ts`, `src/lib/audio/effects.ts`, `src/lib/audio/speech.ts`
- Test: `tests/learning/learn-page.test.tsx`, `tests/exams/exam-page.test.tsx`, `tests/library/library-page.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `ProgressStore`, `getSet(setId)`, `createExam`, `gradeStage`.
- Produces: complete guest and signed-in user flows for all application routes.

- [ ] **Step 1: Write failing UI flow tests**

```tsx
it('shows pinyin only when its switch is on', async () => {
  render(<LearnPage setId="set-01" />);
  expect(await screen.findByText('nǐ')).toBeVisible();
  await userEvent.click(screen.getByRole('switch', { name: /พินอิน/i }));
  expect(screen.queryByText('nǐ')).not.toBeInTheDocument();
});

it('keeps the exam locked until every card is studied', async () => {
  render(<ExamPage setId="set-01" progress={progressWith(19)} />);
  expect(screen.getByText(/เรียนบัตรคำให้ครบ/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the UI tests to verify they fail**

Run: `pnpm vitest run tests/learning/learn-page.test.tsx tests/exams/exam-page.test.tsx tests/library/library-page.test.tsx`

Expected: FAIL because the feature modules are absent.

- [ ] **Step 3: Implement the mobile pages**

```tsx
<nav aria-label="เมนูหลัก" className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t bg-white/95 pb-[env(safe-area-inset-bottom)]">
  <NavLink to="/">ภารกิจ</NavLink>
  <NavLink to={`/learn/${resumeSetId}`}>เรียน</NavLink>
  <NavLink to={`/practice/${resumeSetId}`}>ฝึก</NavLink>
  <NavLink to="/library">คลัง</NavLink>
  <NavLink to="/profile">ฉัน</NavLink>
</nav>
```

Keep the flashcard controls in reach of a one-handed 390 px viewport. Use the progress store for save status, preserve the existing sound/effect functions, defer `vocabulary.json` loading until the library route renders, and use `createExam`/`gradeStage` for all three stages with pinyin hidden in meaning stage.

- [ ] **Step 4: Run the UI tests and inspect mobile layout**

Run: `pnpm vitest run tests/learning/learn-page.test.tsx tests/exams/exam-page.test.tsx tests/library/library-page.test.tsx && pnpm build`

Expected: PASS and build completes. Manually inspect a 390 x 844 preview: no horizontal overflow, card controls and bottom navigation remain visible.

- [ ] **Step 5: Commit the learning experience**

```bash
git add src/components src/features src/styles.css src/lib/curriculum src/lib/audio tests/learning tests/exams tests/library
git commit -m "feat: rebuild mobile HSK learning experience"
```

### Task 6: Prepare Cloudflare Pages deployment and remove legacy references

**Files:**
- Modify: `README.md`, `.gitignore`, `package.json`
- Delete: `.openai/hosting.json`, `examples/d1/`, `tests/auth/progress-route.test.ts`, `tests/progress/repository.test.ts`
- Test: `tests/deployment/static-build.test.ts`

**Interfaces:**
- Produces: a Pages-ready repository using `pnpm build` and `dist` output.
- Consumes: Tasks 1–5.

- [ ] **Step 1: Write the failing static deployment test**

```ts
it('does not ship ChatGPT, D1, or Worker runtime references', () => {
  const sources = collectTextFiles(['src', 'package.json', 'vite.config.ts']);
  expect(sources).not.toMatch(/signin-with-chatgpt|cloudflare:workers|D1ProgressRepository|service_role/i);
  expect(readFileSync('public/_redirects', 'utf8')).toContain('/* /index.html 200');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/deployment/static-build.test.ts`

Expected: FAIL until legacy files and references are removed.

- [ ] **Step 3: Document the deploy settings and environment variables**

Add the following exact README deployment values:

```text
Cloudflare Pages framework preset: Vite
Build command: pnpm build
Build output directory: dist
Production branch: main
Variables: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
```

Document adding the Pages production URL and `https://*.pages.dev/**` preview pattern in Supabase Auth URL configuration, enabling Email OTP, applying the migration, and never committing `.env.local`.

- [ ] **Step 4: Run full verification**

Run: `pnpm test && pnpm lint && pnpm build`

Expected: all tests pass, lint has zero errors, build outputs `dist/`, and the legacy-reference test passes.

- [ ] **Step 5: Commit deployment preparation**

```bash
git add README.md .gitignore package.json public/_redirects tests/deployment/static-build.test.ts
git rm .openai/hosting.json tests/auth/progress-route.test.ts tests/progress/repository.test.ts
git rm -r examples/d1
git commit -m "chore: prepare HSK Mission for Cloudflare Pages"
```

### Task 7: Deploy preview, configure Supabase Auth URLs, and accept the release

**Files:**
- Modify: Cloudflare Pages project settings and Supabase Auth URL configuration
- Test: production and preview browser acceptance checklist

**Interfaces:**
- Consumes: GitHub `main`, Cloudflare Pages build output, Supabase project configured in Tasks 2 and 3.
- Produces: a working Cloudflare Pages URL with real cross-device progress.

- [ ] **Step 1: Push the reviewed branch and create a Cloudflare Pages preview**

Run: `git push github HEAD:main`

Expected: GitHub Actions/Cloudflare Pages builds from `pnpm build` and exposes a preview URL.

- [ ] **Step 2: Add the preview and production URLs in Supabase**

In Supabase Auth URL Configuration, set Site URL to the production Pages URL and add both the exact production URL and the Pages preview wildcard URL to Redirect URLs.

Expected: sending an OTP no longer reports an unapproved redirect URL.

- [ ] **Step 3: Verify the signed-in cross-device path**

1. On device A, sign in with an email OTP and complete one flashcard in `set-01`.
2. Refresh device A and verify the studied count remains one.
3. On device B, sign in with the same email and verify the studied count is one.
4. Complete 20 cards, then submit 20/20 in meaning and typing and 19/20 in tone; verify the set remains incomplete.
5. Submit 20/20 in tone; verify the set is marked complete.

Expected: only the authenticated learner sees these records; guest mode remains usable when signed out.

- [ ] **Step 4: Verify the mobile release**

At 390 x 844, visit Dashboard, Learn, Practise, Exam, Library, and Profile. Refresh `/learn/set-01` and `/library`.

Expected: every route loads, the bottom navigation stays usable, and no page creates horizontal scrolling.

- [ ] **Step 5: Commit configuration documentation if it changed**

```bash
git add README.md
git commit -m "docs: record Cloudflare Pages release setup"
```

## Plan Self-Review

- **Spec coverage:** Tasks 1–7 cover static Pages hosting, email OTP, RLS, public curriculum, guest mode, local sync, all learning/game/exam flows, mobile UI, and deployment validation.
- **Placeholder scan:** the plan contains no unresolved work markers or deferred implementation language.
- **Type consistency:** `useAuth`, `ProgressStore`, `markStudied`, `recordExam`, and `getSetProgress` are defined before feature tasks consume them.
- **Review focus coverage:** guest merge and missing configuration are tested in Task 4; RLS contract in Task 2; perfect-score gate in Task 4; SPA direct navigation in Task 1.
