import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSetItems, type VocabularyItem } from '../lib/curriculum';
import { canOpenExam, markSetCompleted, readCompletedSets, readRemembered } from '../lib/study-progress';
import { playCorrectEffect, playWrongEffect } from '../lib/audio';

type QuestionType = 'meaning' | 'hanzi' | 'tones';
const questionTypes: QuestionType[] = ['meaning', 'hanzi', 'tones'];
const labels: Record<QuestionType, string> = { meaning: 'เลือกความหมาย · ไม่มีพินอิน', hanzi: 'พิมพ์ตัวจีน', tones: 'พิมพ์พินอินพร้อมเลขวรรณยุกต์' };
const marked: Record<string, [string, string]> = { ā: ['a', '1'], á: ['a', '2'], ǎ: ['a', '3'], à: ['a', '4'], ē: ['e', '1'], é: ['e', '2'], ě: ['e', '3'], è: ['e', '4'], ī: ['i', '1'], í: ['i', '2'], ǐ: ['i', '3'], ì: ['i', '4'], ō: ['o', '1'], ó: ['o', '2'], ǒ: ['o', '3'], ò: ['o', '4'], ū: ['u', '1'], ú: ['u', '2'], ǔ: ['u', '3'], ù: ['u', '4'], ǖ: ['ü', '1'], ǘ: ['ü', '2'], ǚ: ['ü', '3'], ǜ: ['ü', '4'] };

function numberedPinyin(pinyin: string) { return [...pinyin.toLowerCase()].map((letter) => marked[letter] ? marked[letter].join('') : letter).join('').replaceAll(' ', ''); }
function answersPinyin(pinyin: string, answer: string) {
  const expected = [...pinyin.toLowerCase()].reduce((value, letter) => marked[letter] ? { base: value.base + marked[letter][0], tones: value.tones + marked[letter][1] } : /[a-zü]/.test(letter) ? { ...value, base: value.base + letter } : value, { base: '', tones: '' });
  const supplied = answer.toLowerCase().replaceAll(' ', '').replaceAll('ü', 'v');
  return supplied.replace(/[1-5]/g, '').replaceAll('v', 'ü') === expected.base && supplied.replace(/[^1-4]/g, '') === expected.tones;
}
function getChoices(item: VocabularyItem, items: VocabularyItem[]) {
  const alternatives = items.filter((entry) => entry.id !== item.id && entry.thai !== item.thai);
  const choices = [item.thai, ...alternatives.sort(() => Math.random() - 0.5).slice(0, 3).map((entry) => entry.thai)];
  return choices.sort(() => Math.random() - 0.5);
}

type ExamQuestion = { itemIndex: number; type: QuestionType };

export function createExamQuestions(items: VocabularyItem[]): ExamQuestion[] {
  return items.flatMap((_, itemIndex) => questionTypes.map((type) => ({ itemIndex, type }))).sort(() => Math.random() - 0.5);
}

function questionGuide(type: QuestionType, item: VocabularyItem) {
  if (type === 'meaning') return 'เลือกคำแปลภาษาไทยที่ตรงกับคำจีน';
  if (type === 'hanzi') return `คำแปล “${item.thai}” · พิมพ์เป็นตัวจีน`;
  return 'อ่านคำจีนแล้วพิมพ์พินอินพร้อมเลขวรรณยุกต์';
}

function answerKey(type: QuestionType, item: VocabularyItem) {
  if (type === 'meaning') return item.thai;
  if (type === 'hanzi') return item.hanzi;
  return numberedPinyin(item.pinyin);
}

export function ExamRoute() {
  const { setId } = useParams();
  const [items, setItems] = useState<VocabularyItem[] | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'passed' | 'failed' | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  useEffect(() => { let active = true; void import('../../data/curriculum.json').then(({ default: data }) => { if (active) setItems(getSetItems(data, setId)?.items ?? []); }); return () => { active = false; }; }, [setId]);
  const question = questions[index];
  const itemIndex = question?.itemIndex ?? 0;
  const item = items?.[itemIndex];
  const type = question?.type ?? 'meaning';
  const choices = useMemo(() => item && items ? getChoices(item, items) : [], [item, items, question]);
  if (!items || !item) return <main><h1>กำลังเตรียมข้อสอบ…</h1></main>;
  if (!canOpenExam(readRemembered(), items.map((entry) => entry.id))) return <main className="activity-page"><Link className="back-link" to={`/learn/${setId}`}>← กลับไปเรียน</Link><h1>ยังเปิดข้อสอบไม่ได้</h1><p className="activity-subtitle">จำคำศัพท์ในชุดนี้ให้ครบทั้ง 20 คำก่อน จึงจะเริ่มสอบได้</p></main>;
  const reset = () => { setStarted(false); setIndex(0); setInput(''); setResult(null); setQuestions([]); };
  const totalQuestions = items.length * questionTypes.length;
  const answer = (correct: boolean) => { if (!correct) { playWrongEffect(); setResult('failed'); return; } playCorrectEffect(); if (index === totalQuestions - 1) { markSetCompleted(readCompletedSets(), setId ?? ''); setResult('passed'); return; } setIndex((value) => value + 1); setInput(''); };
  const submit = () => answer(type === 'hanzi' ? input.trim() === item.hanzi : answersPinyin(item.pinyin, input));
  return <main className="activity-page"><Link className="back-link" to={`/learn/${setId}`}>← กลับไปเรียน</Link><p className="eyebrow">MASTERY EXAM</p><h1>สอบชุดคำศัพท์</h1><p className="activity-subtitle">คำศัพท์ละ 3 แบบ รวม {totalQuestions} ข้อ ต้องถูก 100% หากตอบผิดให้เริ่มสอบใหม่</p>{!started ? <section className="exam-intro"><h2>ข้อสอบรวม 3 โหมด</h2><p>สุ่มลำดับโจทย์ทั้ง 3 รูปแบบ แต่ยังทดสอบคำศัพท์ทั้ง 20 คำครบ: เลือกความหมายโดยไม่มีพินอิน · พิมพ์ตัวจีน · พิมพ์พินอินพร้อมเลขวรรณยุกต์ เช่น ba4ba</p><small>คำตอบจะไม่แสดงก่อนตอบ · ตอบผิดจะแสดงเฉลยก่อนเริ่มใหม่</small><button onClick={() => { setQuestions(createExamQuestions(items)); setStarted(true); }}>เริ่มสอบ {totalQuestions} ข้อ</button></section> : result ? <section className={`exam-intro ${result}`}><h2>{result === 'passed' ? '✓ ผ่าน 100%' : '✕ ตอบผิด'}</h2><p>{result === 'passed' ? `คุณผ่านครบทั้ง ${totalQuestions} ข้อ` : <>คำตอบที่ถูกต้องคือ <strong className="exam-answer-key">{answerKey(type, item)}</strong></>}</p>{result === 'failed' && <small>คำถาม: {labels[type]} · จำคำตอบนี้ไว้ แล้วเริ่มใหม่เพื่อทำคะแนน 100%</small>}<button onClick={reset}>{result === 'passed' ? 'กลับไปเลือกชุด' : 'เริ่มสอบใหม่'}</button></section> : <section className="game-card"><header><span>ข้อ {index + 1} / {totalQuestions}</span><b>เป้าหมาย 100%</b></header><p className="exam-question-type">{labels[type]}</p><p className="game-prompt">{type === 'hanzi' ? item.thai : item.hanzi}</p><p className="exam-question-guide">{questionGuide(type, item)}</p>{type === 'meaning' ? <div className="game-choices">{choices.map((choice, choiceIndex) => <button key={`${choice}-${choiceIndex}`} onClick={() => answer(choice === item.thai)}>{choice}</button>)}</div> : <form onSubmit={(event) => { event.preventDefault(); submit(); }}><label>{type === 'hanzi' ? 'พิมพ์ตัวจีนให้ถูกต้อง' : 'พิมพ์พินอินพร้อมเลขวรรณยุกต์'}</label><input aria-label="พิมพ์คำตอบสอบ" autoCapitalize="none" value={input} onChange={(event) => setInput(event.target.value)} placeholder={type === 'hanzi' ? 'พิมพ์ตัวจีน' : 'เช่น ba4ba'} /><button>ส่งคำตอบ</button></form>}</section>}</main>;
}
