import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getSupabaseClient } from '../supabase/client';

type AuthApi = {
  getSession: () => Promise<{ data: { session: { user: { id: string; email?: string } } | null } }>;
  onAuthStateChange: (listener: (_event: string, session: { user: { id: string; email?: string } } | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
  signInWithOtp: (input: { email: string; options: { shouldCreateUser: boolean } }) => Promise<{ error: Error | null }>;
  verifyOtp: (input: { email: string; token: string; type: 'email' }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<unknown>;
};

type AuthClient = { auth: AuthApi } | null;
type AuthValue = { client: AuthClient; sendOtp: (email: string) => Promise<void>; verifyOtp: (email: string, token: string) => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children, client = getSupabaseClient() as AuthClient }: PropsWithChildren<{ client?: AuthClient }>) {
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  useEffect(() => {
    if (!client) return;
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    return client.auth.onAuthStateChange((_event, next) => setSession(next)).data.subscription.unsubscribe;
  }, [client]);
  const value = useMemo<AuthValue>(() => ({
    client,
    sendOtp: async (email) => { if (!client) throw new Error('การซิงก์ข้ามอุปกรณ์ยังไม่พร้อมใช้งาน'); const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } }); if (error) throw error; },
    verifyOtp: async (email, token) => { if (!/^\d{6}$/.test(token)) throw new Error('กรอกรหัส 6 หลัก'); if (!client) throw new Error('การซิงก์ข้ามอุปกรณ์ยังไม่พร้อมใช้งาน'); const { error } = await client.auth.verifyOtp({ email, token, type: 'email' }); if (error) throw error; },
  }), [client, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
