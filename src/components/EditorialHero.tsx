"use client";

import Link from "next/link";

interface EditorialHeroProps {
  totalProjects: number;
  totalNotes: number;
}

export function EditorialHero({ totalProjects, totalNotes }: EditorialHeroProps) {
  const scrollToTimeline = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-stone-950 text-stone-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="relative mx-auto grid min-h-[78vh] w-full max-w-7xl gap-12 px-4 py-12 sm:px-6 md:min-h-[82vh] md:px-8 md:py-16 lg:grid-cols-[1.35fr_0.65fr] lg:gap-20 lg:px-12 lg:py-20">
        <div className="flex flex-col justify-between gap-12">
          <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.28em] text-stone-500">
            <span className="text-stone-300">AI RESEARCH LAB // 01</span>
            <span>FIELD JOURNAL · 2026</span>
          </div>

          <div className="max-w-4xl">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-blue-300/80">
              Tokenization · inference memory · model behavior
            </p>
            <h1 className="max-w-5xl font-geist text-[clamp(3.25rem,9vw,8.5rem)] font-black uppercase leading-[0.86] tracking-[-0.075em] text-stone-100">
              Research
              <br />
              <span className="text-stone-500">in public.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-stone-300 sm:text-lg md:text-xl">
              A working record of the code, experiments, failures, and questions behind small AI systems. I study what happens below the prompt surface: how text becomes tokens, where generation memory goes, and how controlled changes alter model behavior.
            </p>
          </div>

          <div className="flex flex-col gap-6 border-t border-stone-800 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-2 gap-x-10 gap-y-5 font-mono text-xs sm:grid-cols-4">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-stone-600">Projects</span>
                <span className="mt-1 block text-stone-200">{String(totalProjects).padStart(2, "0")}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-stone-600">Notes</span>
                <span className="mt-1 block text-stone-200">{String(totalNotes).padStart(2, "0")}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-stone-600">Stack</span>
                <span className="mt-1 block text-stone-200">Python / Rust</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-stone-600">Mode</span>
                <span className="mt-1 block text-blue-300">Evidence-led</span>
              </div>
            </div>
            <a
              href="#timeline"
              onClick={scrollToTimeline}
              className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-stone-300 transition-colors hover:text-white"
            >
              Open lab log <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <aside className="self-end border border-stone-800 bg-stone-900/60 p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="text-stone-500">Working threads</span>
            <span className="text-blue-300">open</span>
          </div>
          <div className="divide-y divide-stone-800">
            <Link href="/projects/uniqtoken" className="group block py-5">
              <span className="font-mono text-[10px] text-stone-600">01 / TOKENIZATION</span>
              <span className="mt-2 block font-geist text-xl font-bold tracking-tight text-stone-100 transition-colors group-hover:text-blue-200">UniqToken</span>
              <span className="mt-2 block text-sm leading-relaxed text-stone-400">Vocabulary construction, Unicode boundaries, and tokenizer evidence.</span>
            </Link>
            <Link href="/projects/uniqkache" className="group block py-5">
              <span className="font-mono text-[10px] text-stone-600">02 / INFERENCE MEMORY</span>
              <span className="mt-2 block font-geist text-xl font-bold tracking-tight text-stone-100 transition-colors group-hover:text-blue-200">UniqKache</span>
              <span className="mt-2 block text-sm leading-relaxed text-stone-400">A notebook on KV-cache geometry and long-context trade-offs.</span>
            </Link>
            <Link href="/projects/diffusion-gemma" className="group block py-5">
              <span className="font-mono text-[10px] text-stone-600">03 / MODEL BEHAVIOR</span>
              <span className="mt-2 block font-geist text-xl font-bold tracking-tight text-stone-100 transition-colors group-hover:text-blue-200">DiffusionGemma</span>
              <span className="mt-2 block text-sm leading-relaxed text-stone-400">Controlled interventions, representation questions, and limits.</span>
            </Link>
          </div>
          <p className="border-t border-stone-800 pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-wider text-stone-600">
            No finished-product theatre. Results appear when the method and evidence can be shown.
          </p>
        </aside>
      </div>
    </section>
  );
}
