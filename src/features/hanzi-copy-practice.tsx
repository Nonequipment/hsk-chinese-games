import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

export function HanziCopyPractice({ word, onComplete, paperMode, onPaperModeChange }: { word: string; onComplete: () => void; paperMode: 'guided' | 'blank'; onPaperModeChange: (mode: 'guided' | 'blank') => void }) {
  const characters = [...word].filter((character) => /[\u3400-\u9fff]/.test(character));
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
  const character = characters[index];

  useEffect(() => { setIndex(0); }, [word]);
  useEffect(() => {
    if (!ref.current || !character || import.meta.env.MODE === 'test') return;
    ref.current.innerHTML = '';
    const guided = paperMode === 'guided';
    const writer = HanziWriter.create(ref.current, character, { width: 260, height: 260, padding: 18, showOutline: guided, showCharacter: guided, showHintAfterMisses: guided ? 2 : undefined });
    writerRef.current = writer;
    writer.quiz({ onComplete: () => { if (index < characters.length - 1) setIndex((current) => current + 1); else onComplete(); } });
    return () => writer.cancelQuiz();
  }, [character, characters.length, index, onComplete, paperMode]);

  const guided = paperMode === 'guided';
  return <section className="copy-practice" aria-label="พื้นที่ฝึกคัดจีน"><div className="copy-options" role="group" aria-label="รูปแบบกระดาษคัดจีน"><button type="button" aria-label="ตามลำดับขีด" aria-pressed={guided} onClick={() => onPaperModeChange('guided')}>◉ ตามลำดับขีด</button><button type="button" aria-label="กระดาษเปล่า" aria-pressed={!guided} onClick={() => onPaperModeChange('blank')}>□ กระดาษเปล่า</button></div><p className="copy-instruction">{guided ? 'คัดตามลำดับขีดให้ครบ ระบบจะตรวจแต่ละขีดให้' : 'คัดบนกระดาษเปล่า ระบบจะตรวจแต่ละขีดให้'}</p><div className="copy-progress">ตัวอักษร {index + 1} / {characters.length}</div><div ref={ref} className={`copy-canvas ${guided ? '' : 'blank'}`} aria-label={`ฝึกคัดตัวจีน ${character}`} />{guided && <button type="button" onClick={() => writerRef.current?.animateCharacter()}>▶ ดูลำดับขีดอีกครั้ง</button>}</section>;
}
