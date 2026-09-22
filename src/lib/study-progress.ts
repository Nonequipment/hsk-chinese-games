export function readRemembered(): string[] { return JSON.parse(localStorage.getItem('hsk-mission-remembered') ?? '[]') as string[]; }
export function markItemRemembered(ids: string[], itemId: string) { return [...new Set([...ids, itemId])]; }
export function canOpenExam(remembered: string[], itemIds: string[]) { const known = new Set(remembered); return itemIds.length > 0 && itemIds.every((id) => known.has(id)); }
export function getNextLearningSet(remembered: string[], sets: string[][]) { const index = sets.findIndex((items) => !canOpenExam(remembered, items)); return index === -1 ? sets.length - 1 : index; }
const completedSetsKey = 'hsk-mission-exam-passed-sets';

export function readCompletedSets(): string[] { return JSON.parse(localStorage.getItem(completedSetsKey) ?? '[]') as string[]; }
export function markSetCompleted(setIds: string[], setId: string) { const completed = [...new Set([...setIds, setId])]; localStorage.setItem(completedSetsKey, JSON.stringify(completed)); return completed; }

export function getDailySetPlan({ completedSets, totalSets, targetDate, today = new Date() }: { completedSets: number; totalSets: number; targetDate: string; today?: Date }) {
  const remainingSets = Math.max(0, totalSets - completedSets);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${targetDate}T00:00:00`);
  const remainingDays = Math.max(1, Math.ceil((target.getTime() - start.getTime()) / 86_400_000));
  const setsPerDay = remainingSets === 0 ? 0 : Math.ceil(remainingSets / remainingDays);
  return { remainingSets, remainingDays, setsPerDay, wordsPerDay: setsPerDay * 20 };
}
