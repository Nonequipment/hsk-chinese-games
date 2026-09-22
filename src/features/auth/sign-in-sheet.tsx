import { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-provider';

export function SignInSheet({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  if (!open) return null;
  const run = (action: () => Promise<void>) => void action().catch((error: Error) => setMessage(error.message));
  return <section className="sign-in-overlay" aria-label="เข้าสู่ระบบ">
    <div className="sign-in-sheet" role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
      <button className="sign-in-close" aria-label="ปิดหน้าต่างเข้าสู่ระบบ" onClick={onClose}>×</button>
      <div className="sign-in-mark" aria-hidden="true">学</div>
      <p className="eyebrow">YOUR LEARNING SPACE</p>
      <h2 id="sign-in-title">กลับมาเรียนกันต่อ</h2>
      <p className="sign-in-intro">เข้าสู่ระบบเพื่อบันทึกความก้าวหน้าของคุณ</p>
      <form onSubmit={(event) => { event.preventDefault(); run(() => signIn(email, password)); }}>
        <label>อีเมล<input aria-label="อีเมล" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>รหัสผ่าน<input aria-label="รหัสผ่าน" type="password" autoComplete="current-password" placeholder="อย่างน้อย 8 ตัวอักษร" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button className="sign-in-submit" type="submit">เข้าสู่ระบบ <span>→</span></button>
      </form>
      <div className="sign-in-divider"><span>ยังไม่มีบัญชี?</span></div>
      <button className="sign-up-button" type="button" onClick={() => run(() => signUp(email, password))}>สร้างบัญชีใหม่ฟรี</button>
      {message && <p className="sign-in-message" role="alert">{message}</p>}
      <small className="sign-in-note">ความก้าวหน้าของคุณจะซิงก์ได้ทุกอุปกรณ์</small>
    </div>
  </section>;
}
