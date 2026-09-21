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
    <div className="min-h-dvh overflow-x-hidden bg-[#050817] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,.24),transparent_36%),radial-gradient(circle_at_85%_18%,rgba(124,58,237,.2),transparent_32%)]" />
      <header className="relative border-b border-white/10 bg-[#050817]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-xl shadow-lg shadow-blue-500/20">学</span><span>HSK Mission</span></Link>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">เป้าหมาย 17 ต.ค. 2026</span>
        </div>
      </header>
      <main className="relative">{children}</main>
      <nav aria-label="เมนูหลัก" className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#080d20]/95 px-[max(.5rem,env(safe-area-inset-left))] pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:left-1/2 sm:bottom-5 sm:w-[min(34rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-2xl sm:border">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(({ id, label, href, Icon }) => <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${active === id ? "bg-blue-500/20 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon className="size-5" aria-hidden="true" /><span>{label}</span></Link>)}
        </div>
      </nav>
    </div>
  );
}
