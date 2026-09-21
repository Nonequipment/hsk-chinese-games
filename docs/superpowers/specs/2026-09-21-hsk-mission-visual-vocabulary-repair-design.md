+# HSK Mission Visual and Vocabulary Repair Design

## Purpose

Restore the learning experience so learners can immediately study the real 1,200-word HSK 4.0 curriculum in a polished, mobile-first interface. The current build exposes a placeholder dashboard, unstyled authentication controls, generic library cards, and a learning route that cannot resolve the first set.

## Findings

- Curriculum identifiers are `S01` through `S60`, while the dashboard and bottom navigation link to `set-01`. The mismatch leaves the flashcard without an item.
- Every vocabulary item already has Chinese (`hanzi`), pinyin, Thai meaning, category, and its set assignment in `data/curriculum.json`.
- The current stylesheet is a thin prototype and does not style the auth sheet, learning states, empty/loading states, or responsive controls.

## Experience

### Application shell

Use a bright Modern Chinese Learning theme: soft ice-blue canvas, white layered surfaces, cobalt blue primary actions, navy text, blue-to-violet accent gradients, and compact rounded controls. A top brand bar identifies HSK Mission and the target date. A fixed mobile navigation has clear icon-plus-label actions for Mission, Learn, Library, and Profile.

### Mission dashboard

The dashboard makes the next action obvious:
- a mission hero showing total progress and the target date;
- four concise statistic tiles (studied sets, words learned, remaining sets, and days remaining);
- a “continue learning” card linked to the first unfinished set;
- a visually grouped daily recommendation using the plan already embedded in the curriculum;
- a short learning method strip showing Learn → Practice → Exam.

Before sign-in, the dashboard remains useful and shows a compact sign-in button; it must not expose a raw, unstyled form.

### Learning card

The route accepts canonical IDs (`S01`) and friendly paths (`set-01`) and resolves both to the same set. It loads all 20 set items, starts on the first word, and has previous/next navigation.

Each card displays:
- set number, category, and an item counter;
- Chinese word as the primary content;
- an interactive pinyin switch;
- Thai translation;
- a sound action that uses browser speech synthesis where available;
- a stroke-order learning entry, stated as a launch point when no local stroke animation asset is available;
- remember/known and next controls.

Loading and missing-set states must explain the condition in Thai and provide a link back to the library.

### Vocabulary library

The library loads the existing curriculum only when the route is opened. It adds a search field for Chinese, pinyin, Thai, and category. Set cards include number, category, word count, a completion marker from local progress, and a direct entry point. The layout is one card wide on phone and expands to a dense grid on wider screens.

## Data and persistence

The deployed static app retains the existing curriculum JSON. A small pure resolver normalizes routes to canonical set IDs and selects each set’s items in curriculum order. Local storage remains a fallback for finished sets. The existing Supabase authentication remains password based, but UI presentation is restyled; the redesign does not change the database schema.

## Responsive and accessibility rules

- Support widths from 320px upward with a fixed bottom navigation that respects safe-area insets.
- Use semantic buttons/links, visible focus treatments, readable contrast, and labels for icon-only actions.
- Keep the core study card fully visible without horizontal scrolling at mobile sizes.
- Respect `prefers-reduced-motion`.

## Validation

- Unit-test canonical and friendly set-ID resolution, including invalid IDs.
- Render the learning route and verify the first word of S01 is 爸爸, its pinyin is bàba, and its Thai meaning is พ่อ.
- Verify library search returns a known Chinese and Thai match.
- Run the full test suite, production build, and browser checks of dashboard, direct learning URL, and library at a mobile viewport.

## Scope boundary

This repair focuses on the deployed dashboard, flashcards, and library. It preserves the existing Supabase authentication and curriculum, while full game and exam interfaces remain later work.

