import { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-provider';

export function SignInSheet({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const { signIn, signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  if (!open) return null;
  const run = async (action: () => Promise<void>) => {
    setMessage('');
    try { await action(); onClose?.(); } catch (error) { setMessage((error as Error).message); }
  };
  return <section className="sign-in-overlay" aria-label="เข้าสู่ระบบ">
    <div className="sign-in-sheet" role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
      <button className="sign-in-close" aria-label="ปิดหน้าต่างเข้าสู่ระบบ" onClick={onClose}>×</button>
      <div className="sign-in-mark" aria-hidden="true">学</div>
      <p className="eyebrow">YOUR LEARNING SPACE</p>
      <h2 id="sign-in-title">{mode === 'sign-in' ? 'กลับมาเรียนกันต่อ' : 'สร้างบัญชีใหม่'}</h2>
      <p className="sign-in-intro">{mode === 'sign-in' ? 'ใช้ชื่อผู้ใช้และรหัสผ่านของคุณ' : 'ตั้งชื่อผู้ใช้และรหัสผ่านเพื่อเริ่มเรียน'}</p>
      <form onSubmit={(event) => { event.preventDefault(); void run(() => mode === 'sign-in' ? signIn(username, password) : signUp(username, password)); }}>
        <label>ชื่อผู้ใช้<input aria-label="ชื่อผู้ใช้" type="text" autoComplete="username" placeholder="เช่น china_lover" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label>รหัสผ่าน<input aria-label="รหัสผ่าน" type="password" autoComplete="current-password" placeholder="อย่างน้อย 8 ตัวอักษร" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button className="sign-in-submit" type="submit">{mode === 'sign-in' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'} <span>→</span></button>
      </form>
      <div className="sign-in-divider"><span>{mode === 'sign-in' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}</span></div>
      <button className="sign-up-button" type="button" onClick={() => { setMessage(''); setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); }}>{mode === 'sign-in' ? 'สมัครด้วยชื่อผู้ใช้และรหัสผ่าน' : 'กลับไปเข้าสู่ระบบ'}</button>
      {message && <p className="sign-in-message" role="alert">{message}</p>}
      <small className="sign-in-note">ความก้าวหน้าของคุณจะซิงก์ได้ทุกอุปกรณ์</small>
    </div>
  </section>;
}
