import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/src/lib/auth/auth-provider';
import { SignInSheet } from '@/src/features/auth/sign-in-sheet';

it('sends an OTP and verifies six digits', async () => {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn(),
  };
  const user = userEvent.setup();
  render(<AuthProvider client={{ auth } as never}><SignInSheet open /></AuthProvider>);
  await user.type(screen.getByLabelText(/อีเมล/i), 'learner@example.com');
  await user.click(screen.getByRole('button', { name: /ส่งรหัส/i }));
  await user.type(await screen.findByLabelText(/รหัส 6 หลัก/i), '123456');
  await user.click(screen.getByRole('button', { name: /ยืนยัน/i }));
  expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'learner@example.com', token: '123456', type: 'email' });
});
