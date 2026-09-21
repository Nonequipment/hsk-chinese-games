import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/src/lib/auth/auth-provider';
import { SignInSheet } from '@/src/features/auth/sign-in-sheet';

it('creates an account with an email and password', async () => {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn(),
  };
  const user = userEvent.setup();
  render(<AuthProvider client={{ auth } as never}><SignInSheet open /></AuthProvider>);
  await user.type(screen.getByLabelText(/อีเมล/i), 'learner@example.com');
  await user.type(screen.getByLabelText(/รหัสผ่าน/i), 'securepass8');
  await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));
  expect(auth.signUp).toHaveBeenCalledWith({ email: 'learner@example.com', password: 'securepass8' });
});
