import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CinematicStudioIntro } from "@/components/CinematicStudioIntro";
import { EditorialHero } from "@/components/EditorialHero";
import { ArchivalTimeline } from "@/components/ArchivalTimeline";
import {
  getAllArticles,
  getAllProjects,
  getAllQuotes,
  getSiteConfig,
} from "@/lib/content";

export default async function HomePage() {
  const { config } = await getSiteConfig();
  const allArticles = getAllArticles();
  const allProjects = getAllProjects();
  const allQuotes = getAllQuotes();

  const curatedQuotes = allQuotes.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      {/* 1. Monochromatic Precision Navigation */}
      <Header siteTitle={config.siteTitle} />

      {/* 2. Kinetic Brutalist Studio Experience (Opening Gate & Draggable Runway Reel) */}
      <CinematicStudioIntro projects={allProjects} articles={allArticles} />

      {/* 3. Striking Full-Screen Opening Hero (Oversized Geist typography, Inter body, JetBrains Mono telemetry) */}
      <EditorialHero
        totalSystems={allProjects.length}
        totalArticles={allArticles.length}
      />

      <main className="grow w-full flex flex-col">
        {/* 3. Archival Research, Systems & Monograph Timeline */}
        <ArchivalTimeline projects={allProjects} articles={allArticles} />

        {/* 4. Axioms & Field Notes (Curated Monochromatic Observations) */}
        <section className="w-full border-t border-stone-850 py-16 md:py-20 bg-stone-950">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-stone-850">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
                  FRAGMENTS & PHILOSOPHY
                </span>
                <h2 className="font-geist font-bold text-2xl sm:text-3xl text-stone-100 tracking-tight">
                  Axioms & Ground Principles
                </h2>
              </div>
              <Link
                href="/quotes"
                className="font-mono text-xs uppercase tracking-wider text-stone-400 hover:text-white underline decoration-stone-700 underline-offset-4 transition-colors"
              >
                All Axioms [{allQuotes.length}] →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              {curatedQuotes.map((q) => (
                <div
                  key={q.id}
                  className="space-y-4 p-6 rounded-xs border border-stone-850 bg-stone-900/40 flex flex-col justify-between hover:border-stone-700 transition-colors"
                >
                  <blockquote className="font-sans text-stone-300 text-sm md:text-base leading-relaxed italic">
                    &ldquo;{q.quote}&rdquo;
                  </blockquote>
                  <div className="pt-4 border-t border-stone-850/60 font-mono text-xs text-stone-500 flex justify-between items-center">
                    <span className="text-stone-300 font-semibold">{q.author}</span>
                    <span className="text-[11px] text-stone-500">{q.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 5. Minimalist Archival Footer */}
      <Footer config={config} />
    </div>
  );
}
