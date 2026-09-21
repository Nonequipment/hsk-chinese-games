import { AppShell } from '@/app/components/app-shell';
import { Dashboard } from '@/app/components/dashboard/dashboard';
import { SignInCard } from '@/app/components/auth/sign-in-card';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { createDashboardSnapshot,getDashboardForUser } from '@/app/lib/dashboard/service';

export default async function HomePage() {
  const user = await getChatGPTUser();
  const snapshot = user ? await getDashboardForUser(user.userId) : createDashboardSnapshot();
  return <AppShell active="home"><section className="mx-auto w-full max-w-6xl px-4 pb-28 pt-7 sm:px-6 sm:pt-10"><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[.24em] text-cyan-300">Adaptive Mission Control</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl">HSK 4.0 · 1,200 คำ</h1><p className="mt-2 text-slate-400">{user ? `พร้อมเรียนต่อแล้ว ${user.displayName}` : 'แผนเรียนปรับใหม่ทุกวันตามความก้าวหน้าของคุณ'}</p></div><Dashboard snapshot={snapshot} />{!user && <div className="mt-4"><SignInCard /></div>}</section></AppShell>;
}
