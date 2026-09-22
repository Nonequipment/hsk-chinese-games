import { expect, it } from 'vitest';
import { canOpenExam, getDailySetPlan, getNextLearningSet, markItemRemembered } from '../../src/lib/study-progress';

it('requires every item in a set before opening an exam or the next set', () => {
  const items = ['V1', 'V2'];
  const partial = markItemRemembered([], 'V1');
  expect(canOpenExam(partial, items)).toBe(false);
  expect(getNextLearningSet(partial, [['V1', 'V2'], ['V3']])).toBe(0);
  const complete = markItemRemembered(partial, 'V2');
  expect(canOpenExam(complete, items)).toBe(true);
  expect(getNextLearningSet(complete, [['V1', 'V2'], ['V3']])).toBe(1);
});

it('plans the remaining sets per day through the target date', () => {
  expect(getDailySetPlan({ completedSets: 5, totalSets: 60, targetDate: '2026-10-17', today: new Date('2026-09-22') })).toEqual({ remainingSets: 55, remainingDays: 25, setsPerDay: 3, wordsPerDay: 60 });
});
