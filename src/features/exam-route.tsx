import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSetItems, type VocabularyItem } from '../lib/curriculum';
import { canOpenExam, readRemembered } from '../lib/study-progress';

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
function getChoices(item: VocabularyItem, items: VocabularyItem[], index: number) {
  const alternatives = items.filter((entry) => entry.id !== item.id && entry.thai !== item.thai);
  const choices = [item.thai];
  for (let offset = 0; choices.length < 4 && offset < alternatives.length; offset += 1) choices.push(alternatives[(index * 7 + offset) % alternatives.length].thai);
  return choices.map((_, position) => choices[(position + index) % choices.length]);
}

export function ExamRoute() {
  const { setId } = useParams();
  const [items, setItems] = useState<VocabularyItem[] | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'passed' | 'failed' | null>(null);
  useEffect(() => { let active = true; void import('../../data/curriculum.json').then(({ default: data }) => { if (active) setItems(getSetItems(data, setId)?.items ?? []); }); return () => { active = false; }; }, [setId]);
  const itemIndex = Math.floor(index / questionTypes.length);
  const item = items?.[itemIndex];
  const type = questionTypes[index % questionTypes.length];
  const choices = useMemo(() => item && items ? getChoices(item, items, itemIndex) : [], [item, items, itemIndex]);
  if (!items || !item) return <main><h1>กำลังเตรียมข้อสอบ…</h1></main>;
  if (!canOpenExam(readRemembered(), items.map((entry) => entry.id))) return <main className="activity-page"><Link className="back-link" to={`/learn/${setId}`}>← กลับไปเรียน</Link><h1>ยังเปิดข้อสอบไม่ได้</h1><p className="activity-subtitle">จำคำศัพท์ในชุดนี้ให้ครบทั้ง 20 คำก่อน จึงจะเริ่มสอบได้</p></main>;
  const reset = () => { setStarted(false); setIndex(0); setInput(''); setResult(null); };
  const totalQuestions = items.length * questionTypes.length;
  const answer = (correct: boolean) => { if (!correct) { setResult('failed'); return; } if (index === totalQuestions - 1) { setResult('passed'); return; } setIndex((value) => value + 1); setInput(''); };
  const submit = () => answer(type === 'hanzi' ? input.trim() === item.hanzi : answersPinyin(item.pinyin, input));
  return <main className="activity-page"><Link className="back-link" to={`/learn/${setId}`}>← กลับไปเรียน</Link><p className="eyebrow">MASTERY EXAM</p><h1>สอบชุดคำศัพท์</h1><p className="activity-subtitle">คำศัพท์ละ 3 แบบ รวม {totalQuestions} ข้อ ต้องถูก 100% หากตอบผิดให้เริ่มสอบใหม่</p>{!started ? <section className="exam-intro"><h2>ข้อสอบรวม 3 โหมด</h2><p>คำศัพท์ทั้ง 20 คำจะถูกทดสอบครบ: เลือกความหมายโดยไม่มีพินอิน · พิมพ์ตัวจีน · พิมพ์พินอินพร้อมเลขวรรณยุกต์ เช่น ba4ba</p><button onClick={() => setStarted(true)}>เริ่มสอบ {totalQuestions} ข้อ</button></section> : result ? <section className={`exam-intro ${result}`}><h2>{result === 'passed' ? '✓ ผ่าน 100%' : 'ตอบผิด — เริ่มใหม่'}</h2><p>{result === 'passed' ? `คุณผ่านครบทั้ง ${totalQuestions} ข้อ` : `เพื่อผ่านด่านนี้ ต้องตอบถูกครบ ${totalQuestions} ข้อติดต่อกัน`}</p><button onClick={reset}>{result === 'passed' ? 'กลับไปเลือกชุด' : 'เริ่มสอบใหม่'}</button></section> : <section className="game-card"><header><span>ข้อ {index + 1} / {totalQuestions}</span><b>เป้าหมาย 100%</b></header><p className="exam-question-type">{labels[type]}</p><p className="game-prompt">{type === 'meaning' ? item.hanzi : item.thai}</p>{type === 'meaning' ? <div className="game-choices">{choices.map((choice, choiceIndex) => <button key={`${choice}-${choiceIndex}`} onClick={() => answer(choice === item.thai)}>{choice}</button>)}</div> : <form onSubmit={(event) => { event.preventDefault(); submit(); }}><label>{type === 'hanzi' ? 'พิมพ์ตัวจีนให้ถูกต้อง' : 'พิมพ์พินอินพร้อมเลขวรรณยุกต์'}</label><input aria-label="พิมพ์คำตอบสอบ" autoCapitalize="none" value={input} onChange={(event) => setInput(event.target.value)} placeholder={type === 'hanzi' ? 'พิมพ์ตัวจีน' : `เช่น ${numberedPinyin(item.pinyin)}`} /><button>ส่งคำตอบ</button></form>}</section>}</main>;
}
