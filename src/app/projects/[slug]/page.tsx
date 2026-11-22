import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllProjects, getProjectBySlug, getSiteConfig } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const { config } = await getSiteConfig();

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shaikumran.dev";
  const canonicalUrl = `${siteUrl}/projects/${slug}`;

  return {
    title: `${project.title} — Research Project — ${config.siteTitle}`,
    description: project.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${project.title} — Research Project`,
      description: project.summary,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const { config } = await getSiteConfig();

  if (!project) {
    notFound();
  }

  const formattedDate = new Date(project.date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <main className="grow w-full flex flex-col">
        <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 pb-24">
          {/* Project Header */}
          <div className="flex flex-col gap-4 border-b border-stone-850 pb-8 mb-10">
            <Link
              href="/projects"
              className="text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-stone-300 transition-colors mb-2 inline-block"
            >
              ← Back to all projects
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 font-mono tracking-wider uppercase font-medium">
              <span>{formattedDate}</span>
              {project.role && (
                <>
                  <span className="text-stone-600">·</span>
                  <span>{project.role}</span>
                </>
              )}
              {project.metrics && (
                <>
                  <span className="text-stone-600">·</span>
                  <span className="text-stone-200 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-xs">
                    {project.metrics}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-geist text-stone-100 tracking-tight leading-tight">
              {project.title}
            </h1>

            <p className="text-stone-300 font-sans text-base md:text-lg leading-relaxed font-normal">
              {project.summary}
            </p>

            {/* Tech Stack Tags */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 font-mono text-xs">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-medium tracking-wide uppercase px-2.5 py-1 rounded-xs bg-stone-900 text-stone-300 border border-stone-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Live Actions Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4 font-mono text-xs">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 font-medium uppercase tracking-wider rounded-xs border border-stone-700 bg-stone-800 text-stone-100 hover:bg-stone-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  Source Repository ↗
                </a>
              )}

              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 font-medium uppercase tracking-wider rounded-xs border border-stone-800 bg-stone-900 text-stone-300 hover:text-white hover:border-stone-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Interactive Demo ↗
                </a>
              )}
            </div>
          </div>

          {/* Rendered Case Study Markdown */}
          <div
            className="editorial-prose"
            dangerouslySetInnerHTML={{ __html: project.contentHtml || "" }}
          />
        </article>
      </main>

      <Footer config={config} />
    </div>
  );
}
