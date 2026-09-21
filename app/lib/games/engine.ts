import type { VocabularyItem } from '@/app/lib/curriculum/types';
export type GameMode='meaning'|'reading'|'pinyin'|'hanzi'|'tones'|'matching'|'flash';
function random(seed:number){let state=seed>>>0;return()=>((state=Math.imul(1664525,state)+1013904223>>>0)/4294967296)}
export function seededShuffle<T>(values:readonly T[],seed:number):T[]{const out=[...values],rng=random(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function createGame({mode,items,seed}:{mode:GameMode;items:readonly VocabularyItem[];seed:number}){const ordered=seededShuffle(items,seed);return{mode,itemIds:ordered.map(i=>i.id),items:ordered}}
