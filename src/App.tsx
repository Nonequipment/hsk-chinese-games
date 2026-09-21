import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { SignInSheet } from './features/auth/sign-in-sheet';
import { AuthProvider } from './lib/auth/auth-provider';
import { getSetItems, normalizeSetId, type VocabularyItem, type VocabularySet } from './lib/curriculum';

function LearningRoute() {
  const { setId } = useParams();
  const [showPinyin, setShowPinyin] = useState(true);
  const [session, setSession] = useState<{ set: VocabularySet; items: VocabularyItem[] } | null>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let active = true;
    setIndex(0);
    void import('../data/curriculum.json').then(({ default: data }) => {
      const resolved = getSetItems(data, setId);
      if (active) setSession(resolved);
    });
    return () => { active = false; };
  }, [setId]);
  const item = session?.items[index];
  const remember = () => {
    const canonical = normalizeSetId(setId) ?? setId ?? 'S01';
    const completed = JSON.parse(localStorage.getItem('hsk-mission-studied') ?? '[]') as string[];
    localStorage.setItem('hsk-mission-studied', JSON.stringify([...new Set([...completed, canonical])]));
  };
  const speak = () => { if (item && 'speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(item.hanzi)); };
  if (session === null) return <main><h1>กำลังเปิดบทเรียน…</h1><p>กำลังเตรียมคำศัพท์ให้คุณ</p></main>;
  if (!item) return <main><h1>ไม่พบชุดคำศัพท์</h1><p>ลิงก์นี้อาจไม่ถูกต้อง กรุณาเลือกจากคลังคำศัพท์</p><Link to="/library">ไปที่คลังคำศัพท์</Link></main>;
  return <main><div className="study-heading"><Link to="/library">‹ คลังคำศัพท์</Link><span>Set {session.set.number} · {session.set.category}</span></div><section className="flashcard"><header><span>คำที่ {index + 1} / {session.items.length}</span><div className="card-progress"><i style={{ width: `${((index + 1) / session.items.length) * 100}%` }} /></div></header><p lang="zh-CN">{item.hanzi}</p>{showPinyin && <strong>{item.pinyin}</strong>}<span>{item.thai}</span><div className="flashcard-actions"><button onClick={speak}>🔊 ฟังเสียง</button><button onClick={() => setShowPinyin((visible) => !visible)}>{showPinyin ? 'ซ่อนพินอิน' : 'แสดงพินอิน'}</button></div><div className="card-controls"><button aria-label="คำก่อนหน้า" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}>← ก่อนหน้า</button><button className="primary" onClick={remember}>✓ จำคำนี้แล้ว</button><button aria-label="คำถัดไป" disabled={index === session.items.length - 1} onClick={() => setIndex((current) => current + 1)}>ถัดไป →</button></div></section></main>;
}

function HomeRoute() {
  const [signInOpen, setSignInOpen] = useState(false);
  return <main><section className="mission-card"><p>ภารกิจวันนี้</p><h1>HSK Mission</h1><p>เริ่มจำคำศัพท์จีนอย่างเป็นระบบ</p><Link to="/learn/set-01">เรียน Set แรก</Link><button onClick={() => setSignInOpen(true)}>เข้าสู่ระบบ</button></section><SignInSheet open={signInOpen} /></main>;
}

function LibraryRoute() {
  const [sets, setSets] = useState<Array<{ id: string; number: number; category: string; itemIds: string[] }>>([]);
  useEffect(() => { let active = true; void import('../data/curriculum.json').then(({ default: data }) => { if (active) setSets(data.sets); }); return () => { active = false; }; }, []);
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
