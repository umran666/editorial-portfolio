import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllTags, getItemsByTag, getSiteConfig } from "@/lib/content";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((t) => ({
    tag: t.name,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  let decodedTag = tag;
  try {
    decodedTag = decodeURIComponent(tag);
  } catch {
    decodedTag = tag;
  }
  const { config } = await getSiteConfig();

  return {
    title: `Tagged: "${decodedTag}" — ${config.siteTitle}`,
    description: `All essays, case studies, and notes tagged under ${decodedTag}.`,
  };
}

export default async function TagArchivePage({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const { tag, articles, projects } = getItemsByTag(rawTag);
  const { config } = await getSiteConfig();

  const totalCount = articles.length + projects.length;

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <main className="grow w-full flex flex-col">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 flex flex-col gap-12 pb-24">
          <section className="border-b border-stone-850 pb-8 mt-2">
            <Link
              href="/tags"
              className="text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-stone-300 transition-colors mb-2 inline-block"
            >
              ← Back to all tags
            </Link>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold">
                Taxonomy Cluster
              </span>
              <h1 className="text-3xl md:text-5xl font-bold font-geist text-stone-100 tracking-tight">
                #{tag}
              </h1>
              <p className="text-stone-400 font-mono text-xs">
                {totalCount} {totalCount === 1 ? "result" : "results"} indexed across systems and monographs
              </p>
            </div>
          </section>

          {/* Articles Section */}
          {articles.length > 0 && (
            <div className="flex flex-col gap-8">
              <h2 className="text-xs font-mono tracking-widest uppercase text-stone-400 font-semibold border-b border-stone-850 pb-2">
                Monographs & Writing ({articles.length})
              </h2>
              <div className="flex flex-col gap-12">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="flex flex-col gap-6 pt-4">
              <h2 className="text-xs font-mono tracking-widest uppercase text-stone-400 font-semibold border-b border-stone-850 pb-2">
                Systems & Implementations ({projects.length})
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </div>
          )}

          {totalCount === 0 && (
            <div className="py-16 text-center text-stone-500 font-mono text-sm">
              No entries found indexed under #{tag}.
            </div>
          )}
        </div>
      </main>

      <Footer config={config} />
    </div>
  );
}
