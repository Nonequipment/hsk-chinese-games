import { useEffect, useMemo, useState } from 'react';
import { speakMandarin } from '../lib/audio';
import type { Curriculum, VocabularyItem } from '../lib/curriculum';

type ReviewStatus = 'known' | 'review';
const storageKey = 'hsk-mission-self-assessment';

function readStatuses(): Record<string, ReviewStatus> {
  try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Record<string, ReviewStatus>; } catch { return {}; }
}

export function SelfAssessment() {
  const [data, setData] = useState<Curriculum | null>(null);
  const [setId, setSetId] = useState('S01');
  const [query, setQuery] = useState('');
  const [randomized, setRandomized] = useState(false);
  const [autoSound, setAutoSound] = useState(() => localStorage.getItem('hsk-mission-auto-sound') !== 'off');
  const [statuses, setStatuses] = useState<Record<string, ReviewStatus>>(readStatuses);

  useEffect(() => { void import('../../data/curriculum.json').then(({ default: loaded }) => setData(loaded)); }, []);
  const items = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    const filtered = data.items.filter((item) => (setId === 'all' || item.setId === setId) && (!needle || `${item.hanzi} ${item.pinyin} ${item.thai}`.toLowerCase().includes(needle)));
    return randomized ? [...filtered].sort(() => Math.random() - 0.5) : filtered;
  }, [data, setId, query, randomized]);
  const known = items.filter((item) => statuses[item.id] === 'known').length;
  const review = items.filter((item) => statuses[item.id] === 'review').length;
  const toggleAutoSound = () => setAutoSound((on) => { localStorage.setItem('hsk-mission-auto-sound', on ? 'off' : 'on'); return !on; });
  const advanceStatus = (item: VocabularyItem) => setStatuses((current) => {
    const nextStatus: ReviewStatus = current[item.id] === 'known' ? 'review' : 'known';
    const next = { ...current, [item.id]: nextStatus };
    localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
  });
  const clearAssessment = () => setStatuses((current) => {
    const next = { ...current };
    for (const item of data?.items ?? []) if (setId === 'all' || item.setId === setId) delete next[item.id];
    localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
  });
  const play = (item: VocabularyItem) => { if (autoSound) speakMandarin(item.hanzi); };

  if (!data) return <main><h1>กำลังเปิดด่านประเมิน…</h1></main>;
  const percentage = items.length ? Math.round((known / items.length) * 100) : 0;
  return <main className="self-assessment"><p className="eyebrow">SELF CHECK</p><h1>ด่านประเมินตน</h1><p>แตะคำจีนครั้งแรกเป็นสีเขียว “จำได้” แตะครั้งที่สองเป็นสีแดง “จำไม่ได้”</p><section className="assessment-filter"><label>ค้นหาในคลังคำศัพท์<input type="search" role="searchbox" aria-label="ค้นหาคำศัพท์" placeholder="จีน, พินอิน, ไทย หรืออังกฤษ" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>เลือกเซ็ต<select value={setId} onChange={(event) => setSetId(event.target.value)}><option value="all">ทุกเซ็ต · 1,200 คำ</option>{data.sets.map((set) => <option key={set.id} value={set.id}>{set.id} · {set.category}</option>)}</select></label><button className="auto-sound-toggle" aria-label={autoSound ? 'ปิดเสียงอัตโนมัติ' : 'เปิดเสียงอัตโนมัติ'} onClick={toggleAutoSound}>{autoSound ? '🔊 เสียงอัตโนมัติ' : '🔇 ปิดเสียงอัตโนมัติ'}</button></section><section className="assessment-summary"><div className="assessment-ring"><b>{percentage}%</b></div><div><strong>{known} จำได้</strong><i style={{ width: `${percentage}%` }} /><p><span>● จำได้ {known}</span><span>● จำไม่ได้ {review}</span><span>● รอเช็ก {Math.max(0, items.length - known - review)}</span></p></div><small>จาก {items.length} คำ</small></section><div className="assessment-actions"><button onClick={() => setRandomized(false)}>เรียงปกติ</button><button className="assessment-clear" aria-label={setId === 'all' ? 'ล้างผลทั้งหมด' : 'ล้างผลชุดนี้'} onClick={clearAssessment}>ล้าง</button><button onClick={() => setRandomized((value) => !value)}>สุ่มคำ</button></div><AssessmentCards items={items} statuses={statuses} onPlay={play} onAdvance={advanceStatus} /></main>;
}

function AssessmentCards({ items, statuses, onPlay, onAdvance }: { items: VocabularyItem[]; statuses: Record<string, ReviewStatus>; onPlay: (item: VocabularyItem) => void; onAdvance: (item: VocabularyItem) => void }) {
  return <section className="assessment-grid" aria-label="รายการคำศัพท์ประเมินตน">{items.map((item) => {
    const status = statuses[item.id];
    return <button key={item.id} className={`assessment-word ${status ?? ''}`} lang="zh-CN" aria-label={`ประเมินคำศัพท์ ${item.hanzi}`} data-status={status ?? 'pending'} onClick={() => { onPlay(item); onAdvance(item); }}><b>{item.hanzi}</b>{status && <span className="assessment-detail"><small>{item.pinyin}</small><small>{item.thai}</small></span>}</button>;
  })}</section>;
}
