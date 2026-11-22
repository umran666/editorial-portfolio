import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllQuotes, getSiteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Axioms & Field Notes — Shaik Umran",
  description: "A curated collection of philosophical, literary, and computing aphorisms on craft, attention, and simplicity.",
};

export default async function QuotesPage() {
  const { config } = await getSiteConfig();
  const quotes = getAllQuotes();

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <main className="grow w-full flex flex-col">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 flex flex-col gap-12 pb-24">
          <section className="text-left border-b border-stone-850 pb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
              PHILOSOPHICAL AXIOMS & FIELD NOTES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight text-stone-100 font-geist">
              Axioms & Fragments
            </h1>
            <p className="text-stone-400 font-sans text-base md:text-lg max-w-2xl mt-2 font-normal">
              Lines and fragments on computation, information theory, monastic stillness, and system simplicity.
            </p>
          </section>

          <div className="flex flex-col gap-10">
            {quotes.map((q) => (
              <figure
                key={q.id}
                id={q.id}
                className="group flex flex-col gap-4 border-l-2 border-stone-800 pl-6 py-2 transition-all hover:border-stone-400"
              >
                <blockquote className="font-sans text-xl md:text-2xl text-stone-200 leading-relaxed italic font-normal">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-500 uppercase tracking-wider font-medium">
                  <span className="text-stone-200 font-bold">{q.author}</span>
                  {q.source && (
                    <>
                      <span className="text-stone-700">·</span>
                      <cite className="not-italic text-stone-400">{q.source}</cite>
                    </>
                  )}
                  {q.date && (
                    <>
                      <span className="text-stone-700">·</span>
                      <span>{q.date}</span>
                    </>
                  )}
                  <span className="text-stone-700">·</span>
                  <span className="rounded-xs bg-stone-900 px-2 py-0.5 text-[10px] text-stone-400 border border-stone-800">
                    {q.category}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </main>

      <Footer config={config} />
    </div>
  );
}
