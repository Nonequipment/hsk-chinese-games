import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

export function HanziCopyPractice({ word, onComplete }: { word: string; onComplete: () => void }) {
  const characters = [...word].filter((character) => /[\u3400-\u9fff]/.test(character));
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
  const character = characters[index];

  useEffect(() => { setIndex(0); }, [word]);
  useEffect(() => {
    if (!ref.current || !character || import.meta.env.MODE === 'test') return;
    ref.current.innerHTML = '';
    const writer = HanziWriter.create(ref.current, character, { width: 260, height: 260, padding: 18, showOutline: true, showHintAfterMisses: 2 });
    writerRef.current = writer;
    writer.quiz({ onComplete: () => { if (index < characters.length - 1) setIndex((current) => current + 1); else onComplete(); } });
    return () => writer.cancelQuiz();
  }, [character, characters.length, index, onComplete]);

  return <section className="copy-practice" aria-label="พื้นที่ฝึกคัดจีน"><p className="copy-instruction">คัดตามลำดับขีดให้ครบ ระบบจะตรวจแต่ละขีดให้</p><div className="copy-progress">ตัวอักษร {index + 1} / {characters.length}</div><div ref={ref} className="copy-canvas" aria-label={`ฝึกคัดตัวจีน ${character}`} /><button type="button" onClick={() => writerRef.current?.animateCharacter()}>▶ ดูลำดับขีดอีกครั้ง</button></section>;
}
