import { getAdaptivePlan } from '@/app/lib/planning/adaptive-plan';
it('recalculates the mission around the Bangkok deadline', () => {
  expect(getAdaptivePlan({ today: '2026-10-16', target: '2026-10-17', remainingSets: 3, recentDailyRates: [] }).recommendedSets).toBe(2);
  expect(getAdaptivePlan({ today: '2026-10-17', target: '2026-10-17', remainingSets: 3, recentDailyRates: [] }).recommendedSets).toBe(3);
  expect(getAdaptivePlan({ today: '2026-10-18', target: '2026-10-17', remainingSets: 3, recentDailyRates: [2, 1] }).recommendedSets).toBe(2);
  expect(getAdaptivePlan({ today: '2026-09-21', target: '2026-10-17', remainingSets: 0, recentDailyRates: [] }).recommendedSets).toBe(0);
});
