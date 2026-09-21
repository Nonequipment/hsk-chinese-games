import { AppShell } from "@/app/components/app-shell";

export default function HomePage() {
  return (
    <AppShell active="home">
      <section className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-12">
        <div className="mission-grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-xl sm:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Adaptive Mission Control</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
            HSK 4.0 <span className="text-gradient">1,200 คำ</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">เรียนคำศัพท์จีนครบ 60 เซ็ต พร้อมแผนที่ปรับตามความก้าวหน้าของคุณทุกวัน</p>
          <a className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-500 px-6 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300" href="/learn">เริ่มภารกิจ Day 1</a>
        </div>
      </section>
    </AppShell>
  );
}
