import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CinematicStudioIntro } from "@/components/CinematicStudioIntro";
import { EditorialHero } from "@/components/EditorialHero";
import { ArchivalTimeline } from "@/components/ArchivalTimeline";
import {
  getAllArticles,
  getAllProjects,
  getSiteConfig,
} from "@/lib/content";

export default async function HomePage() {
  const { config } = await getSiteConfig();
  const allArticles = getAllArticles();
  const allProjects = getAllProjects();

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
        {/* 4. Archival Research, Systems & Monograph Timeline */}
        <ArchivalTimeline projects={allProjects} articles={allArticles} />
      </main>

      {/* 5. Minimalist Archival Footer */}
      <Footer config={config} />
    </div>
  );
}
