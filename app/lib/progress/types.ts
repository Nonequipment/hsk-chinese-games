export type MemoryStatus = 'remembered' | 'learning' | 'difficult';
export type ExamStage = 'meaning' | 'hanzi' | 'tones';
export type SetProgress = { setId: string; studiedCount: number; examUnlocked: boolean; passedStages: ExamStage[]; completed: boolean };
export type CardStudyInput = { userId: string; itemId: string; setId: string; status: MemoryStatus; requestId: string };
export type GameAttemptInput = { id: string; userId: string; setId: string; mode: string; score: number; missedItemIds: string[] };
export type SubmitExamInput = { userId: string; attemptId: string; answers: Record<string, string> };
export type ExamResult = { score: number; total: number; passed: boolean; missedItemIds: string[] };
