export function readRemembered(): string[] { return JSON.parse(localStorage.getItem('hsk-mission-remembered') ?? '[]') as string[]; }
export function markItemRemembered(ids: string[], itemId: string) { return [...new Set([...ids, itemId])]; }
export function canOpenExam(remembered: string[], itemIds: string[]) { const known = new Set(remembered); return itemIds.length > 0 && itemIds.every((id) => known.has(id)); }
export function getNextLearningSet(remembered: string[], sets: string[][]) { const index = sets.findIndex((items) => !canOpenExam(remembered, items)); return index === -1 ? sets.length - 1 : index; }
