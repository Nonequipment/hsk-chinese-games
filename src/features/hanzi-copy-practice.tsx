import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

export function HanziCopyPractice({ word, onComplete }: { word: string; onComplete: () => void }) {
  const characters = [...word].filter((character) => /[\u3400-\u9fff]/.test(character));
  const [index, setIndex] = useState(0);
  const [showStrokeOrder, setShowStrokeOrder] = useState(true);
  const [blankPaper, setBlankPaper] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
  const character = characters[index];

  useEffect(() => { setIndex(0); }, [word]);
  useEffect(() => {
    if (!ref.current || !character || import.meta.env.MODE === 'test') return;
    ref.current.innerHTML = '';
    const writer = HanziWriter.create(ref.current, character, { width: 260, height: 260, padding: 18, showOutline: showStrokeOrder && !blankPaper, showCharacter: showStrokeOrder && !blankPaper, showHintAfterMisses: showStrokeOrder && !blankPaper ? 2 : undefined });
    writerRef.current = writer;
    writer.quiz({ onComplete: () => { if (index < characters.length - 1) setIndex((current) => current + 1); else onComplete(); } });
    return () => writer.cancelQuiz();
  }, [character, characters.length, index, onComplete, showStrokeOrder, blankPaper]);

  return <section className="copy-practice" aria-label="พื้นที่ฝึกคัดจีน"><div className="copy-options"><button type="button" aria-label={showStrokeOrder ? 'ปิดลำดับขีด' : 'เปิดลำดับขีด'} aria-pressed={showStrokeOrder} onClick={() => setShowStrokeOrder((visible) => !visible)}>{showStrokeOrder ? '◉ ลำดับขีด: เปิด' : '○ ลำดับขีด: ปิด'}</button><button type="button" aria-label={blankPaper ? 'ใช้แบบร่าง' : 'กระดาษเปล่า'} aria-pressed={blankPaper} onClick={() => setBlankPaper((enabled) => !enabled)}>{blankPaper ? '↶ ใช้แบบร่าง' : '□ กระดาษเปล่า'}</button></div><p className="copy-instruction">{blankPaper ? 'คัดบนกระดาษเปล่า ระบบจะตรวจแต่ละขีดให้' : 'คัดตามลำดับขีดให้ครบ ระบบจะตรวจแต่ละขีดให้'}</p><div className="copy-progress">ตัวอักษร {index + 1} / {characters.length}</div><div ref={ref} className={`copy-canvas ${blankPaper ? 'blank' : ''}`} aria-label={`ฝึกคัดตัวจีน ${character}`} />{showStrokeOrder && !blankPaper && <button type="button" onClick={() => writerRef.current?.animateCharacter()}>▶ ดูลำดับขีดอีกครั้ง</button>}</section>;
}
