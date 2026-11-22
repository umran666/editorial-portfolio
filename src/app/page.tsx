import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EditorialHero } from "@/components/EditorialHero";
import { ArchivalTimeline } from "@/components/ArchivalTimeline";
import { getAllArticles, getAllProjects, getSiteConfig } from "@/lib/content";

export default async function HomePage() {
  const { config } = await getSiteConfig();
  const articles = getAllArticles();
  const projects = getAllProjects();

  return (
    <div className="flex min-h-screen flex-col bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />
      <EditorialHero totalProjects={projects.length} totalNotes={articles.length} />
      <main className="grow w-full">
        <ArchivalTimeline projects={projects} articles={articles} />
      </main>
      <Footer config={config} />
    </div>
  );
}
