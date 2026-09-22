import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { canOpenExam, readRemembered } from '../lib/study-progress';
import { type Curriculum } from '../lib/curriculum';

export function ModeHub({ kind }: { kind: 'games' | 'exams' }) {
  const [data, setData] = useState<Curriculum | null>(null);
  const [selected, setSelected] = useState(['S01']);
  const [pendingSet, setPendingSet] = useState('S02');
  useEffect(() => { void import('../../data/curriculum.json').then(({ default: loaded }) => setData(loaded)); }, []);
  if (!data) return <main><h1>กำลังเปิด…</h1></main>;
  const remembered = readRemembered();
  const selectedSets = data.sets.filter((set) => selected.includes(set.id));
  const addSet = () => {
    if (!selected.includes(pendingSet)) setSelected((current) => [...current, pendingSet]);
    const next = data.sets.find((set) => !selected.includes(set.id) && set.id !== pendingSet);
    if (next) setPendingSet(next.id);
  };
  const removeSet = (id: string) => setSelected((current) => current.filter((value) => value !== id));
  if (kind === 'exams') return <main className="mode-hub"><p className="eyebrow">MASTERY EXAMS</p><h1>เลือกชุดข้อสอบ</h1><p>เลือกหมวดคำศัพท์ที่เรียนครบแล้วเพื่อเข้าสอบ</p><div className="set-grid">{data.sets.map((set) => <Link key={set.id} to={`/exam/${set.id}`} className="set-card"><header><b>SET {set.id.slice(1)}</b><small>{canOpenExam(remembered, set.itemIds) ? '✓ พร้อมสอบ' : 'เรียนก่อน'}</small></header><strong>{set.category}</strong><footer><span>{set.itemIds.length} คำ</span><span>เปิดข้อสอบ →</span></footer></Link>)}</div></main>;
  return <main className="mode-hub game-picker"><p className="eyebrow">GAME LIBRARY</p><h1>เลือกคำศัพท์สำหรับเกม</h1><p>เริ่มด้วย Set 01 แล้วเพิ่มเซ็ตที่ต้องการได้จากรายการเดียว</p><section className="selected-sets"><header><div><b>ชุดที่เลือก</b><small>{selected.length} เซ็ต · {selectedSets.reduce((total, set) => total + set.itemIds.length, 0)} คำ</small></div><button onClick={() => setSelected(['S01'])}>เริ่มเลือกใหม่</button></header><div className="selected-set-chips">{selectedSets.length ? selectedSets.map((set) => <button key={set.id} className="selected-set-chip" onClick={() => removeSet(set.id)} aria-label={`ลบ ${set.id}`}><b>{set.id}</b><span>{set.category}</span><i>×</i></button>) : <p className="no-selected-sets">ยังไม่เลือกเซ็ต · เลือกจากรายการด้านล่าง</p>}</div><div className="add-set-row"><label>เพิ่มชุดคำศัพท์<select aria-label="เพิ่มเซ็ตในเกม" value={pendingSet} onChange={(event) => setPendingSet(event.target.value)}>{data.sets.map((set) => <option key={set.id} value={set.id} disabled={selected.includes(set.id)}>{set.id} · {set.category}</option>)}</select></label><button aria-label={`เพิ่ม ${pendingSet.replace('S', 'SET ')}`} onClick={addSet} disabled={selected.includes(pendingSet)}>+ เพิ่มเซ็ต</button></div>{selected.length ? <Link className="play-selected" to={`/practice/${selected.join('+')}`}>เริ่มเล่น {selected.length} เซ็ตที่เลือก <span>→</span></Link> : <button className="play-selected" disabled>เลือกอย่างน้อย 1 เซ็ตเพื่อเริ่มเกม</button>}</section><section className="quick-game-sets"><h2>เลือกด่วน</h2><p>แตะเพื่อแทนชุดที่เลือกด้วยเซ็ตเดียว</p><div>{data.sets.slice(0, 6).map((set) => <button key={set.id} onClick={() => { setSelected([set.id]); setPendingSet(set.id === 'S01' ? 'S02' : 'S01'); }}><b>{set.id}</b><span>{set.category}</span></button>)}</div></section></main>;
}
