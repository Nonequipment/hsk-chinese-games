import { getSupabaseClient } from '@/src/lib/supabase/client';

it('reuses one Supabase browser client', () => {
  expect(getSupabaseClient()).toBe(getSupabaseClient());
});
