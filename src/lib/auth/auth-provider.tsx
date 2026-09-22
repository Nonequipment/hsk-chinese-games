import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getSupabaseClient } from '../supabase/client';

type AuthApi = {
  getSession: () => Promise<{ data: { session: { user: { id: string; email?: string } } | null } }>;
  onAuthStateChange: (listener: (_event: string, session: { user: { id: string; email?: string } } | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
  signUp: (input: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signInWithPassword: (input: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<unknown>;
};

type AuthClient = { auth: AuthApi } | null;
type AuthValue = { client: AuthClient; username: string | null; signUp: (email: string, password: string) => Promise<void>; signIn: (email: string, password: string) => Promise<void> };
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
  useEffect(() => {
    if (!client) return;
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    return client.auth.onAuthStateChange((_event, next) => setSession(next)).data.subscription.unsubscribe;
  }, [client]);
  const value = useMemo<AuthValue>(() => ({
    client,
    username: sessionUsername(session),
    signUp: async (username, password) => { if (password.length < 8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); if (!client) throw new Error('การซิงก์ข้ามอุปกรณ์ยังไม่พร้อมใช้งาน'); const { error } = await client.auth.signUp({ email: usernameEmail(username), password }); if (error) throw error; },
    signIn: async (username, password) => { if (!client) throw new Error('การซิงก์ข้ามอุปกรณ์ยังไม่พร้อมใช้งาน'); const { error } = await client.auth.signInWithPassword({ email: usernameEmail(username), password }); if (error) throw error; },
  }), [client, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
