import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllProjects, getSiteConfig } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getSiteConfig();
  return {
    title: `Research Systems & Implementations — ${config.authorName}`,
    description: "Open-source research systems, tokenizer implementations, and diffusion model experiments.",
  };
}

export default async function ProjectsIndexPage() {
  const { config } = await getSiteConfig();
  const projects = getAllProjects();

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <main className="grow w-full flex flex-col">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 flex flex-col gap-12 pb-24">
          <section className="text-left border-b border-stone-850 pb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
              OPEN-SOURCE RESEARCH SYSTEMS & RUNTIMES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight text-stone-100 font-geist">
              Engineering Systems & Models
            </h1>
            <p className="text-stone-400 font-sans text-base md:text-lg max-w-2xl mt-2 font-normal">
              Autonomous implementations in tokenization (BPE/SuperBPE), KV-cache optimization,
              diffusion concept ablation, and medical imaging inference.
            </p>
          </section>

          <section className="flex flex-col gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </section>
        </div>
      </main>

      <Footer config={config} />
    </div>
  );
}
