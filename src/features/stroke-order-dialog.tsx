import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

type Props = { word: string; open: boolean; onClose: () => void };

export function StrokeOrderDialog({ word, open, onClose }: Props) {
  const chars = [...word].filter((char) => /[\u3400-\u9fff]/.test(char));
  const [selected, setSelected] = useState(chars[0] ?? '');
  const [replay, setReplay] = useState(0);
  const writerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');

  useEffect(() => { if (open) setSelected(chars[0] ?? ''); }, [open, word]);
  useEffect(() => {
    if (!open || !selected || !writerRef.current) return;
    writerRef.current.innerHTML = '';
    setStatus('กำลังโหลดลำดับขีด…');
    try {
      const writer = HanziWriter.create(writerRef.current, selected, {
        width: 220, height: 220, padding: 12, strokeAnimationSpeed: 1, delayBetweenStrokes: 120,
        onLoadCharDataSuccess: () => { setStatus('แตะเล่นซ้ำเพื่อดูทีละขีด'); writer.loopCharacterAnimation(); },
        onLoadCharDataError: () => setStatus('ยังไม่มีข้อมูลลำดับขีดสำหรับตัวอักษรนี้'),
      });
      return () => writer.cancelQuiz();
    } catch { setStatus('ไม่สามารถเปิดลำดับขีดได้'); }
  }, [open, selected, replay]);

  if (!open) return null;
  return <div className="stroke-backdrop" role="presentation" onClick={onClose}>
    <section className="stroke-dialog" role="dialog" aria-label={'ลำดับขีด ' + word} aria-modal="true" onClick={(event) => event.stopPropagation()}>
      <header><div><p>STROKE ORDER</p><h2>ลำดับขีด · {word}</h2></div><button aria-label="ปิดลำดับขีด" onClick={onClose}>×</button></header>
      <div className="character-tabs">{chars.map((char, index) => <button key={char + index} className={char === selected ? 'selected' : ''} onClick={() => setSelected(char)}>{char}</button>)}</div>
      <div ref={writerRef} className="writer-canvas" aria-label={'ภาพเคลื่อนไหวลำดับขีด ' + selected} />
      <p className="writer-status">{status}</p>
      <button className="replay-strokes" onClick={() => setReplay((current) => current + 1)}>▶ เล่นลำดับขีดอีกครั้ง</button>
    </section>
  </div>;
}


