import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { App } from '@/src/App';

const auth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1', email: 'china_lover@hsk.local' } } } }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('@/src/lib/supabase/client', () => ({ getSupabaseClient: () => ({ auth }) }));

it('replaces sign-in with the signed-in profile name', async () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /เรียนจีนทุกวัน/i })).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'เมนูหลัก' })).toBeVisible();
  expect(await screen.findByRole('button', { name: 'โปรไฟล์ china_lover' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'เข้าสู่ระบบ' })).not.toBeInTheDocument();
});
