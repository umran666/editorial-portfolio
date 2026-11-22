import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllTags, getSiteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Taxonomy Index & Topics — Shaik Umran",
  description: "Browse all topics, systems domains, and themes indexed across essays and case studies.",
};

export default async function TagsIndexPage() {
  const { config } = await getSiteConfig();
  const tags = getAllTags();

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <main className="grow w-full flex flex-col">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 flex flex-col gap-10 pb-24">
          <section className="text-left border-b border-stone-850 pb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
              RESEARCH TAXONOMY & KEYWORD GRAPH
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight text-stone-100 font-geist">
              Taxonomy Index
            </h1>
            <p className="text-stone-400 font-sans text-base md:text-lg max-w-2xl mt-2 font-normal">
              An index of all subjects, research disciplines, and concepts explored across systems and writing.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className="flex items-center justify-between p-4 rounded-xs border border-stone-850 bg-stone-900/40 hover:border-stone-700 hover:bg-stone-900 transition-all group"
              >
                <span className="font-medium text-stone-300 group-hover:text-white uppercase tracking-wider">
                  #{tag.name}
                </span>
                <span className="text-[11px] text-stone-500 bg-stone-800 px-2 py-0.5 rounded-xs transition-colors">
                  {tag.count} {tag.count === 1 ? "entry" : "entries"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer config={config} />
    </div>
  );
}
