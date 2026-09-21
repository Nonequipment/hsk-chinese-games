# HSK 1,200 Adaptive Learning Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing `hsk-chinese-games` static game with a mobile-first, account-backed HSK 4.0 2.0 learning site for 1,200 words, 60 sets, adaptive daily planning, flashcard study, practice games, and three perfect-score exams.

**Architecture:** Convert the existing Site checkout to the Sites Vinext starter, keep the existing `project_id`, and run as a Cloudflare Worker. Public vocabulary reads come from checked-in validated JSON; signed-in progress and exam data live in D1 behind server-only repositories. React routes consume small typed domain modules for planning, mastery, games, and exams so each behavior can be tested without rendering the whole app.

**Tech Stack:** Vinext, React, TypeScript, Tailwind CSS, bundled Shadcn primitives, Cloudflare Workers, D1/SQLite, Drizzle migrations, ChatGPT sign-in helpers, Vitest, Playwright, Hanzi Writer, Web Audio API.

**Spec:** `docs/superpowers/specs/2026-09-21-hsk1200-learning-site-design.md`

## Global Constraints

- Reuse Site project `appgprj_6aa7a3ff4ef481918692cbf4fe662bbe` and public URL `https://hsk-chinese-games.noona55555.chatgpt.site`.
- Preserve the existing public audience; protect personal routes and mutations with server-side ChatGPT identity checks.
- Import exactly 1,200 vocabulary rows in exactly 60 sets of 20; retain duplicate Hanzi rows as distinct vocabulary IDs.
- Day 1 consists of S01, S02, and S03, totaling 60 words.
- A card is studied only after its answer is revealed and the user selects a memory status.
- An exam unlocks only after all 20 cards in that set are studied.
- A set passes only after 20/20 in meaning, Hanzi typing, and tone exams; passed stages persist independently.
- The meaning exam never displays pinyin and no exam reveals correctness until the stage ends.
- Use 17 October 2026 in Asia/Bangkok as the target date.
- Design at 320 px and 390 px widths first; no horizontal page scrolling and primary touch targets are at least 44 px.
- Do not migrate progress from the former Day 1–4 game.
- Keep the former deployed version recoverable through Sites version history.

## Review Focus

- Duplicate Hanzi rows with different vocabulary IDs must stay separate in imports, progress, questions, and exam results; Task 2 tests this with the repeated `只` rows.
- A forged client request must not mark a set or exam as passed; Tasks 3 and 11 test server-derived completion and ownership.
- A disconnect after answering but before save must not create a false pass or duplicate attempt; Tasks 11 and 12 test idempotent submission and retry.
- Date boundaries around midnight Bangkok time and the 17 October deadline must return deterministic recommendations; Task 5 tests 16, 17, and 18 October.
- A 320 px screen with a multi-character word and open stroke-order tab must keep navigation reachable without horizontal overflow; Tasks 9 and 12 test this viewport.

---

### Task 1: Convert the existing checkout to the server-backed Sites starter

**Files:**
- Preserve: `.openai/hosting.json`
- Create from Sites starter: `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/chatgpt-auth.ts`
- Create: `app/components/app-shell.tsx`, `public/favicon.svg`
- Remove after replacement is verified: `dist/index.html`, `dist/assets/**`
- Test: `tests/smoke/home.test.tsx`

**Interfaces:**
- Consumes: existing `project_id` from `.openai/hosting.json`.
- Produces: a buildable Vinext application, `AppShell({ children, active })`, and a server Worker archive path used by every later task.

- [ ] **Step 1: Write the failing smoke test**

```tsx
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

it('renders the HSK 1200 product shell', async () => {
  render(await HomePage());
  expect(screen.getByRole('heading', { name: /HSK 4\.0.*1,200/ })).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'เมนูหลัก' })).toBeVisible();
});
```

- [ ] **Step 2: Run the smoke test and verify RED**

Run: `pnpm vitest run tests/smoke/home.test.tsx`  
Expected: FAIL because the Vinext app and `HomePage` do not exist.

- [ ] **Step 3: Configure the portable execution profile and scaffold the starter without replacing Git metadata**

Run the Sites `configure-execution-profile.mjs`, then `project-setup.mjs` in the existing checkout. Restore the exact existing `.openai/hosting.json` identity and change its capability shape to:

```json
{
  "project_id": "appgprj_6aa7a3ff4ef481918692cbf4fe662bbe",
  "d1": { "DB": {} }
}
```

- [ ] **Step 4: Implement the minimal shell and futuristic theme**

```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#050817] text-slate-100">
    <nav aria-label="เมนูหลัก">หน้าหลัก คลังศัพท์ เรียน โปรไฟล์</nav>
    <main>{children}</main>
  </div>;
}
```

Add a site-specific `学` circuit favicon and tokens for navy, electric blue, violet, green, glass panels, readable Thai text, focus rings, and reduced motion.

- [ ] **Step 5: Install, test, and build**

Run: `node <sites-plugin>/scripts/install-dependencies.mjs`  
Run: `pnpm vitest run tests/smoke/home.test.tsx`  
Run: `node <sites-plugin>/scripts/build-site.mjs`  
Expected: test PASS and Worker build exits 0 with `dist/server/index.js`.

- [ ] **Step 6: Commit**

```bash
git add .openai package.json pnpm-lock.yaml vite.config.ts tsconfig.json app public tests
git commit -m "Build the HSK 1200 application shell"
```

### Task 2: Extract and validate the 1,200-word curriculum

**Files:**
- Create: `scripts/extract-curriculum.py`
- Create: `data/curriculum.json`
- Create: `app/lib/curriculum/types.ts`
- Create: `app/lib/curriculum/load.ts`
- Test: `tests/curriculum/curriculum.test.ts`

**Interfaces:**
- Consumes: `HSK4_1200_Semantic_Sets_Thai_Translated_Plan_to_16Oct2026.xlsx` with sheets `Vocabulary_1200`, `Sets_60`, and `Plan_26_Days`.
- Produces: `Curriculum`, `VocabularyItem`, `VocabularySet`, `getSet(setId)`, `searchVocabulary(query, filters)`.

- [ ] **Step 1: Write the failing curriculum contract test**

```ts
import { curriculum } from '@/app/lib/curriculum/load';

it('preserves the complete workbook curriculum', () => {
  expect(curriculum.items).toHaveLength(1200);
  expect(curriculum.sets).toHaveLength(60);
  expect(curriculum.sets.every(set => set.itemIds.length === 20)).toBe(true);
  expect(curriculum.days[0]).toMatchObject({ day: 1, setIds: ['S01', 'S02', 'S03'] });
  expect(curriculum.items.filter(item => item.hanzi === '只').length).toBeGreaterThan(1);
  expect(new Set(curriculum.items.map(item => item.id)).size).toBe(1200);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run tests/curriculum/curriculum.test.ts`  
Expected: FAIL because `curriculum/load` does not exist.

- [ ] **Step 3: Implement the extraction script and generated schema**

```py
item = {
    "id": f"V{row[0]:04d}", "number": row[0], "setId": row[1],
    "category": row[2], "hanzi": row[4], "pinyin": row[5],
    "thai": row[6]
}
```

Fail extraction unless there are 1,200 unique IDs, 60 set IDs, 20 items per set, non-empty Hanzi/Pinyin/Thai values, and Day 1 equals S01–S03. Serialize dates as `YYYY-MM-DD` and retain repeated Hanzi rows.

- [ ] **Step 4: Implement typed loading and search**

```ts
export type VocabularyItem = Readonly<{
  id: string; number: number; setId: string; category: string;
  hanzi: string; pinyin: string; thai: string;
}>;
export function getSet(id: string): VocabularySet | undefined;
export function searchVocabulary(query: string, filters?: { setId?: string; category?: string }): VocabularyItem[];
```

- [ ] **Step 5: Generate data and run validation tests**

Run the script with the supplied workbook path.  
Run: `pnpm vitest run tests/curriculum/curriculum.test.ts`  
Expected: PASS with 1,200 items, 60 sets, and retained duplicates.

- [ ] **Step 6: Commit**

```bash
git add scripts data app/lib/curriculum tests/curriculum
git commit -m "Import and validate the HSK 1200 curriculum"
```

### Task 3: Create the D1 schema and ownership-safe progress repository

**Files:**
- Create: `db/schema.ts`
- Create: `app/lib/db/env.ts`
- Create: `app/lib/curriculum/seed.ts`
- Create: `app/lib/progress/types.ts`
- Create: `app/lib/progress/repository.ts`
- Create: generated `drizzle/*.sql`, `drizzle/meta/**`
- Test: `tests/progress/repository.test.ts`

**Interfaces:**
- Consumes: stable `userId`, curriculum vocabulary IDs, set IDs, and D1 `DB` binding.
- Produces: `ProgressRepository` methods `getDashboard(userId)`, `markCardStudied(input)`, `saveGameAttempt(input)`, `beginExam(input)`, `submitExam(input)`, `getSetProgress(userId, setId)`.

- [ ] **Step 1: Write failing repository tests**

```ts
it('scopes every progress read to the authenticated user', async () => {
  await repo.markCardStudied({ userId: 'u1', itemId: 'V0001', status: 'remembered', requestId: 'r1' });
  expect((await repo.getSetProgress('u2', 'S01')).studiedCount).toBe(0);
});

it('deduplicates retried card writes', async () => {
  await repo.markCardStudied({ userId: 'u1', itemId: 'V0001', status: 'learning', requestId: 'same' });
  await repo.markCardStudied({ userId: 'u1', itemId: 'V0001', status: 'learning', requestId: 'same' });
  expect(await repo.countCardEvents('u1', 'V0001')).toBe(1);
});

it('seeds all curriculum rows once without merging duplicate Hanzi', async () => {
  await ensureCurriculumSeeded(db, curriculum);
  await ensureCurriculumSeeded(db, curriculum);
  expect(await db.count('vocabulary_items')).toBe(1200);
  expect(await db.countWhere('vocabulary_items', { hanzi: '只' })).toBeGreaterThan(1);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/progress/repository.test.ts`  
Expected: FAIL because schema and repository do not exist.

- [ ] **Step 3: Define tables and constraints**

Create `curriculum_versions`, `vocabulary_sets`, `vocabulary_items`, `user_word_progress`, `user_set_progress`, `exam_attempts`, `exam_answers`, `game_attempts`, `user_preferences`, and `mutation_receipts`. Use the workbook item ID as the vocabulary primary key so repeated Hanzi remain distinct. Use composite uniqueness on `(user_id, item_id)`, `(user_id, set_id)`, and `(user_id, request_id)`. Index common predicates on `(user_id, set_id)` and `(user_id, updated_at)`.

- [ ] **Step 4: Implement prepared-statement repository methods**

```ts
export interface ProgressRepository {
  markCardStudied(input: { userId: string; itemId: string; status: MemoryStatus; requestId: string }): Promise<void>;
  getSetProgress(userId: string, setId: string): Promise<SetProgress>;
  submitExam(input: SubmitExamInput): Promise<ExamResult>;
}
```

Derive `studiedCount`, unlock state, passed stages, and set completion on the server. Never accept these derived fields from a client payload.

- [ ] **Step 5: Implement an idempotent curriculum seed separate from migrations**

```ts
export async function ensureCurriculumSeeded(db: D1Database, curriculum: Curriculum): Promise<void> {
  const version = await readCurriculumVersion(db);
  if (version === curriculum.version) return;
  for (const batch of chunk(curriculum.items, 100)) {
    await db.batch(batch.map(item => db.prepare(INSERT_ITEM_SQL).bind(
      item.id, item.number, item.setId, item.category, item.hanzi, item.pinyin, item.thai,
    )));
  }
  await writeCurriculumVersion(db, curriculum.version, 1200, 60);
}
```

Use `INSERT ... ON CONFLICT(id) DO UPDATE` so interrupted and concurrent retries converge on the checked-in curriculum version. Call this helper before authenticated progress access; public library reads continue to use the identical checked-in JSON.

- [ ] **Step 6: Generate and inspect the migration**

Run the starter's Drizzle generation command. Confirm each migration contains schema statements only, no 1,200-row seed payload, and D1-safe defaults.

- [ ] **Step 7: Run repository tests and commit**

Run: `pnpm vitest run tests/progress/repository.test.ts`  
Expected: PASS.

```bash
git add db app/lib/db app/lib/curriculum/seed.ts app/lib/progress drizzle tests/progress
git commit -m "Store user learning progress in D1"
```

### Task 4: Add ChatGPT sign-in and protected progress APIs

**Files:**
- Create: `app/components/auth/sign-in-card.tsx`
- Create: `app/api/progress/route.ts`
- Create: `app/api/cards/route.ts`
- Create: `app/profile/page.tsx`
- Modify: `app/page.tsx`, `app/components/app-shell.tsx`
- Test: `tests/auth/progress-route.test.ts`

**Interfaces:**
- Consumes: `getChatGPTUser()`, `chatGPTSignInPath(returnTo)`, `ProgressRepository`.
- Produces: authenticated JSON APIs and optional signed-in UI with safe same-origin return paths.

- [ ] **Step 1: Write failing authentication boundary tests**

```ts
it('rejects anonymous progress writes', async () => {
  const response = await POST(makeRequest({ itemId: 'V0001' }), { getUser: async () => null });
  expect(response.status).toBe(401);
});

it('ignores a forged userId in the payload', async () => {
  await POST(makeRequest({ userId: 'victim', itemId: 'V0001' }), { getUser: async () => ({ id: 'real-user' }) });
  expect(repo.lastWrite.userId).toBe('real-user');
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/auth/progress-route.test.ts`  
Expected: FAIL because protected routes do not exist.

- [ ] **Step 3: Implement sign-in UI and server identity checks**

Use `<a href={chatGPTSignInPath('/')} target="_top">เข้าสู่ระบบด้วย ChatGPT</a>` for sign-in. API handlers call `getChatGPTUser()` server-side, return 401 for anonymous requests, and pass only `user.id` to repositories.

- [ ] **Step 4: Run auth tests and commit**

Run: `pnpm vitest run tests/auth/progress-route.test.ts`  
Expected: PASS.

```bash
git add app/components/auth app/api app/profile app/page.tsx app/components/app-shell.tsx tests/auth
git commit -m "Protect synced progress with ChatGPT sign-in"
```

### Task 5: Implement the adaptive plan domain and Dashboard data contract

**Files:**
- Create: `app/lib/planning/adaptive-plan.ts`
- Create: `app/lib/dashboard/service.ts`
- Create: `app/api/dashboard/route.ts`
- Test: `tests/planning/adaptive-plan.test.ts`

**Interfaces:**
- Consumes: Bangkok calendar date, target `2026-10-17`, completed set IDs, recent completion dates.
- Produces: `getAdaptivePlan(input): AdaptivePlan` and `DashboardSnapshot`.

- [ ] **Step 1: Write failing boundary tests**

```ts
expect(getAdaptivePlan({ today: '2026-10-16', target: '2026-10-17', remainingSets: 3, recentDailyRates: [] }).recommendedSets).toBe(2);
expect(getAdaptivePlan({ today: '2026-10-17', target: '2026-10-17', remainingSets: 3, recentDailyRates: [] }).recommendedSets).toBe(3);
expect(getAdaptivePlan({ today: '2026-10-18', target: '2026-10-17', remainingSets: 3, recentDailyRates: [2, 1] }).recommendedSets).toBe(2);
expect(getAdaptivePlan({ today: '2026-09-21', target: '2026-10-17', remainingSets: 0, recentDailyRates: [] }).recommendedSets).toBe(0);
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/planning/adaptive-plan.test.ts`  
Expected: FAIL because `getAdaptivePlan` is undefined.

- [ ] **Step 3: Implement deterministic Bangkok-date planning**

```ts
export function getAdaptivePlan(input: PlanInput): AdaptivePlan {
  if (input.remainingSets === 0) return { mode: 'complete', recommendedSets: 0 };
  const days = inclusiveBangkokDays(input.today, input.target);
  if (days > 0) return { mode: 'deadline', recommendedSets: Math.ceil(input.remainingSets / days) };
  const recent = input.recentDailyRates.filter(rate => rate > 0).slice(-7);
  return { mode: 'continue', recommendedSets: Math.max(1, Math.ceil(average(recent) || 1)) };
}
```

- [ ] **Step 4: Build the Dashboard service contract**

Return recommended sets, days remaining, completed/studying/not-started counts, studied word counts by memory status, current set exam stages, difficult words, and resume target. Anonymous snapshots contain curriculum totals and a sign-in prompt but no fabricated progress.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run tests/planning/adaptive-plan.test.ts`  
Expected: PASS.

```bash
git add app/lib/planning app/lib/dashboard app/api/dashboard tests/planning
git commit -m "Calculate adaptive daily learning missions"
```

### Task 6: Build the responsive Mission Control shell and Dashboard

**Files:**
- Create: `app/components/navigation/mobile-nav.tsx`
- Create: `app/components/navigation/desktop-sidebar.tsx`
- Create: `app/components/dashboard/daily-mission.tsx`
- Create: `app/components/dashboard/progress-ring.tsx`
- Create: `app/components/dashboard/timeline.tsx`
- Modify: `app/page.tsx`, `app/globals.css`, `app/components/app-shell.tsx`
- Test: `tests/dashboard/dashboard.test.tsx`

**Interfaces:**
- Consumes: `DashboardSnapshot` from Task 5.
- Produces: responsive Dashboard and persistent navigation used by all routes.

- [ ] **Step 1: Write failing component tests**

```tsx
render(<Dashboard snapshot={fixture} />);
expect(screen.getByText('ภารกิจวันนี้')).toBeVisible();
expect(screen.getByText('แนะนำ 3 เซ็ต')).toBeVisible();
expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '/learn/S04');
expect(screen.getByLabelText('ความก้าวหน้า 5 จาก 60 เซ็ต')).toBeVisible();
```

- [ ] **Step 2: Run test and verify RED**

Run: `pnpm vitest run tests/dashboard/dashboard.test.tsx`  
Expected: FAIL because Dashboard components do not exist.

- [ ] **Step 3: Implement mobile-first Dashboard and navigation**

Use semantic cards, `Progress`, and navigation primitives. Keep the daily mission and resume button above the fold. Use a four-item bottom nav below 768 px and sidebar above it. Apply glass panels, electric blue/violet accents, high contrast, and reduced-motion fallbacks.

- [ ] **Step 4: Run component tests and commit**

Run: `pnpm vitest run tests/dashboard/dashboard.test.tsx`  
Expected: PASS.

```bash
git add app/components/navigation app/components/dashboard app/page.tsx app/globals.css app/components/app-shell.tsx tests/dashboard
git commit -m "Create the adaptive Mission Control dashboard"
```

### Task 7: Build the 60-set vocabulary library

**Files:**
- Create: `app/library/page.tsx`
- Create: `app/library/library-client.tsx`
- Create: `app/library/[setId]/page.tsx`
- Create: `app/components/library/set-card.tsx`
- Create: `app/components/library/vocabulary-row.tsx`
- Test: `tests/library/library.test.tsx`

**Interfaces:**
- Consumes: `searchVocabulary`, curriculum sets, optional `SetProgress` summaries.
- Produces: public searchable/filterable library and set detail links to `/learn/[setId]`.

- [ ] **Step 1: Write failing search and duplicate tests**

```tsx
render(<LibraryClient sets={sets} items={items} progress={[]} />);
await user.type(screen.getByRole('searchbox'), '只');
expect(screen.getAllByText('只').length).toBeGreaterThan(1);
await user.selectOptions(screen.getByLabelText('สถานะ'), 'not-started');
expect(screen.getByText('S60')).toBeVisible();
```

- [ ] **Step 2: Run test and verify RED**

Run: `pnpm vitest run tests/library/library.test.tsx`  
Expected: FAIL because library routes and components do not exist.

- [ ] **Step 3: Implement the library and set detail pages**

Search normalized Hanzi, pinyin without tone marks, and Thai. Filters include category, set ID, and progress state. Anonymous users see curriculum data; signed-in users also see card/exam progress. Never merge rows solely by Hanzi.

- [ ] **Step 4: Run tests and commit**

Run: `pnpm vitest run tests/library/library.test.tsx`  
Expected: PASS.

```bash
git add app/library app/components/library tests/library
git commit -m "Add the searchable 60-set vocabulary library"
```

### Task 8: Implement flashcard study, audio, and stroke order

**Files:**
- Create: `app/learn/[setId]/page.tsx`
- Create: `app/learn/[setId]/flashcard-session.tsx`
- Create: `app/components/learning/memory-controls.tsx`
- Create: `app/components/learning/stroke-order.tsx`
- Create: `app/lib/audio/speech.ts`
- Create: `app/api/cards/study/route.ts`
- Copy/adapt: `public/vendor/hanzi-writer.min.js`, `public/data/strokes.json`, associated license files
- Test: `tests/learning/flashcards.test.tsx`

**Interfaces:**
- Consumes: one `VocabularySet`, signed-in user, `markCardStudied`, Hanzi Writer data.
- Produces: 20-card session, `MemoryStatus`, resume position, and `studiedCount` that unlocks exams.

- [ ] **Step 1: Write failing study-completion tests**

```tsx
render(<FlashcardSession set={s01} initialProgress={[]} />);
expect(screen.getByText('爸爸')).toBeVisible();
expect(screen.queryByText('bàba')).not.toBeVisible();
await user.click(screen.getByRole('button', { name: 'เปิดคำตอบ' }));
expect(screen.getByText('bàba')).toBeVisible();
await user.click(screen.getByRole('button', { name: 'จำได้แล้ว' }));
expect(saveCard).toHaveBeenCalledWith(expect.objectContaining({ itemId: 'V0001', status: 'remembered' }));
```

- [ ] **Step 2: Run test and verify RED**

Run: `pnpm vitest run tests/learning/flashcards.test.tsx`  
Expected: FAIL because study components do not exist.

- [ ] **Step 3: Implement flashcards and persisted memory controls**

Reveal pinyin and Thai before enabling memory choices. On a memory choice, send a stable request ID, update optimistic UI, and show saving/error state. Restore the last studied card on resume. Exam unlock derives from 20 distinct studied item IDs.

- [ ] **Step 4: Implement optional stroke order and Mandarin speech**

Load Hanzi Writer only when the stroke tab opens. Fit multiple characters within the viewport, cancel old animations on navigation, and expose replay buttons. Use device Mandarin speech when available and preserve explicit mute preferences.

- [ ] **Step 5: Test at 320 px and commit**

Run: `pnpm vitest run tests/learning/flashcards.test.tsx`  
Run the focused Playwright check for `/learn/S01` at 320×568; assert no horizontal overflow and visible previous/next controls with stroke order open.  
Expected: all PASS.

```bash
git add app/learn app/components/learning app/lib/audio app/api/cards public/vendor public/data tests/learning
git commit -m "Add flashcard study with speech and stroke order"
```

### Task 9: Port the seven practice games and sound preferences

**Files:**
- Create: `app/practice/[setId]/page.tsx`
- Create: `app/practice/[setId]/practice-client.tsx`
- Create: `app/lib/games/engine.ts`
- Create: `app/lib/games/pinyin.ts`
- Create: `app/lib/audio/effects.ts`
- Create: `app/api/games/route.ts`
- Test: `tests/games/engine.test.ts`, `tests/games/practice.test.tsx`

**Interfaces:**
- Consumes: a selected 20-word set, user preferences, `saveGameAttempt`.
- Produces: deterministic rounds for `meaning`, `reading`, `pinyin`, `hanzi`, `tones`, `matching`, and `flash`; returns score and missed item IDs.

- [ ] **Step 1: Write failing engine tests**

```ts
for (const mode of ['meaning','reading','pinyin','hanzi','tones','matching','flash'] as const) {
  const game = createGame({ mode, items: s01Items, seed: 42 });
  expect(game.itemIds).toHaveLength(20);
  expect(new Set(game.itemIds).size).toBe(20);
}
expect(acceptsPinyin('nǐ', 'ni3')).toBe(true);
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/games`  
Expected: FAIL because game engine does not exist.

- [ ] **Step 3: Implement pure game engines and mobile practice UI**

Port the validated answer logic from the old game without copying the monolithic HTML structure. Keep choices inside the selected set, prevent duplicates, preserve pinyin tone handling, and store missed vocabulary IDs.

- [ ] **Step 4: Implement speech, pinyin, and effect switches**

Persist user preferences in D1 after sign-in and use browser storage as an immediate UI cache. Correct answers use two soft rising tones; wrong answers use one short low tone. Sound effects never cancel Mandarin speech.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run tests/games`  
Expected: PASS for all seven modes and preference behavior.

```bash
git add app/practice app/lib/games app/lib/audio app/api/games tests/games
git commit -m "Port the complete vocabulary practice suite"
```

### Task 10: Implement the three-stage perfect-score exam engine

**Files:**
- Create: `app/exam/[setId]/page.tsx`
- Create: `app/exam/[setId]/exam-client.tsx`
- Create: `app/lib/exams/engine.ts`
- Create: `app/lib/exams/grading.ts`
- Create: `app/api/exams/start/route.ts`
- Create: `app/api/exams/submit/route.ts`
- Test: `tests/exams/engine.test.ts`, `tests/exams/routes.test.ts`

**Interfaces:**
- Consumes: 20 studied items, authenticated `userId`, previous passed stages, request/attempt ID.
- Produces: `ExamSession`, server-graded `ExamResult`, independent stage pass records, set completion.

- [ ] **Step 1: Write failing exam invariants**

```ts
it('locks exams until all 20 cards are studied', () => {
  expect(canStartExam({ studiedItemIds: s01Ids.slice(0, 19), setItemIds: s01Ids })).toBe(false);
});

it('requires a perfect stage score', () => {
  expect(gradeExam(makeAnswers(19, 20)).passed).toBe(false);
  expect(gradeExam(makeAnswers(20, 20)).passed).toBe(true);
});

it('never exposes pinyin in meaning questions', () => {
  expect(createExam({ stage: 'meaning', items: s01Items, seed: 1 }).questions.every(q => !('pinyin' in q.prompt))).toBe(true);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/exams`  
Expected: FAIL because exam engine and routes do not exist.

- [ ] **Step 3: Implement stage-specific question generation**

Meaning questions show Hanzi and Thai choices without pinyin. Hanzi typing shows Thai and accepts normalized exact Hanzi. Tone questions cover every syllable and grade the complete tone vector. Every stage includes each of the 20 vocabulary IDs exactly once.

- [ ] **Step 4: Implement server-only grading and idempotent submission**

The start route creates an attempt with a server seed and question manifest. The submit route loads that manifest, grades all 20 answers, writes answer rows and stage result in one D1 batch, and deduplicates repeated `attemptId` submissions. It computes set completion only after all three stored stages passed.

- [ ] **Step 5: Preserve passed stages and reject forged completion**

Add route tests proving that a failed second stage leaves the first stage passed, user `u2` cannot submit `u1`'s attempt, 19/20 fails, 20/20 passes, and a client-supplied `passed: true` field is ignored.

- [ ] **Step 6: Run tests and commit**

Run: `pnpm vitest run tests/exams`  
Expected: PASS.

```bash
git add app/exam app/lib/exams app/api/exams tests/exams
git commit -m "Add three perfect-score set exams"
```

### Task 11: Add resilient sync, resume behavior, and profile history

**Files:**
- Create: `app/lib/sync/offline-queue.ts`
- Create: `app/components/sync/save-status.tsx`
- Create: `app/profile/history.tsx`
- Modify: learning, game, and exam clients to use stable mutation IDs
- Test: `tests/sync/offline-queue.test.ts`, `tests/profile/history.test.tsx`

**Interfaces:**
- Consumes: idempotent authenticated routes from Tasks 4, 8, 9, and 10.
- Produces: `enqueueMutation`, `flushQueue`, visible save state, and profile history.

- [ ] **Step 1: Write failing retry tests**

```ts
it('retries a failed card write with the same request ID', async () => {
  const queue = createQueue(storage, send);
  await queue.enqueue({ id: 'r1', type: 'card', payload: card });
  send.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(ok);
  await queue.flush();
  await queue.flush();
  expect(send.mock.calls.map(call => call[0].id)).toEqual(['r1', 'r1']);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/sync tests/profile`  
Expected: FAIL because queue and history do not exist.

- [ ] **Step 3: Implement bounded offline mutation queue**

Queue card and game writes locally with stable IDs, flush on reconnect, and cap retained successful receipts. Exam answers may be cached while an attempt is active, but show “passed” only after the server returns a stored result.

- [ ] **Step 4: Implement profile and learning history**

Show account identity, completion totals, passed exam stages, recent sessions, settings, and sign-out. Resume links use stored set/card position.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run tests/sync tests/profile`  
Expected: PASS.

```bash
git add app/lib/sync app/components/sync app/profile app/learn app/practice app/exam tests/sync tests/profile
git commit -m "Make learning progress resilient across sessions"
```

### Task 12: Verify the complete journey, migrate the Site, and publish

**Files:**
- Create: `tests/e2e/anonymous-library.spec.ts`
- Create: `tests/e2e/signed-in-learning.spec.ts`
- Create: `tests/e2e/mobile-layout.spec.ts`
- Modify: metadata and copy discovered during final verification only

**Interfaces:**
- Consumes: the complete application, local D1 migrations, test user identity fixtures, and Sites publishing tools.
- Produces: verified production replacement at the existing URL.

- [ ] **Step 1: Write the end-to-end acceptance tests**

```ts
test('a learner completes study and all three exams', async ({ page }) => {
  await signInAs(page, 'learner-1');
  await studyAllCards(page, 'S01');
  await passExam(page, 'S01', 'meaning');
  await passExam(page, 'S01', 'hanzi');
  await passExam(page, 'S01', 'tones');
  await expect(page.getByText('ผ่านแล้ว')).toBeVisible();
});
```

Add anonymous library access, sign-in gating, cross-session resume, 19/20 failure, duplicate-Hanzi identity, offline retry, adaptive recommendation, and independent passed-stage cases.

- [ ] **Step 2: Run the full unit and integration suite**

Run: `pnpm vitest run`  
Expected: all tests PASS with no unhandled errors.

- [ ] **Step 3: Run mobile and desktop browser checks**

Run: `pnpm playwright test tests/e2e` at 320×568, 390×844, and desktop.  
Expected: all tests PASS; no horizontal overflow; primary actions remain reachable; keyboard and accessible names work.

- [ ] **Step 4: Build and inspect the production output**

Run: `node <sites-plugin>/scripts/build-site.mjs`  
Verify `dist/server/index.js`, `.openai/hosting.json`, migration files, public assets, favicon, and license files. Confirm the Worker exports a default callable `fetch` handler.

- [ ] **Step 5: Commit the verified release**

```bash
git add app db drizzle data public tests .openai package.json pnpm-lock.yaml
git commit -m "Complete the HSK 1200 adaptive learning site"
```

- [ ] **Step 6: Push, package, save, and deploy the exact commit**

Obtain a source write credential for the existing project, push the configured branch, run `git rev-parse --verify HEAD`, package with the Sites hosting helper, save one version with that exact SHA and archive, and deploy it through the public deployment path because the Site audience is public.

- [ ] **Step 7: Confirm the terminal deployment and hand off**

If deployment is pending, poll the same deployment ID until `succeeded` or `failed`. On success, open the verified URL in the existing Site tab and return `https://hsk-chinese-games.noona55555.chatgpt.site`. Do not fetch the production URL merely to verify deployment.
