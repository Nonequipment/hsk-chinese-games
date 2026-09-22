import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { canOpenExam, readRemembered } from '../lib/study-progress';
import { type Curriculum } from '../lib/curriculum';
export function ModeHub({ kind }: { kind: 'games' | 'exams' }) {
 const [data,setData]=useState<Curriculum|null>(null); const [selected,setSelected]=useState(['S01']);
 useEffect(()=>{void import('../../data/curriculum.json').then(({default:loaded})=>setData(loaded));},[]);
 if(!data)return <main><h1>กำลังเปิด…</h1></main>;
 const toggle=(id:string)=>setSelected(current=>current.includes(id)?(current.length===1?current:current.filter(value=>value!==id)):[...current,id]);
 const remembered=readRemembered();
 return <main className="mode-hub"><p className="eyebrow">{kind==='games'?'GAME LIBRARY':'MASTERY EXAMS'}</p><h1>{kind==='games'?'เกมทบทวน':'เลือกชุดข้อสอบ'}</h1><p>{kind==='games'?'เลือกหนึ่งหรือหลายเซ็ตเพื่อเล่นรวมกัน':'เลือกหมวดคำศัพท์ที่เรียนครบแล้วเพื่อเข้าสอบ'}</p>{kind==='games'&&<Link className="play-selected" to={`/practice/${selected.join('+')}`}>เล่น {selected.length} เซ็ตที่เลือก</Link>}<div className="set-grid">{data.sets.map(set=>kind==='games' ? <label key={set.id} className="set-card mode-set"><input type="checkbox" aria-label={`เลือก SET ${set.id.slice(1)}`} checked={selected.includes(set.id)} onChange={()=>toggle(set.id)}/><header><b>SET {set.id.slice(1)}</b></header><strong>{set.category}</strong><footer><span>{set.itemIds.length} คำ</span><span>เลือกเล่น</span></footer></label> : <Link key={set.id} to={`/exam/${set.id}`} className="set-card"><header><b>SET {set.id.slice(1)}</b><small>{canOpenExam(remembered,set.itemIds)?'✓ พร้อมสอบ':'เรียนก่อน'}</small></header><strong>{set.category}</strong><footer><span>{set.itemIds.length} คำ</span><span>เปิดข้อสอบ →</span></footer></Link>)}</div></main>;
}
