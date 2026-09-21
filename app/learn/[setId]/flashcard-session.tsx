'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect,useState } from 'react';
import { Eye,Volume2,PenTool } from 'lucide-react';
import type { VocabularySet } from '@/app/lib/curriculum/types';
import type { MemoryStatus } from '@/app/lib/progress/types';
import { MemoryControls } from '@/app/components/learning/memory-controls';
import { StrokeOrder } from '@/app/components/learning/stroke-order';
import { speakMandarin } from '@/app/lib/audio/speech';
import { browserQueue } from '@/app/lib/sync/offline-queue';

type SaveCard=(input:{itemId:string;setId:string;status:MemoryStatus;requestId:string})=>Promise<void>;
const defaultSave:SaveCard=async input=>{try{const response=await fetch('/api/cards',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});if(!response.ok)throw new Error('save failed')}catch{await browserQueue().enqueue({id:input.requestId,type:'card',payload:input})}};

export function FlashcardSession({set,initialProgress,saveCard=defaultSave}:{set:VocabularySet;initialProgress:string[];saveCard?:SaveCard}){
  const[index,setIndex]=useState(Math.min(initialProgress.length,19));const[revealed,setRevealed]=useState(false);const[stroke,setStroke]=useState(false);const[saving,setSaving]=useState(false);const[studied,setStudied]=useState(new Set(initialProgress));const item=set.items[index];
  useEffect(()=>{setRevealed(false);setStroke(false);const timer=setTimeout(()=>speakMandarin(item.hanzi),180);return()=>clearTimeout(timer)},[index,item.hanzi]);
  async function choose(status:MemoryStatus){setSaving(true);try{await saveCard({itemId:item.id,setId:set.id,status,requestId:crypto.randomUUID()});setStudied(prev=>new Set(prev).add(item.id));if(index<set.items.length-1)setIndex(index+1)}finally{setSaving(false)}}
  return <div className="mx-auto max-w-2xl"><div className="mb-3 flex items-center justify-between text-sm text-slate-500"><span>{set.id} · ใบที่ {index+1}/20</span><span>{studied.size}/20 เรียนแล้ว</span></div><div className="h-1.5 overflow-hidden rounded-full bg-blue-100"><div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{width:`${(index+1)/20*100}%`}}/></div>
    <section className="mt-3 min-h-[300px] rounded-[2rem] border border-blue-100 bg-white p-4 text-center shadow-2xl shadow-blue-200/70 sm:mt-4 sm:min-h-[390px] sm:p-8"><p className="text-xs uppercase tracking-[.2em] text-slate-500">{item.category}</p><div className="mt-5 break-words text-6xl font-semibold text-slate-950 sm:mt-9 sm:text-7xl">{item.hanzi}</div><button onClick={()=>speakMandarin(item.hanzi)} aria-label="ฟังเสียง" className="mt-4 inline-grid size-12 place-items-center rounded-full bg-blue-500/15 text-blue-600 sm:mt-5"><Volume2/></button>
      {!revealed?<button onClick={()=>setRevealed(true)} className="mx-auto mt-6 flex min-h-12 items-center gap-2 rounded-2xl bg-blue-500 px-6 font-semibold sm:mt-8"><Eye className="size-5"/> เปิดคำตอบ</button>:<div className="mt-5 sm:mt-6"><p className="text-2xl text-blue-600">{item.pinyin}</p><p className="mt-2 text-lg text-slate-700">{item.thai}</p><button onClick={()=>setStroke(!stroke)} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 px-4 text-sm"><PenTool className="size-4"/> ลำดับขีด</button>{stroke&&<div className="mt-5"><StrokeOrder hanzi={item.hanzi}/></div>}<div className="mt-4 sm:mt-6"><MemoryControls onChoose={choose} disabled={saving}/></div></div>}
    </section><div className="mt-3 flex justify-between"><button disabled={index===0} onClick={()=>setIndex(index-1)} className="min-h-11 rounded-xl border border-blue-100 px-4 disabled:opacity-30">ก่อนหน้า</button><button disabled={index===19} onClick={()=>setIndex(index+1)} className="min-h-11 rounded-xl border border-blue-100 px-4 disabled:opacity-30">ถัดไป</button></div></div>;
}
