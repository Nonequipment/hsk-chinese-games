export type PlanInput = { today: string; target: string; remainingSets: number; recentDailyRates: number[] };
export type AdaptivePlan = { mode: 'complete' | 'deadline' | 'continue'; recommendedSets: number; daysRemaining: number };
const dayNumber = (value: string) => Math.floor(Date.parse(`${value}T00:00:00Z`) / 86_400_000);
export function getAdaptivePlan(input: PlanInput): AdaptivePlan {
  if (input.remainingSets === 0) return { mode: 'complete', recommendedSets: 0, daysRemaining: Math.max(0, dayNumber(input.target) - dayNumber(input.today) + 1) };
  const days = dayNumber(input.target) - dayNumber(input.today) + 1;
  if (days > 0) return { mode: 'deadline', recommendedSets: Math.ceil(input.remainingSets / days), daysRemaining: days };
  const recent = input.recentDailyRates.filter(rate => rate > 0).slice(-7);
  const average = recent.length ? recent.reduce((sum, rate) => sum + rate, 0) / recent.length : 1;
  return { mode: 'continue', recommendedSets: Math.max(1, Math.ceil(average)), daysRemaining: 0 };
}
export function bangkokDate(now = new Date()): string { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
