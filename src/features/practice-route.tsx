import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSetItems, type VocabularyItem } from '../lib/curriculum';

type Mode = 'meaning' | 'reading' | 'pinyin' | 'hanzi' | 'tones';
const modes: { id: Mode; label: string }[] = [
  { id: 'meaning', label: 'เลือกความหมาย' }, { id: 'reading', label: 'เลือกคำอ่าน' }, { id: 'pinyin', label: 'พิมพ์พินอิน' }, { id: 'hanzi', label: 'พิมพ์ตัวจีน' }, { id: 'tones', label: 'แยกโทน' },
];
function toneDigits(pinyin: string) { return [...pinyin].map((letter) => 'āēīōūǖ'.includes(letter) ? '1' : 'áéíóúǘ'.includes(letter) ? '2' : 'ǎěǐǒǔǚ'.includes(letter) ? '3' : 'àèìòùǜ'.includes(letter) ? '4' : '').join(''); }
function choices(item: VocabularyItem, items: VocabularyItem[], field: 'thai' | 'pinyin') { return [item, ...items.filter((entry) => entry.id !== item.id).slice(0, 3)].map((entry) => entry[field]); }

export function PracticeRoute() {
  const { setId } = useParams();
  const [items, setItems] = useState<VocabularyItem[] | null>(null);
  const [mode, setMode] = useState<Mode>('meaning'); const [index, setIndex] = useState(0); const [score, setScore] = useState(0); const [input, setInput] = useState(''); const [feedback, setFeedback] = useState('');
  useEffect(() => { let active = true; void import('../../data/curriculum.json').then(({ default: data }) => { if (active) setItems(getSetItems(data, setId)?.items ?? []); }); return () => { active = false; }; }, [setId]);
  const item = items?.[index]; const field = mode === 'reading' ? 'pinyin' : 'thai'; const answerChoices = useMemo(() => item && items ? choices(item, items, field) : [], [item, items, field]);
  if (!items || !item) return <main><h1>กำลังเปิดเกม…</h1></main>;
  const next = (correct: boolean) => { setFeedback(correct ? '✓ ถูกต้อง' : `คำตอบ: ${mode === 'reading' ? item.pinyin : item.thai}`); if (correct) setScore((value) => value + 1); setTimeout(() => { setIndex((value) => Math.min(value + 1, items.length - 1)); setInput(''); setFeedback(''); }, 600); };
  const submit = () => { const expected = mode === 'pinyin' ? item.pinyin.replaceAll(' ', '').toLowerCase() : mode === 'hanzi' ? item.hanzi : toneDigits(item.pinyin); next(input.replaceAll(' ', '').toLowerCase() === expected.toLowerCase()); };
  return <main className="activity-page"><Link className="back-link" to={`/learn/${setId}`}>← กลับไปเรียน</Link><p className="eyebrow">PRACTICE LAB</p><h1>เกมฝึกฝน</h1><p className="activity-subtitle">ฝึกคำศัพท์ Set {setId?.replace('S', '')} แบบสั้น ๆ ให้จำได้จริง</p><div className="mode-tabs">{modes.map((entry) => <button key={entry.id} className={mode === entry.id ? 'selected' : ''} onClick={() => { setMode(entry.id); setIndex(0); setScore(0); setFeedback(''); }}>{entry.label}</button>)}</div><section className="game-card"><header><span>ข้อ {index + 1} / {items.length}</span><b>ถูก {score}</b></header><p className="game-prompt">{mode === 'hanzi' ? item.thai : item.hanzi}</p>{['meaning', 'reading'].includes(mode) ? <div className="game-choices">{answerChoices.map((choice) => <button key={choice} onClick={() => next(choice === item[field])}>{choice}</button>)}</div> : <form onSubmit={(event) => { event.preventDefault(); submit(); }}><label>{mode === 'tones' ? 'พิมพ์เลขโทน เช่น 44' : mode === 'hanzi' ? 'พิมพ์ตัวจีน' : 'พิมพ์พินอิน'}</label><input autoCapitalize="none" value={input} onChange={(event) => setInput(event.target.value)} /><button>ตรวจคำตอบ</button></form>}{feedback && <p className="game-feedback">{feedback}</p>}</section></main>;
}
