'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { VocabularyItem, VocabularySetRecord } from '@/app/lib/curriculum/types';
import { SetCard } from '@/app/components/library/set-card'; import { VocabularyRow } from '@/app/components/library/vocabulary-row';
type Progress = { setId: string; state: 'not-started' | 'studying' | 'complete' };
const clean = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function LibraryClient({ sets, items, progress }: { sets: readonly VocabularySetRecord[]; items: readonly VocabularyItem[]; progress: Progress[] }) {
  const [query,setQuery]=useState(''); const [status,setStatus]=useState('all'); const stateBySet=new Map(progress.map(p=>[p.setId,p.state]));
  const visibleSets=useMemo(()=>sets.filter(s=>status==='all'||(stateBySet.get(s.id)??'not-started')===status),[sets,status,progress]);
  const results=useMemo(()=>{
    const q=clean(query.trim());
    if (!q) return [];
    return items.filter(i => {
      const matches = [i.hanzi,i.pinyin,i.thai].some(v=>clean(v).includes(q));
      const matchesStatus = status==='all' || (stateBySet.get(i.setId)??'not-started')===status;
      return matches && matchesStatus;
    });
  },[query,status,items,progress]);
  return <><div className="grid gap-3 sm:grid-cols-[1fr_12rem]"><label className="relative"><Search className="absolute left-4 top-3.5 size-5 text-slate-500"/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหา 汉字, pinyin หรือคำแปลไทย" className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-white outline-none focus:border-cyan-300/50"/></label><label><span className="sr-only">สถานะ</span><select aria-label="สถานะ" value={status} onChange={e=>setStatus(e.target.value)} className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#0b1128] px-4 text-white"><option value="all">ทุกสถานะ</option><option value="not-started">ยังไม่เริ่ม</option><option value="studying">กำลังเรียน</option><option value="complete">ผ่านแล้ว</option></select></label></div>{query ? <div className="mt-5 grid gap-2">{results.map(item=><VocabularyRow key={item.id} item={item}/>)}</div> : <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visibleSets.map(set=><SetCard key={set.id} set={set}/>)}</div>}</>;
}
