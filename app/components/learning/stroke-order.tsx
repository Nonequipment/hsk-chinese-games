'use client';
import { useEffect,useId,useState } from 'react';
declare global { interface Window { HanziWriter?: { create:(id:string,char:string,options:Record<string,unknown>)=>{animateCharacter:()=>void} } } }
export function StrokeOrder({hanzi}:{hanzi:string}){
  const[ready,setReady]=useState(false);const base=useId().replace(/:/g,'');
  useEffect(()=>{if(window.HanziWriter){queueMicrotask(()=>setReady(true));return}const script=document.createElement('script');script.src='/vendor/hanzi-writer.min.js';script.onload=()=>setReady(true);document.head.appendChild(script)},[]);
  useEffect(()=>{if(!ready||!window.HanziWriter)return;[...hanzi].forEach((char,index)=>window.HanziWriter!.create(`${base}-${index}`,char,{width:110,height:110,padding:8,strokeAnimationSpeed:1,delayBetweenStrokes:250,showOutline:true,charDataLoader:async()=>{const data=await fetch('/data/strokes.json').then(r=>r.json());return data[char]}}).animateCharacter())},[ready,hanzi,base]);
  return <div><div className="flex flex-wrap justify-center gap-2">{[...hanzi].map((char,index)=><div key={`${char}-${index}`} id={`${base}-${index}`} className="grid size-[110px] place-items-center rounded-xl bg-white text-5xl text-slate-900">{!ready&&char}</div>)}</div><p className="mt-3 text-center text-xs text-slate-500">แตะเปิดแท็บนี้เพื่อเล่นลำดับขีด</p></div>;
}
