import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSetItems, type VocabularyItem } from '../lib/curriculum';

type Mode = 'meaning' | 'reading' | 'pinyin' | 'hanzi';
const modes: { id: Mode; label: string }[] = [
  { id: 'meaning', label: 'เลือกความหมาย' }, { id: 'reading', label: 'เลือกคำอ่าน' },
  { id: 'pinyin', label: 'พิมพ์พินอินและโทน' }, { id: 'hanzi', label: 'พิมพ์ตัวจีน' },
];
const marked: Record<string, [string, string]> = { ā: ['a', '1'], á: ['a', '2'], ǎ: ['a', '3'], à: ['a', '4'], ē: ['e', '1'], é: ['e', '2'], ě: ['e', '3'], è: ['e', '4'], ī: ['i', '1'], í: ['i', '2'], ǐ: ['i', '3'], ì: ['i', '4'], ō: ['o', '1'], ó: ['o', '2'], ǒ: ['o', '3'], ò: ['o', '4'], ū: ['u', '1'], ú: ['u', '2'], ǔ: ['u', '3'], ù: ['u', '4'], ǖ: ['ü', '1'], ǘ: ['ü', '2'], ǚ: ['ü', '3'], ǜ: ['ü', '4'] };

function answersPinyin(pinyin: string, answer: string) {
  const expected = [...pinyin.toLowerCase()].reduce((value, letter) => marked[letter] ? { base: value.base + marked[letter][0], tones: value.tones + marked[letter][1] } : /[a-zü]/.test(letter) ? { ...value, base: value.base + letter } : value, { base: '', tones: '' });
  const supplied = answer.toLowerCase().replaceAll(' ', '').replaceAll('ü', 'v');
  return supplied.replace(/[1-5]/g, '').replaceAll('v', 'ü') === expected.base && supplied.replace(/[^1-4]/g, '') === expected.tones;
}

function shuffledChoices(item: VocabularyItem, items: VocabularyItem[], field: 'thai' | 'pinyin') {
  const alternatives = items.filter((entry) => entry.id !== item.id && entry[field] !== item[field]).sort(() => Math.random() - 0.5).slice(0, 3);
  return [item, ...alternatives].sort(() => Math.random() - 0.5).map((entry) => entry[field]);
}

export function PracticeRoute() {
  const { setId } = useParams();
  const [items, setItems] = useState<VocabularyItem[] | null>(null);
  const [mode, setMode] = useState<Mode>('meaning'); const [index, setIndex] = useState(0); const [score, setScore] = useState(0); const [input, setInput] = useState(''); const [feedback, setFeedback] = useState('');
  useEffect(() => { let active = true; void import('../../data/curriculum.json').then(({ default: data }) => { const ids = setId?.split('+') ?? []; const selected = ids.flatMap((id) => getSetItems(data, id)?.items ?? []); if (active) setItems(selected); }); return () => { active = false; }; }, [setId]);
  const item = items?.[index]; const field = mode === 'reading' ? 'pinyin' : 'thai'; const answerChoices = useMemo(() => item && items ? shuffledChoices(item, items, field) : [], [item, items, field]);
  if (!items || !item) return <main><h1>กำลังเปิดเกม…</h1></main>;
  const next = (correct: boolean) => { setFeedback(correct ? '✓ ถูกต้อง' : `คำตอบ: ${mode === 'reading' ? item.pinyin : item.thai}`); if (correct) setScore((value) => value + 1); setTimeout(() => { setIndex((value) => Math.min(value + 1, items.length - 1)); setInput(''); setFeedback(''); }, 600); };
  const submit = () => next(mode === 'pinyin' ? answersPinyin(item.pinyin, input) : input.trim() === item.hanzi);
  return <main className="activity-page"><Link className="back-link" to="/games">← กลับไปเลือกชุดเกม</Link><p className="eyebrow">PRACTICE LAB</p><h1>เกมฝึกฝน</h1><p className="activity-subtitle">กำลังเล่น {setId?.split('+').join(' + ')} · {items.length} คำ</p><div className="mode-tabs">{modes.map((entry) => <button key={entry.id} className={mode === entry.id ? 'selected' : ''} onClick={() => { setMode(entry.id); setIndex(0); setScore(0); setFeedback(''); }}>{entry.label}</button>)}</div><section className="game-card"><header><span>ข้อ {index + 1} / {items.length}</span><b>ถูก {score}</b></header><p className="game-prompt">{mode === 'hanzi' ? item.thai : item.hanzi}</p>{['meaning', 'reading'].includes(mode) ? <div className="game-choices">{answerChoices.map((choice, choiceIndex) => <button key={`${choice}-${choiceIndex}`} onClick={() => next(choice === item[field])}>{choice}</button>)}</div> : <form onSubmit={(event) => { event.preventDefault(); submit(); }}><label>{mode === 'pinyin' ? 'พิมพ์พินอินพร้อมเลขวรรณยุกต์ เช่น ba4ba' : 'พิมพ์ตัวจีน'}</label><input autoCapitalize="none" value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === 'pinyin' ? 'เช่น ba4ba' : 'พิมพ์ตัวจีน'} /><button>ตรวจคำตอบ</button></form>}{feedback && <p className="game-feedback">{feedback}</p>}</section></main>;
}
