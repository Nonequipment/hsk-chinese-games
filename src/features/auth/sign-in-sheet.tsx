import { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-provider';

export function SignInSheet({ open }: { open: boolean }) {
  const { sendOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  if (!open) return null;
  return <section aria-label="เข้าสู่ระบบ"><label>อีเมล<input aria-label="อีเมล" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{sent ? <><label>รหัส 6 หลัก<input aria-label="รหัส 6 หลัก" inputMode="numeric" value={token} onChange={(event) => setToken(event.target.value)} /></label><button onClick={() => void verifyOtp(email, token).catch((error: Error) => setMessage(error.message))}>ยืนยัน</button></> : <button onClick={() => void sendOtp(email).then(() => setSent(true)).catch((error: Error) => setMessage(error.message))}>ส่งรหัส</button>}{message && <p role="alert">{message}</p>}</section>;
}
