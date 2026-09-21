import { useEffect, useState } from 'react';
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

function LibraryRoute() {
  const [sets, setSets] = useState<Array<{ id: string; number: number; category: string; itemIds: string[] }>>([]);
  useEffect(() => { void import('../data/curriculum.json').then(({ default: data }) => setSets(data.sets)); }, []);
  return <main><h1>คลังคำศัพท์</h1><p>60 เซ็ต · 1,200 คำ</p><div className="set-grid">{sets.map((set) => <Link key={set.id} to={`/learn/${set.id}`} className="set-card"><strong>Set {set.number}</strong><span>{set.category}</span><small>{set.itemIds.length} คำ</small></Link>)}</div></main>;
}

export function App() {
  return <AuthProvider><>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/learn/:setId" element={<LearningRoute />} />
      <Route path="/library" element={<LibraryRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <nav aria-label="เมนูหลัก"><Link to="/">ภารกิจ</Link><Link to="/learn/set-01">เรียน</Link><Link to="/library">คลังคำศัพท์</Link><button>ฉัน</button></nav>
  </></AuthProvider>;
}
