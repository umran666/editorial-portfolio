"use client";

import Link from "next/link";

interface EditorialHeroProps {
  totalSystems: number;
  totalArticles: number;
}

export function EditorialHero({ totalSystems, totalArticles }: EditorialHeroProps) {
  const scrollToTimeline = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("timeline");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full border-b border-white/10 bg-stone-950 text-stone-100 min-h-[85vh] md:min-h-[90vh] py-10 md:py-16 overflow-hidden flex flex-col justify-between">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col justify-between grow">
        {/* Top Status & Telemetry Bar */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono uppercase tracking-widest text-stone-500 animate-hero-fade">
          <div className="flex items-center gap-3">
            <span className="text-stone-300 font-bold">SHA-2026 // INDEX</span>
            <span className="text-stone-700">|</span>
            <span className="text-stone-400">
              {totalSystems} Systems · {totalArticles} Monographs
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline text-stone-600">
              COORD: 13.6288° N, 79.4192° E
            </span>
            <span className="text-stone-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE ARCHIVE
            </span>
          </div>
        </div>

        {/* Main Massive Editorial Typography Hero */}
        <div className="my-auto py-8 md:py-12 flex flex-col gap-8 md:gap-10 animate-hero-fade-delay-1">
          <div className="space-y-2 md:space-y-4">
            <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-stone-400 font-medium">
              AI/ML Researcher & Software Engineer
            </p>
            <h1 className="font-geist font-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter uppercase leading-[0.88] text-stone-100 select-none break-words">
              Shaik Umran
            </h1>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl sm:text-3xl md:text-5xl font-geist font-semibold tracking-tight text-stone-300">
              <span>Tokenizers, Model Behavior</span>
              <span className="font-light text-stone-600">&</span>
              <span className="text-stone-100">Inference Systems</span>
            </div>
          </div>

          {/* Plain-language description of the work in this archive */}
          <p className="font-sans text-base sm:text-lg md:text-xl text-stone-300 max-w-3xl leading-relaxed font-normal">
            I work on the parts of language models that usually disappear behind an API: how text
            becomes tokens, how cache memory grows during generation, and what changes when a
            concept is removed from a diffusion model. This archive holds the code, experiments,
            and notes.
          </p>

          {/* Monospace Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-850 font-mono text-xs animate-hero-fade-delay-2">
            <div className="space-y-1">
              <span className="text-stone-500 uppercase tracking-widest text-[10px] block">
                Core Discipline
              </span>
              <p className="text-stone-200 font-medium">NLP & Tokenizers</p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-500 uppercase tracking-widest text-[10px] block">
                Inference Runtime
              </span>
              <p className="text-stone-200 font-medium">KV-Cache & Latency</p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-500 uppercase tracking-widest text-[10px] block">
                Deep Learning
              </span>
              <p className="text-stone-200 font-medium">Diffusion Models</p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-500 uppercase tracking-widest text-[10px] block">
                Credentials
              </span>
              <p className="text-stone-200 font-medium whitespace-nowrap">B.Tech CSE · 9.11 CGPA</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Quick Node Coordinates & Scroll Action */}
        <div className="w-full pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono animate-hero-fade-delay-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-stone-400">
            <span className="text-stone-500 uppercase tracking-wider text-[11px]">Primary Nodes:</span>
            <Link
              href="/projects/uniqtoken"
              className="hover:text-stone-100 underline decoration-stone-700 underline-offset-4 transition-colors"
            >
              [01] UniqToken
            </Link>
            <Link
              href="/projects/diffusion-gemma"
              className="hover:text-stone-100 underline decoration-stone-700 underline-offset-4 transition-colors"
            >
              [02] DiffusionGemma
            </Link>
            <Link
              href="/projects/uniqkache"
              className="hover:text-stone-100 underline decoration-stone-700 underline-offset-4 transition-colors"
            >
              [03] UniqKache
            </Link>
          </div>

          <a
            href="#timeline"
            onClick={scrollToTimeline}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-300 hover:text-white transition-colors group cursor-pointer"
          >
            <span>Explore Archival Timeline</span>
            <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
