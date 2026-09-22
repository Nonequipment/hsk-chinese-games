import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/src/lib/auth/auth-provider';
import { SignInSheet } from '@/src/features/auth/sign-in-sheet';

it('creates an account with a username and password', async () => {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn(),
  };
  const user = userEvent.setup();
  render(<AuthProvider client={{ auth } as never}><SignInSheet open /></AuthProvider>);
  expect(screen.getByRole('heading', { name: 'กลับมาเรียนกันต่อ' })).toBeVisible();
  expect(screen.getByText('ใช้ชื่อผู้ใช้และรหัสผ่านของคุณ')).toBeVisible();
  await user.click(screen.getByRole('button', { name: /สมัครด้วยชื่อผู้ใช้และรหัสผ่าน/i }));
  expect(screen.getByRole('heading', { name: 'สร้างบัญชีใหม่' })).toBeVisible();
  await user.type(screen.getByLabelText(/ชื่อผู้ใช้/i), 'learn.er');
  await user.type(screen.getByLabelText(/รหัสผ่าน/i), 'securepass8');
  await user.click(screen.getByRole('button', { name: /^สร้างบัญชี/ }));
  expect(auth.signUp).toHaveBeenCalledWith({ email: 'learn.er@hsk.local', password: 'securepass8' });
});
