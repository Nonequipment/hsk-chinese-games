import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getSupabaseClient } from '../supabase/client';
import { loadRemoteProgress, savePassedSet, saveRememberedWord } from '../progress-sync';

type AuthApi = {
  getSession: () => Promise<{ data: { session: { user: { id: string; email?: string } } | null } }>;
  onAuthStateChange: (listener: (_event: string, session: { user: { id: string; email?: string } } | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
  signUp: (input: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signInWithPassword: (input: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<unknown>;
};

type AuthClient = { auth: AuthApi; from?: (table: string) => any } | null;
type AuthValue = { client: AuthClient; username: string | null; userId: string | null; progress: { remembered: string[]; passedSets: string[] }; signUp: (email: string, password: string) => Promise<void>; signIn: (email: string, password: string) => Promise<void>; rememberWord: (input: { wordId: string; setId: string; studiedCount: number; totalWords: number }) => void; passSet: (input: { setId: string; totalWords: number }) => void };
const AuthContext = createContext<AuthValue | null>(null);

function usernameEmail(username: string) {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(normalized)) throw new Error('ชื่อผู้ใช้ใช้ตัวอักษรอังกฤษ ตัวเลข . _ หรือ - และยาว 3–30 ตัว');
  return `${normalized}@hsk.local`;
}

function sessionUsername(session: { user: { email?: string } } | null) {
  const email = session?.user.email;
  return email?.endsWith('@hsk.local') ? email.slice(0, -'@hsk.local'.length) : null;
}

export function AuthProvider({ children, client = getSupabaseClient() as AuthClient }: PropsWithChildren<{ client?: AuthClient }>) {
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [progress, setProgress] = useState({ remembered: [] as string[], passedSets: [] as string[] });
  useEffect(() => {
    if (!client) return;
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    return client.auth.onAuthStateChange((_event, next) => setSession(next)).data.subscription.unsubscribe;
  }, [client]);
  useEffect(() => {
    if (!client?.from || !session) { setProgress({ remembered: [], passedSets: [] }); return; }
    let active = true;
    void loadRemoteProgress(client as Required<AuthClient>, session.user.id).then((remote) => {
      if (!active) return;
      const migrationKey = `hsk-mission-progress-migrated-${session.user.id}`;
      const localRemembered = JSON.parse(localStorage.getItem('hsk-mission-remembered') ?? '[]') as string[];
      const localPassed = JSON.parse(localStorage.getItem('hsk-mission-exam-passed-sets') ?? '[]') as string[];
      const importLocal = !localStorage.getItem(migrationKey);
      const remembered = [...new Set([...remote.remembered, ...(importLocal ? localRemembered : [])])];
      const passedSets = [...new Set([...remote.passedSets, ...(importLocal ? localPassed : [])])];
      localStorage.setItem('hsk-mission-remembered', JSON.stringify(remembered));
      localStorage.setItem('hsk-mission-exam-passed-sets', JSON.stringify(passedSets));
      setProgress({ remembered, passedSets });
      if (importLocal) {
        const wordsBySet = localRemembered.reduce<Record<string, string[]>>((groups, wordId) => { const setId = `S${String(Math.ceil(Number(wordId.slice(1)) / 20)).padStart(2, '0')}`; (groups[setId] ??= []).push(wordId); return groups; }, {});
        void Promise.all([
          ...Object.entries(wordsBySet).flatMap(([setId, wordIds]) => wordIds.map((wordId) => saveRememberedWord(client as Required<AuthClient>, { userId: session.user.id, wordId, setId, studiedCount: wordIds.length, totalWords: 20 }))),
          ...localPassed.map((setId) => savePassedSet(client as Required<AuthClient>, { userId: session.user.id, setId, totalWords: 20 })),
        ]).then(() => localStorage.setItem(migrationKey, 'true')).catch(() => undefined);
      }
    }).catch(() => { if (active) setProgress({ remembered: [], passedSets: [] }); });
    return () => { active = false; };
  }, [client, session?.user.id]);
  const value = useMemo<AuthValue>(() => ({
    client,
    username: sessionUsername(session),
    userId: session?.user.id ?? null,
    progress,
    signUp: async (username, password) => { if (password.length < 8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); if (!client) throw new Error('การซิงก์ข้ามอุปกรณ์ยังไม่พร้อมใช้งาน'); const { error } = await client.auth.signUp({ email: usernameEmail(username), password }); if (error) throw error; },
    signIn: async (username, password) => { if (!client) throw new Error('การซิงก์ข้ามอุปกรณ์ยังไม่พร้อมใช้งาน'); const { error } = await client.auth.signInWithPassword({ email: usernameEmail(username), password }); if (error) throw error; },
    rememberWord: (input) => { if (!client?.from || !session) return; setProgress((current) => ({ ...current, remembered: [...new Set([...current.remembered, input.wordId]) ] })); void saveRememberedWord(client as Required<AuthClient>, { userId: session.user.id, ...input }).catch(() => undefined); },
    passSet: (input) => { if (!client?.from || !session) return; setProgress((current) => ({ ...current, passedSets: [...new Set([...current.passedSets, input.setId]) ] })); void savePassedSet(client as Required<AuthClient>, { userId: session.user.id, ...input }).catch(() => undefined); },
  }), [client, session, progress]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
