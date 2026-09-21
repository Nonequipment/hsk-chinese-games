import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

type Props = { word: string };

export function StrokeOrderInline({ word }: Props) {
  const characters = [...word].filter((character) => /[\u3400-\u9fff]/.test(character));
  const [selected, setSelected] = useState(characters[0] ?? '');
  const [replay, setReplay] = useState(0);
  const [status, setStatus] = useState('กำลังโหลดลำดับขีด…');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSelected(characters[0] ?? ''); }, [word]);

  useEffect(() => {
    if (!selected || !canvasRef.current) return;
    canvasRef.current.innerHTML = '';
    setStatus('กำลังโหลดลำดับขีด…');
    const writer = HanziWriter.create(canvasRef.current, selected, {
      width: 168,
      height: 168,
      padding: 10,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 120,
      onLoadCharDataSuccess: () => {
        setStatus('เล่นอัตโนมัติ · กดเล่นซ้ำเพื่อดูอีกครั้ง');
        writer.loopCharacterAnimation();
      },
      onLoadCharDataError: () => setStatus('ยังไม่มีข้อมูลลำดับขีดสำหรับตัวอักษรนี้'),
    });
    return () => writer.cancelQuiz();
  }, [selected, replay]);

  return <section className="stroke-inline" aria-label={`ลำดับขีดบนการ์ด ${selected}`}>
    <div className="stroke-inline-heading">
      <span className="stroke-mark">笔</span>
      <span><strong>ลำดับขีด</strong><small>ดูได้บนบัตรคำนี้ทันที</small></span>
    </div>
    <div className="stroke-stage">
      <div className="stroke-tabs" aria-label="เลือกตัวอักษร">
        {characters.map((character, index) => <button key={`${character}-${index}`} className={character === selected ? 'selected' : ''} onClick={() => { setSelected(character); setReplay((value) => value + 1); }}>{character}</button>)}
      </div>
      <div ref={canvasRef} className="stroke-canvas" aria-label={`ภาพเคลื่อนไหวลำดับขีด ${selected}`} />
    </div>
    <div className="stroke-footer"><small>{status}</small><button onClick={() => setReplay((value) => value + 1)}>↻ เล่นซ้ำ</button></div>
  </section>;
}
