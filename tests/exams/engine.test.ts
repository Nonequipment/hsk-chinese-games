import { canStartExam,createExam } from '@/app/lib/exams/engine'; import { gradeExam } from '@/app/lib/exams/grading'; import { getSet } from '@/app/lib/curriculum/load';
const items=getSet('S01')!.items;const ids=items.map(i=>i.id);
it('locks exams until all 20 cards are studied',()=>expect(canStartExam({studiedItemIds:ids.slice(0,19),setItemIds:ids})).toBe(false));
it('requires a perfect stage score',()=>{expect(gradeExam(Array.from({length:20},(_,i)=>i<19)).passed).toBe(false);expect(gradeExam(Array(20).fill(true)).passed).toBe(true)});
it('never exposes pinyin in meaning questions',()=>{const exam=createExam({stage:'meaning',items,seed:1});expect(exam.questions).toHaveLength(20);expect(exam.questions.every(q=>!('pinyin'in q.prompt))).toBe(true)});
