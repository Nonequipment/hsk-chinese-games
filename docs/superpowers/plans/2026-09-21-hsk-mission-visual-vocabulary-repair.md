+# HSK Mission Visual and Vocabulary Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a polished, mobile-first HSK dashboard, library, and real vocabulary flashcard learning flow.

**Architecture:** Keep the Vite SPA and lazy curriculum JSON. Add a small pure curriculum utility for canonical set lookup, use it from the routes, and replace the prototype shell with responsive components and CSS. Browser speech synthesis remains client-only and local progress remains a fallback.

**Tech Stack:** React 19, React Router, TypeScript, Vite, Vitest, Testing Library, browser SpeechSynthesis.

**Spec:** docs/superpowers/specs/2026-09-21-hsk-mission-visual-vocabulary-repair-design.md

## Global Constraints

- Preserve the existing 1,200-word JSON curriculum and Supabase password auth.
- Support canonical `S01` and friendly `set-01` paths.
- Keep the mobile experience usable at 320px without horizontal scroll.
- Do not add a dependency for visual assets or speech.
- Push the tested static Vite build to `main` for Cloudflare Pages deployment.

## Review Focus

- Invalid set links must show a Thai recovery state rather than a blank study card.
- The first S01 card must show 爸爸, bàba, and พ่อ.
- Direct navigation to `/learn/set-01` and `/learn/S01` must resolve identically.
- Search must match Chinese, pinyin, Thai meaning, and category.
- Pinyin must remain hidden when the learner turns the toggle off.

---

### Task 1: Curriculum route resolver

**Files:**
- Create: `src/lib/curriculum.ts`
- Create: `tests/ui/curriculum.test.ts`

**Interfaces:**
- Produces: `normalizeSetId(value?: string): string | null` and `getSetItems(data, value?: string): { set, items } | null`.
- Consumed by: Task 2 learning and library routes.

- [ ] **Step 1: Write failing tests**
```ts
expect(normalizeSetId('set-01')).toBe('S01');
expect(normalizeSetId('S01')).toBe('S01');
expect(normalizeSetId('not-a-set')).toBeNull();
expect(getSetItems(curriculum, 'set-01')?.items[0].hanzi).toBe('爸爸');
```
- [ ] **Step 2: Run the focused test and verify it fails**
Run: `pnpm test tests/ui/curriculum.test.ts`
Expected: import error because `src/lib/curriculum.ts` does not exist.
- [ ] **Step 3: Implement resolver**
- [ ] **Step 4: Re-run focused test and verify it passes**
- [ ] **Step 5: Commit**
```bash
git add src/lib/curriculum.ts tests/ui/curriculum.test.ts
git commit -m "fix: resolve friendly HSK set links"
```

### Task 2: Real flashcard session

**Files:**
- Modify: `src/App.tsx`
- Create: `tests/ui/learning-route.test.tsx`

**Interfaces:**
- Consumes: Task 1 `getSetItems`.
- Produces: a flashcard session with ordered navigation, pinyin toggle, speech action, and local completion.

- [ ] **Step 1: Write a failing route test**
```tsx
render(<MemoryRouter initialEntries={['/learn/set-01']}><App /></MemoryRouter>);
expect(await screen.findByText('爸爸')).toBeInTheDocument();
expect(screen.getByText('bàba')).toBeInTheDocument();
expect(screen.getByText('พ่อ')).toBeInTheDocument();
```
- [ ] **Step 2: Run it and verify it fails due to unresolved set ID**
- [ ] **Step 3: Implement session navigation and recovery state**
- [ ] **Step 4: Verify pinyin toggle and focused test pass**
- [ ] **Step 5: Commit**
```bash
git add src/App.tsx tests/ui/learning-route.test.tsx
git commit -m "feat: add ordered vocabulary flashcards"
```

### Task 3: Modern dashboard and library

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `tests/ui/library-route.test.tsx`

**Interfaces:**
- Consumes: Task 1 curriculum loader and local finished-set IDs.
- Produces: responsive mission dashboard and searchable library.

- [ ] **Step 1: Write a failing search test**
```tsx
render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);
await user.type(await screen.findByLabelText('ค้นหาคำศัพท์'), 'พ่อ');
expect(screen.getByText('爸爸')).toBeInTheDocument();
```
- [ ] **Step 2: Run it and verify it fails because the library lacks search and word previews**
- [ ] **Step 3: Implement dashboard, searchable library, visual components, and mobile CSS**
- [ ] **Step 4: Run the focused test and full UI tests**
- [ ] **Step 5: Commit**
```bash
git add src/App.tsx src/styles.css tests/ui/library-route.test.tsx
git commit -m "feat: redesign HSK Mission learning experience"
```

### Task 4: Verify and release

**Files:**
- Modify: `public/_redirects` only if route verification identifies a production problem.

- [ ] **Step 1: Run `pnpm test`**
Expected: all tests pass.
- [ ] **Step 2: Run `pnpm build`**
Expected: Vite build succeeds.
- [ ] **Step 3: Use a 390px browser viewport to check dashboard, `/learn/set-01`, and `/library`**
- [ ] **Step 4: Push current branch to `github main`**
```bash
git push github HEAD:main
```
- [ ] **Step 5: Verify the Cloudflare Pages production URL after deployment**

