import { curriculum } from '@/app/lib/curriculum/load';
import { bangkokDate, getAdaptivePlan } from '@/app/lib/planning/adaptive-plan';
export type DashboardSnapshot = { signedIn: boolean; recommendedSets: number; daysRemaining: number; totalSets: number; completedSets: number; studyingSets: number; notStartedSets: number; studiedWords: number; rememberedWords: number; learningWords: number; difficultWords: number; resumeSetId: string; currentStage: 'study' | 'meaning' | 'hanzi' | 'tones' | 'complete' };
export function createDashboardSnapshot(input: Partial<DashboardSnapshot> & { today?: string; recentDailyRates?: number[] } = {}): DashboardSnapshot {
  const completedSets = input.completedSets ?? 0; const studyingSets = input.studyingSets ?? 0; const plan = getAdaptivePlan({ today: input.today ?? bangkokDate(), target: curriculum.targetDate, remainingSets: curriculum.sets.length - completedSets, recentDailyRates: input.recentDailyRates ?? [] });
  return { signedIn: input.signedIn ?? false, recommendedSets: input.recommendedSets ?? plan.recommendedSets, daysRemaining: plan.daysRemaining, totalSets: 60, completedSets, studyingSets, notStartedSets: 60 - completedSets - studyingSets, studiedWords: input.studiedWords ?? 0, rememberedWords: input.rememberedWords ?? 0, learningWords: input.learningWords ?? 0, difficultWords: input.difficultWords ?? 0, resumeSetId: input.resumeSetId ?? curriculum.sets[Math.min(completedSets, 59)].id, currentStage: input.currentStage ?? 'study' };
}

export async function getDashboardForUser(userId:string):Promise<DashboardSnapshot>{
  const[{getD1},{ensureCurriculumSeeded}]=await Promise.all([import('@/app/lib/db/env'),import('@/app/lib/curriculum/seed')]);
  const db=getD1();await ensureCurriculumSeeded(db,curriculum);
  const [sets,words,statuses,latest]=await Promise.all([
    db.prepare('SELECT COUNT(*) AS total FROM user_set_progress WHERE user_id=? AND completed_at IS NOT NULL').bind(userId).first<{total:number}>(),
    db.prepare('SELECT COUNT(*) AS total FROM user_word_progress WHERE user_id=?').bind(userId).first<{total:number}>(),
    db.prepare('SELECT status,COUNT(*) AS total FROM user_word_progress WHERE user_id=? GROUP BY status').bind(userId).all<{status:string;total:number}>(),
    db.prepare('SELECT set_id FROM user_word_progress WHERE user_id=? ORDER BY updated_at DESC LIMIT 1').bind(userId).first<{set_id:string}>(),
  ]);
  const completedSets=Number(sets?.total??0);const counts=new Map(statuses.results.map(row=>[row.status,Number(row.total)]));const resumeSetId=latest?.set_id??curriculum.sets[Math.min(completedSets,59)].id;
  const active=await db.prepare('SELECT COUNT(DISTINCT set_id) AS total FROM user_word_progress WHERE user_id=? AND set_id NOT IN (SELECT set_id FROM user_set_progress WHERE user_id=? AND completed_at IS NOT NULL)').bind(userId,userId).first<{total:number}>();
  return createDashboardSnapshot({signedIn:true,completedSets,studyingSets:Number(active?.total??0),studiedWords:Number(words?.total??0),rememberedWords:counts.get('remembered')??0,learningWords:counts.get('learning')??0,difficultWords:counts.get('difficult')??0,resumeSetId});
}
