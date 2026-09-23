import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSetItems, type VocabularyItem } from '../lib/curriculum';
import { playCorrectEffect, playWrongEffect, speakMandarin } from '../lib/audio';

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

function shuffleItems(items: VocabularyItem[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function PracticeRoute() {
  const { setId } = useParams();
  const [items, setItems] = useState<VocabularyItem[] | null>(null);
  const [mode, setMode] = useState<Mode>('meaning'); const [index, setIndex] = useState(0); const [score, setScore] = useState(0); const [input, setInput] = useState(''); const [feedback, setFeedback] = useState(''); const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null); const [selectedAnswer, setSelectedAnswer] = useState('');
  const [autoSound, setAutoSound] = useState(() => localStorage.getItem('hsk-mission-auto-sound') !== 'off');
  const [showPinyin, setShowPinyin] = useState(() => localStorage.getItem('hsk-mission-game-pinyin') !== 'off');
  useEffect(() => { let active = true; void import('../../data/curriculum.json').then(({ default: data }) => { const ids = setId?.split('+') ?? []; const selected = ids.flatMap((id) => getSetItems(data, id)?.items ?? []); if (active) setItems(shuffleItems(selected)); }); return () => { active = false; }; }, [setId]);
  const item = items?.[index]; const field = mode === 'reading' ? 'pinyin' : 'thai'; const answerChoices = useMemo(() => item && items ? shuffledChoices(item, items, field) : [], [item, items, field]);
  useEffect(() => { if (autoSound && item) speakMandarin(item.hanzi); }, [item?.id, autoSound]);
  if (!items || !item) return <main><h1>กำลังเปิดเกม…</h1></main>;
  const next = (correct: boolean, answer = '') => { if (feedbackType) return; setSelectedAnswer(answer); setFeedbackType(correct ? 'correct' : 'wrong'); if (correct) { playCorrectEffect(); setFeedback('✓ ถูกต้อง'); setScore((value) => value + 1); } else { playWrongEffect(); setFeedback(`✕ ตอบไม่ถูก · คำตอบที่ถูกต้อง: ${mode === 'reading' ? item.pinyin : mode === 'hanzi' ? item.hanzi : item.thai}`); } setTimeout(() => { setIndex((value) => Math.min(value + 1, items.length - 1)); setInput(''); setFeedback(''); setFeedbackType(null); setSelectedAnswer(''); }, correct ? 650 : 1900); };
  const submit = () => next(mode === 'pinyin' ? answersPinyin(item.pinyin, input) : input.trim() === item.hanzi, input.trim());
  const toggleAutoSound = () => setAutoSound((enabled) => { localStorage.setItem('hsk-mission-auto-sound', enabled ? 'off' : 'on'); return !enabled; });
  const togglePinyin = () => setShowPinyin((visible) => { localStorage.setItem('hsk-mission-game-pinyin', visible ? 'off' : 'on'); return !visible; });
  const reshuffle = () => { setItems((current) => current ? shuffleItems(current) : current); setIndex(0); setScore(0); setInput(''); setFeedback(''); setFeedbackType(null); setSelectedAnswer(''); };
  return <main className="activity-page"><Link className="back-link" to="/games">← กลับไปเลือกชุดเกม</Link><p className="eyebrow">PRACTICE LAB</p><h1>เกมฝึกฝน</h1><p className="activity-subtitle">กำลังเล่น {setId?.split('+').join(' + ')} · {items.length} คำ</p><div className="mode-tabs">{modes.map((entry) => <button key={entry.id} className={mode === entry.id ? 'selected' : ''} onClick={() => { setMode(entry.id); reshuffle(); }}>{entry.label}</button>)}</div><section className="game-card"><header><span>ข้อ {index + 1} / {items.length}</span><b>ถูก {score}</b></header><div className="game-settings"><button aria-label="สุ่มข้อใหม่" onClick={reshuffle}>⤨ สุ่มข้อใหม่</button><button aria-label={autoSound ? 'ปิดเสียงอัตโนมัติ' : 'เปิดเสียงอัตโนมัติ'} onClick={toggleAutoSound}>{autoSound ? '🔊 เสียงอัตโนมัติ' : '🔇 ปิดเสียงอัตโนมัติ'}</button><button aria-label={showPinyin ? 'ซ่อนพินอิน' : 'แสดงพินอิน'} onClick={togglePinyin}>{showPinyin ? '◉ ซ่อนพินอิน' : '◌ แสดงพินอิน'}</button></div><p className="game-prompt">{mode === 'hanzi' ? item.thai : item.hanzi}</p>{showPinyin && mode !== 'hanzi' && <p className="game-pinyin">{item.pinyin}</p>}{['meaning', 'reading'].includes(mode) ? <div className="game-choices">{answerChoices.map((choice, choiceIndex) => <button disabled={Boolean(feedbackType)} className={feedbackType ? (choice === item[field] ? 'correct-choice' : choice === selectedAnswer ? 'wrong-choice' : '') : ''} key={`${choice}-${choiceIndex}`} onClick={() => next(choice === item[field], choice)}>{choice}</button>)}</div> : <form onSubmit={(event) => { event.preventDefault(); submit(); }}><label>{mode === 'pinyin' ? 'พิมพ์พินอินพร้อมเลขวรรณยุกต์ เช่น ba4ba' : 'พิมพ์ตัวจีน'}</label><input autoFocus className={feedbackType === 'wrong' ? 'wrong-input' : ''} disabled={Boolean(feedbackType)} autoCapitalize="none" value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === 'pinyin' ? 'เช่น ba4ba' : 'พิมพ์ตัวจีน'} /><button disabled={Boolean(feedbackType)}>ตรวจคำตอบ</button></form>}{feedback && <p role="status" className={`game-feedback ${feedbackType}`}>{feedback}</p>}</section></main>;
}
