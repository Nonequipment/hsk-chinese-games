import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { SignInSheet } from './features/auth/sign-in-sheet';
import { StrokeOrderInline } from './features/stroke-order-inline';
import { PracticeRoute } from './features/practice-route';
import { ExamRoute } from './features/exam-route';
import { ModeHub } from './features/mode-hub';
import { SelfAssessment } from './features/self-assessment';
import { speakMandarin } from './lib/audio';
import { canOpenExam, markItemRemembered, readCompletedSets, readRemembered, getDailySetPlan } from './lib/study-progress';
import { AuthProvider, useAuth } from './lib/auth/auth-provider';
import { getSetItems, normalizeSetId, type Curriculum, type VocabularyItem, type VocabularySet } from './lib/curriculum';

function LearningRoute() {
  const { setId } = useParams();
  const [showPinyin, setShowPinyin] = useState(true);
  const [autoSound, setAutoSound] = useState(() => localStorage.getItem('hsk-mission-auto-sound') !== 'off');
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
  const move = (direction: number) => setIndex((current) => Math.max(0, Math.min((session?.items.length ?? 1) - 1, current + direction)));
  const remember = () => { if (!item) return; const remembered = markItemRemembered(readRemembered(), item.id); localStorage.setItem('hsk-mission-remembered', JSON.stringify(remembered)); move(1); };
  const forget = () => move(1);
  const speak = () => { if (item) speakMandarin(item.hanzi); };
  useEffect(() => { if (autoSound && item) speakMandarin(item.hanzi); }, [item?.id, autoSound]);
  const toggleAutoSound = () => setAutoSound((enabled) => { localStorage.setItem('hsk-mission-auto-sound', enabled ? 'off' : 'on'); return !enabled; });
  if (session === null) return <main><h1>กำลังเปิดบทเรียน…</h1><p>กำลังเตรียมคำศัพท์ให้คุณ</p></main>;
  if (!item) return <main><h1>ไม่พบชุดคำศัพท์</h1><p>ลิงก์นี้อาจไม่ถูกต้อง กรุณาเลือกจากคลังคำศัพท์</p><Link to="/library">ไปที่คลังคำศัพท์</Link></main>;
  const previousSet = session.set.number > 1 ? `S${String(session.set.number - 1).padStart(2, '0')}` : null;
  const completedSets = readCompletedSets();
  if (previousSet && !completedSets.includes(previousSet)) return <main className="activity-page"><h1>ชุดนี้ยังล็อกอยู่</h1><p>เรียนและจำคำศัพท์ชุดก่อนหน้าให้ครบ 20 คำก่อน</p><Link className="back-link" to={`/learn/${previousSet}`}>ไปเรียน Set ก่อนหน้า</Link></main>;
  return <main className="study-page"><div className="study-heading"><Link to="/library">← คลังคำศัพท์</Link><span>SET {session.set.id.slice(1)} · {session.set.category}</span></div><section className="flashcard"><header><span>คำที่ {index + 1} จาก {session.items.length}</span></header><div className="card-progress"><i style={{ width: `${((index + 1) / session.items.length) * 100}%` }} /></div><p className="hanzi" lang="zh-CN">{item.hanzi}</p><div className="word-meta">{showPinyin ? <strong>{item.pinyin}</strong> : <em>พินอินถูกซ่อนอยู่</em>}<span>{item.thai}</span><button className="replay-audio" aria-label="ฟังคำอ่านซ้ำ" onClick={speak}>🔊 ฟังคำอ่านซ้ำ</button></div><div className="flashcard-actions card-settings"><button aria-label={autoSound ? 'ปิดเสียงอัตโนมัติ' : 'เปิดเสียงอัตโนมัติ'} onClick={toggleAutoSound}>{autoSound ? '🔊 เสียงอัตโนมัติ' : '🔇 ปิดเสียงอัตโนมัติ'}</button><button aria-label={showPinyin ? 'ซ่อนพินอิน' : 'แสดงพินอิน'} onClick={() => setShowPinyin((visible) => !visible)}>{showPinyin ? '◉ ซ่อนพินอิน' : '◌ แสดงพินอิน'}</button></div><StrokeOrderInline word={item.hanzi} /><div className="card-controls"><button className="previous" aria-label="คำก่อนหน้า" disabled={index === 0} onClick={() => move(-1)}><b>←</b><span>ก่อนหน้า</span></button><button className="next" aria-label="คำถัดไป" disabled={index === session.items.length - 1} onClick={() => move(1)}><span>ถัดไป</span><b>→</b></button><button className="forgot" aria-label="จำไม่ได้" onClick={forget}>↺ จำไม่ได้</button><button className="primary" aria-label="จำคำนี้แล้ว" onClick={remember}>✓ จำได้แล้ว</button></div></section></main>;
}

function HomeRoute() {
  const [signInOpen, setSignInOpen] = useState(false);
  const { username } = useAuth();
  const completed = new Set<string>(readCompletedSets()).size;
  const plan = getDailySetPlan({ completedSets: completed, totalSets: 60, targetDate: '2026-10-17' });
  return <main className="dashboard"><section className="mission-card"><div className="brand"><b>学</b><span>HSK MISSION</span><small>เป้าหมาย 17 ต.ค.</small></div><p className="eyebrow">ADAPTIVE MISSION CONTROL</p><h1>เรียนจีนทุกวัน<br /><i>ไปให้ถึง HSK 4.0</i></h1><p>1,200 คำ · 60 เซ็ต · เรียนสั้น กระชับ และจำได้จริง</p><div className="hero-actions"><Link to="/library">เลือกชุดเรียน →</Link>{username ? <button className="profile-button" aria-label={`โปรไฟล์ ${username}`}>◉ {username}</button> : <button onClick={() => setSignInOpen(true)}>เข้าสู่ระบบ</button>}</div><em className="hero-hanzi">汉</em></section><section className="stats"><div><b>{completed}</b><span>เซ็ตที่สอบผ่าน</span></div><div><b>{completed * 20}</b><span>คำที่จำได้แล้ว</span></div><div><b>{plan.remainingSets}</b><span>เซ็ตที่เหลือ</span></div></section><div className="section-title"><span><p className="eyebrow">STUDY CALENDAR</p><h2>แผนของคุณ</h2></span><b>เหลือ {plan.remainingDays} วัน</b></div><section className="plan-calendar" aria-label="ปฏิทินแผนการเรียน"><div><small>วันเป้าหมาย</small><strong>17 ต.ค. 2026</strong></div><div><small>เหลือเวลา</small><strong>{plan.remainingDays} วัน</strong></div><div><small>ต้องทำทุกวัน</small><strong>{plan.setsPerDay} เซ็ต</strong><span>{plan.wordsPerDay} คำ</span></div></section><section className="today-card"><i>⚡</i><span><strong>วันนี้เรียน {plan.setsPerDay} เซ็ต · {plan.wordsPerDay} คำ</strong><p>เหลือ {plan.remainingSets} เซ็ต เพื่อทันเป้าหมาย 17 ต.ค.</p><small>ต้องสอบผ่าน 100% จึงนับเป็นคำที่จำได้และความคืบหน้า</small></span><Link to="/library" aria-label="เลือกชุดเรียนตามแผน">→</Link></section><section className="steps"><div><b>01</b><span><strong>เรียนบัตรคำ</strong><small>เรียนคำศัพท์ในคลังให้ครบ 20 คำ</small></span></div><div><b>02</b><span><strong>พร้อมสอบ</strong><small>เมื่อจำครบจึงเปิดข้อสอบของเซ็ตนั้นได้</small></span></div><div><b>03</b><span><strong>สอบผ่าน 100%</strong><small>ผ่านแล้วจึงเก็บเป็นคำที่จำได้ในแผน</small></span></div></section><SignInSheet open={signInOpen} onClose={() => setSignInOpen(false)} /></main>;
}

function LibraryRoute() {
  const [data, setData] = useState<Curriculum | null>(null);
  const [query, setQuery] = useState('');
  useEffect(() => { let active = true; void import('../data/curriculum.json').then(({ default: loaded }) => { if (active) setData(loaded); }); return () => { active = false; }; }, []);
  const q = query.trim().toLocaleLowerCase();
  const matches = data?.items.filter((item) => [item.hanzi, item.pinyin, item.thai, item.category].join(' ').toLocaleLowerCase().includes(q)) ?? [];
  const sets = data?.sets.filter((set) => !q || set.itemIds.some((id) => matches.some((item) => item.id === id))) ?? [];
  const done = new Set<string>(readCompletedSets()); const remembered = readRemembered();
  return <main className="library-page"><header><p className="eyebrow">VOCABULARY VAULT</p><h1>คลังคำศัพท์</h1><p>HSK 4.0 · 1,200 คำ แบ่งเป็น 60 เซ็ต</p><label className="search">⌕<input aria-label="ค้นหาคำศัพท์" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาจีน · พินอิน · ไทย" /></label></header>{q && <section className="search-results"><p>พบ {matches.length} คำสำหรับ “{query}”</p><div>{matches.slice(0, 12).map((item) => <Link to={`/learn/${item.setId}`} key={item.id}><b lang="zh-CN">{item.hanzi}</b><span>{item.pinyin}</span><small>{item.thai}</small></Link>)}</div></section>}<div className="library-count"><b>{sets.length} เซ็ต</b><span>{done.size * 20} / 1,200 คำที่จำได้แล้ว</span></div><div className="set-grid">{sets.map((set) => { const passed = done.has(set.id); const learned = canOpenExam(remembered, set.itemIds); return <Link key={set.id} to={`/learn/${set.id}`} className={`set-card ${passed ? 'done' : learned ? 'ready-for-exam' : ''}`}><header><b>SET {set.id.slice(1)}</b>{passed ? <small>✓ สอบผ่าน</small> : learned ? <small className="ready-label">เรียนไปแล้ว · พร้อมสอบ</small> : <small className="pending-label">ยังไม่ได้เรียน</small>}</header><strong>{set.category}</strong><footer><span>{set.itemIds.length} คำ</span><span>{passed ? 'จำได้แล้ว ✓' : learned ? 'ไปสอบ →' : 'เริ่มเรียน →'}</span></footer></Link>; })}</div></main>;
}

export function App() {
  return <AuthProvider><div className="app-shell">
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/learn/:setId" element={<LearningRoute />} />
      <Route path="/library" element={<LibraryRoute />} />
      <Route path="/games" element={<ModeHub kind="games" />} />
      <Route path="/exams" element={<ModeHub kind="exams" />} />
      <Route path="/self-check" element={<SelfAssessment />} />
      <Route path="/practice/:setId" element={<PracticeRoute />} />
      <Route path="/exam/:setId" element={<ExamRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <nav aria-label="เมนูหลัก"><Link to="/"><b>◈</b>ภารกิจ</Link><Link to="/library"><b>▣</b>เรียน</Link><Link to="/games"><b>⚡</b>เกม</Link><Link to="/exams"><b>✦</b>สอบ</Link><Link to="/self-check"><b>◎</b>ประเมิน</Link></nav>
  </div></AuthProvider>;
}


