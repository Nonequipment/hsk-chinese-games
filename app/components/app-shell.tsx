import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, BookOpenText, House, UserRound } from "lucide-react";

const navItems = [
  { id: "home", label: "หน้าหลัก", href: "/", Icon: House },
  { id: "library", label: "คลังศัพท์", href: "/library", Icon: BookOpenText },
  { id: "learn", label: "เรียน", href: "/learn", Icon: BarChart3 },
  { id: "profile", label: "โปรไฟล์", href: "/profile", Icon: UserRound },
] as const;

export function AppShell({ children, active = "home" }: { children: ReactNode; active?: string }) {
  return (
    <div data-testid="app-shell" data-theme="modern-chinese-light" className="min-h-dvh overflow-x-hidden bg-[#f5f9ff] text-slate-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(147,197,253,.34),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(219,234,254,.72),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]" />
      <header className="relative border-b border-blue-100/80 bg-white/85 shadow-[0_1px_20px_rgba(30,64,175,.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-blue-950"><span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-xl text-white shadow-lg shadow-blue-500/20">学</span><span>HSK Mission</span></Link>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">เป้าหมาย 17 ต.ค. 2026</span>
        </div>
      </header>
      <main className="relative">{children}</main>
      <nav aria-label="เมนูหลัก" className="fixed inset-x-0 bottom-0 z-20 border-t border-blue-100 bg-white/95 px-[max(.5rem,env(safe-area-inset-left))] pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(30,64,175,.08)] backdrop-blur-xl sm:left-1/2 sm:bottom-5 sm:w-[min(34rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:border-blue-100">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(({ id, label, href, Icon }) => <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition focus-visible:outline-2 focus-visible:outline-blue-500 ${active === id ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-500 hover:bg-blue-50 hover:text-blue-800"}`}><Icon className="size-5" aria-hidden="true" /><span>{label}</span></Link>)}
        </div>
      </nav>
    </div>
  );
}
