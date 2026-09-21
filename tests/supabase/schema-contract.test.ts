import { readFileSync } from 'node:fs';

it('defines RLS and owner predicates for every learner table', () => {
  const sql = readFileSync('supabase/migrations/202609210001_hsk_progress.sql', 'utf8');
  for (const table of ['profiles', 'study_progress', 'set_progress', 'exam_attempts']) {
    expect(sql).toContain(`alter table public.${table} enable row level security`);
  }
  expect(sql).toContain('(select auth.uid()) = user_id');
});
