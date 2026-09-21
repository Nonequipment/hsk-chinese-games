import { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-provider';

export function SignInSheet({ open }: { open: boolean }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  if (!open) return null;
  const run = (action: () => Promise<void>) => void action().catch((error: Error) => setMessage(error.message));
  return <section aria-label="เข้าสู่ระบบ"><label>อีเมล<input aria-label="อีเมล" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>รหัสผ่าน<input aria-label="รหัสผ่าน" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button onClick={() => run(() => signIn(email, password))}>เข้าสู่ระบบ</button><button onClick={() => run(() => signUp(email, password))}>สมัครสมาชิก</button>{message && <p role="alert">{message}</p>}</section>;
}
