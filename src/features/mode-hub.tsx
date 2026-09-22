import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { canOpenExam, readRemembered } from '../lib/study-progress';
import { type Curriculum } from '../lib/curriculum';

type Props = { kind: 'games' | 'exams' };
export function ModeHub({ kind }: Props) {
  const [data, setData] = useState<Curriculum | null>(null);
  useEffect(() => { void import('../../data/curriculum.json').then(({ default: loaded }) => setData(loaded)); }, []);
  if (!data) return <main><h1>กำลังเปิด…</h1></main>;
  const remembered = readRemembered();
  return <main className="mode-hub"><p className="eyebrow">{kind === 'games' ? 'GAME LIBRARY' : 'MASTERY EXAMS'}</p><h1>{kind === 'games' ? 'เกมทบทวน' : 'เลือกชุดข้อสอบ'}</h1><p>เลือกหมวดคำศัพท์ที่ต้องการทบทวนได้ทันที</p><div className="set-grid">{data.sets.map((set) => <Link key={set.id} to={`/${kind === 'games' ? 'practice' : 'exam'}/${set.id}`} className="set-card"><header><b>SET {set.id.slice(1)}</b>{kind === 'exams' && <small>{canOpenExam(remembered, set.itemIds) ? '✓ พร้อมสอบ' : 'เรียนก่อน'}</small>}</header><strong>{set.category}</strong><footer><span>{set.itemIds.length} คำ</span><span>{kind === 'games' ? 'เล่นเกม →' : 'เปิดข้อสอบ →'}</span></footer></Link>)}</div></main>;
}
