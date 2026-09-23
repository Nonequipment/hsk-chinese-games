export type RemoteProgress = { remembered: string[]; passedSets: string[] };
type DatabaseClient = { from: (table: string) => any };

export async function loadRemoteProgress(client: DatabaseClient, userId: string): Promise<RemoteProgress> {
  const [words, sets] = await Promise.all([
    client.from('study_progress').select('word_id').eq('user_id', userId),
    client.from('set_progress').select('set_id').eq('user_id', userId).not('passed_at', 'is', null),
  ]);
  if (words.error) throw words.error;
  if (sets.error) throw sets.error;
  return { remembered: (words.data ?? []).map((row: { word_id: string }) => row.word_id), passedSets: (sets.data ?? []).map((row: { set_id: string }) => row.set_id) };
}

export async function saveRememberedWord(client: DatabaseClient, input: { userId: string; wordId: string; setId: string; studiedCount: number; totalWords: number }) {
  const [word, set] = await Promise.all([
    client.from('study_progress').upsert({ user_id: input.userId, word_id: input.wordId, set_id: input.setId, last_mode: 'learn' }, { onConflict: 'user_id,word_id' }),
    client.from('set_progress').upsert({ user_id: input.userId, set_id: input.setId, studied_count: input.studiedCount, is_study_complete: input.studiedCount >= input.totalWords, exam_unlocked_at: input.studiedCount >= input.totalWords ? new Date().toISOString() : null }, { onConflict: 'user_id,set_id' }),
  ]);
  if (word.error) throw word.error;
  if (set.error) throw set.error;
}

export async function savePassedSet(client: DatabaseClient, input: { userId: string; setId: string; totalWords: number }) {
  const { error } = await client.from('set_progress').upsert({ user_id: input.userId, set_id: input.setId, studied_count: input.totalWords, is_study_complete: true, exam_unlocked_at: new Date().toISOString(), passed_at: new Date().toISOString() }, { onConflict: 'user_id,set_id' });
  if (error) throw error;
}
