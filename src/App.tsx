import { useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { SignInSheet } from './features/auth/sign-in-sheet';
import { AuthProvider } from './lib/auth/auth-provider';

function LearningRoute() {
  const { setId } = useParams();
  const setNumber = Number(setId?.replace('set-', '')) || 1;
  return <main><h1>เรียน Set {setNumber}</h1></main>;
}

function HomeRoute() {
  const [signInOpen, setSignInOpen] = useState(false);
  return <main><section className="mission-card"><p>ภารกิจวันนี้</p><h1>HSK Mission</h1><p>เริ่มจำคำศัพท์จีนอย่างเป็นระบบ</p><Link to="/learn/set-01">เรียน Set แรก</Link><button onClick={() => setSignInOpen(true)}>เข้าสู่ระบบ</button></section><SignInSheet open={signInOpen} /></main>;
}

export function App() {
  return <AuthProvider><>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/learn/:setId" element={<LearningRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <nav aria-label="เมนูหลัก"><Link to="/">ภารกิจ</Link><Link to="/learn/set-01">เรียน</Link><Link to="/library">คลังคำศัพท์</Link><button>ฉัน</button></nav>
  </></AuthProvider>;
}
