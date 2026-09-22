import { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

function CharacterStroke({ character, index }: { character: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!ref.current || import.meta.env.MODE === 'test') return; ref.current.innerHTML = ''; const writer = HanziWriter.create(ref.current, character, { width: 132, height: 132, padding: 8, strokeAnimationSpeed: 1, delayBetweenStrokes: 120, onLoadCharDataSuccess: () => writer.loopCharacterAnimation() }); return () => writer.cancelQuiz(); }, [character]);
  return <div className="stroke-character"><b>{character}</b><div ref={ref} className="stroke-canvas" aria-label={`ภาพเคลื่อนไหวลำดับขีด ${character} ${index + 1}`} /></div>;
}
export function StrokeOrderInline({ word }: { word: string }) {
  const characters = [...word].filter((character) => /[\u3400-\u9fff]/.test(character));
  return <section className="stroke-inline" aria-label="ลำดับขีดบนการ์ด"><div className="stroke-inline-heading"><span className="stroke-mark">笔</span><span><strong>ลำดับขีด</strong><small>เล่นวนซ้ำของทุกตัวอักษร</small></span></div><div className="stroke-all">{characters.map((character, index) => <CharacterStroke key={`${character}-${index}`} character={character} index={index} />)}</div></section>;
}
