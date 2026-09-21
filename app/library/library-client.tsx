'use client';
import { useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { VocabularyItem, VocabularySetRecord } from '@/app/lib/curriculum/types';
import { SetCard } from '@/app/components/library/set-card'; import { VocabularyRow } from '@/app/components/library/vocabulary-row';
type Progress = { setId: string; state: 'not-started' | 'studying' | 'complete' };
const clean = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const fetchVocabulary = async (): Promise<readonly VocabularyItem[]> => { const response=await fetch('/data/vocabulary.json'); if(!response.ok)throw new Error('โหลดคลังคำศัพท์ไม่สำเร็จ'); return response.json() };
export function LibraryClient({ sets, progress, loadItems=fetchVocabulary }: { sets: readonly VocabularySetRecord[]; progress: Progress[]; loadItems?:()=>Promise<readonly VocabularyItem[]> }) {
  const [query,setQuery]=useState(''); const [status,setStatus]=useState('all'); const [items,setItems]=useState<readonly VocabularyItem[]>([]); const [loading,setLoading]=useState(false); const [loadError,setLoadError]=useState(false); const loadingRef=useRef(false); const stateBySet=useMemo(()=>new Map(progress.map(p=>[p.setId,p.state])),[progress]);
  function changeQuery(value:string){setQuery(value);if(!value.trim()||items.length||loadingRef.current)return;loadingRef.current=true;setLoading(true);setLoadError(false);loadItems().then(setItems).catch(()=>setLoadError(true)).finally(()=>{loadingRef.current=false;setLoading(false)})}
  const visibleSets=useMemo(()=>sets.filter(s=>status==='all'||(stateBySet.get(s.id)??'not-started')===status),[sets,status,stateBySet]);
  const results=useMemo(()=>{
    const q=clean(query.trim());
    if (!q) return [];
    return items.filter(i => {
      const matches = [i.hanzi,i.pinyin,i.thai].some(v=>clean(v).includes(q));
      const matchesStatus = status==='all' || (stateBySet.get(i.setId)??'not-started')===status;
      return matches && matchesStatus;
    });
  },[query,status,items,stateBySet]);
  return <><div className="grid gap-3 sm:grid-cols-[1fr_12rem]"><label className="relative"><Search className="absolute left-4 top-3.5 size-5 text-blue-500"/><input type="search" value={query} onChange={e=>changeQuery(e.target.value)} placeholder="ค้นหา 汉字, pinyin หรือคำแปลไทย" className="min-h-12 w-full rounded-2xl border border-blue-100 bg-white pl-12 pr-4 text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"/></label><label><span className="sr-only">สถานะ</span><select aria-label="สถานะ" value={status} onChange={e=>setStatus(e.target.value)} className="min-h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-slate-800 shadow-sm"><option value="all">ทุกสถานะ</option><option value="not-started">ยังไม่เริ่ม</option><option value="studying">กำลังเรียน</option><option value="complete">ผ่านแล้ว</option></select></label></div>{query ? <div className="mt-5 grid gap-2">{loading?<p className="rounded-2xl bg-white p-4 text-sm text-slate-500">กำลังค้นหาคำศัพท์…</p>:loadError?<p className="rounded-2xl bg-white p-4 text-sm text-rose-600">โหลดคำศัพท์ไม่สำเร็จ กรุณาลองใหม่</p>:results.map(item=><VocabularyRow key={item.id} item={item}/>)}</div> : <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visibleSets.map(set=><SetCard key={set.id} set={set}/>)}</div>}</>;
}
