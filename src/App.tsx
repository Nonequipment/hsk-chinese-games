import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { SignInSheet } from './features/auth/sign-in-sheet';
import { StrokeOrderDialog } from './features/stroke-order-dialog';
import { AuthProvider } from './lib/auth/auth-provider';
import { getSetItems, normalizeSetId, type Curriculum, type VocabularyItem, type VocabularySet } from './lib/curriculum';

function LearningRoute() {
  const { setId } = useParams();
  const [showPinyin, setShowPinyin] = useState(true);
  const [strokeOpen, setStrokeOpen] = useState(false);
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
  return <main className="study-page"><div className="study-heading"><Link to="/library">← คลังคำศัพท์</Link><span>SET {session.set.id.slice(1)} · {session.set.category}</span></div><section className="flashcard"><header><span>คำที่ {index + 1} จาก {session.items.length}</span><button className="sound-button" aria-label="ฟังเสียงคำศัพท์" onClick={speak}>🔊</button></header><div className="card-progress"><i style={{ width: `${((index + 1) / session.items.length) * 100}%` }} /></div><p className="hanzi" lang="zh-CN">{item.hanzi}</p><div className="word-meta">{showPinyin ? <strong>{item.pinyin}</strong> : <em>พินอินถูกซ่อนอยู่</em>}<span>{item.thai}</span></div><div className="flashcard-actions"><button onClick={speak}>🔊 ฟังคำอ่าน</button><button onClick={() => setShowPinyin((visible) => !visible)}>{showPinyin ? '◉ ซ่อนพินอิน' : '◌ แสดงพินอิน'}</button></div><button className="stroke-note" onClick={() => setStrokeOpen(true)}><b>笔</b><span><strong>ดูลำดับขีด</strong><small>กดเพื่อดูภาพเคลื่อนไหวทีละขีด</small></span><i>→</i></button><div className="card-controls"><button className="previous" aria-label="คำก่อนหน้า" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}>← ก่อนหน้า</button><button className="next" aria-label="คำถัดไป" disabled={index === session.items.length - 1} onClick={() => setIndex((current) => current + 1)}>ถัดไป →</button><button className="primary" onClick={remember}>✓ จำคำนี้แล้ว</button></div></section><StrokeOrderDialog word={item.hanzi} open={strokeOpen} onClose={() => setStrokeOpen(false)} /></main>;
}

function HomeRoute() {
  const [signInOpen, setSignInOpen] = useState(false);
  const completed = new Set<string>(JSON.parse(localStorage.getItem('hsk-mission-studied') ?? '[]')).size;
  return <main className="dashboard"><section className="mission-card"><div className="brand"><b>学</b><span>HSK MISSION</span><small>เป้าหมาย 17 ต.ค.</small></div><p className="eyebrow">ADAPTIVE MISSION CONTROL</p><h1>เรียนจีนทุกวัน<br /><i>ไปให้ถึง HSK 4.0</i></h1><p>1,200 คำ · 60 เซ็ต · เรียนสั้น กระชับ และจำได้จริง</p><div className="hero-actions"><Link to="/learn/S01">เริ่ม Set แรก →</Link><button onClick={() => setSignInOpen(true)}>เข้าสู่ระบบ</button></div><em className="hero-hanzi">汉</em></section><section className="stats"><div><b>{completed}</b><span>เซ็ตที่เรียน</span></div><div><b>{completed * 20}</b><span>คำที่จำแล้ว</span></div><div><b>{60 - completed}</b><span>เซ็ตที่เหลือ</span></div></section><div className="section-title"><span><p className="eyebrow">TODAY’S MISSION</p><h2>ภารกิจวันนี้</h2></span><b>DAY 1</b></div><section className="today-card"><i>⚡</i><span><strong>เริ่มด้วยคำศัพท์ 20 คำ</strong><p>คน สรรพนาม และครอบครัว</p><small>Set 01 · 20 คำ</small></span><Link to="/learn/S01" aria-label="เริ่มเรียน Set 1">→</Link></section><section className="steps"><div><b>01</b><span><strong>เรียนบัตรคำ</strong><small>คำจีน พินอิน คำแปล และเสียง</small></span></div><div><b>02</b><span><strong>ฝึกความจำ</strong><small>ทบทวนจนจำได้อย่างมั่นใจ</small></span></div><div><b>03</b><span><strong>สอบผ่าน 100%</strong><small>ปลดล็อกชุดถัดไปเมื่อพร้อม</small></span></div></section><SignInSheet open={signInOpen} /></main>;
}

function LibraryRoute() {
  const [data, setData] = useState<Curriculum | null>(null);
  const [query, setQuery] = useState('');
  useEffect(() => { let active = true; void import('../data/curriculum.json').then(({ default: loaded }) => { if (active) setData(loaded); }); return () => { active = false; }; }, []);
  const q = query.trim().toLocaleLowerCase();
  const matches = data?.items.filter((item) => [item.hanzi, item.pinyin, item.thai, item.category].join(' ').toLocaleLowerCase().includes(q)) ?? [];
  const sets = data?.sets.filter((set) => !q || set.itemIds.some((id) => matches.some((item) => item.id === id))) ?? [];
  const done = new Set<string>(JSON.parse(localStorage.getItem('hsk-mission-studied') ?? '[]'));
  return <main className="library-page"><header><p className="eyebrow">VOCABULARY VAULT</p><h1>คลังคำศัพท์</h1><p>HSK 4.0 · 1,200 คำ แบ่งเป็น 60 เซ็ต</p><label className="search">⌕<input aria-label="ค้นหาคำศัพท์" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาจีน · พินอิน · ไทย" /></label></header>{q && <section className="search-results"><p>พบ {matches.length} คำสำหรับ “{query}”</p><div>{matches.slice(0, 12).map((item) => <Link to={`/learn/${item.setId}`} key={item.id}><b lang="zh-CN">{item.hanzi}</b><span>{item.pinyin}</span><small>{item.thai}</small></Link>)}</div></section>}<div className="library-count"><b>{sets.length} เซ็ต</b><span>{done.size * 20} / 1,200 คำที่เรียนแล้ว</span></div><div className="set-grid">{sets.map((set) => <Link key={set.id} to={`/learn/${set.id}`} className={`set-card ${done.has(set.id) ? 'done' : ''}`}><header><b>SET {set.id.slice(1)}</b>{done.has(set.id) && <small>✓ ผ่านแล้ว</small>}</header><strong>{set.category}</strong><footer><span>{set.itemIds.length} คำ</span><span>เริ่มเรียน →</span></footer></Link>)}</div></main>;
}

export function App() {
  return <AuthProvider><div className="app-shell">
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/learn/:setId" element={<LearningRoute />} />
      <Route path="/library" element={<LibraryRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <nav aria-label="เมนูหลัก"><Link to="/"><b>◈</b>ภารกิจ</Link><Link to="/learn/S01"><b>▣</b>เรียน</Link><Link to="/library"><b>⌕</b>คลังคำศัพท์</Link><button><b>◉</b>ฉัน</button></nav>
  </div></AuthProvider>;
}
