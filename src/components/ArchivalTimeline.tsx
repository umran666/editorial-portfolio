"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Article, Project } from "@/lib/types";

export interface TimelineItem {
  id: string;
  type: "system" | "essay" | "experiment";
  code: string;
  dateStr: string;
  timestamp: number;
  title: string;
  summary: string;
  techOrTags: string[];
  metrics?: string;
  href: string;
  externalUrl?: string;
}

interface ArchivalTimelineProps {
  projects: Project[];
  articles: Article[];
}

export function ArchivalTimeline({ projects, articles }: ArchivalTimelineProps) {
  const [filter, setFilter] = useState<"all" | "systems" | "essays">("all");

  // Merge and sort all items chronologically descending
  const allTimelineItems: TimelineItem[] = useMemo(() => {
    const projectItems: TimelineItem[] = projects.map((p, idx) => {
      const isExperiment = p.slug.includes("diffusion") || p.title.toLowerCase().includes("experiment");
      const dateObj = new Date(p.date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");

      return {
        id: `project-${p.slug}`,
        type: isExperiment ? "experiment" : "system",
        code: `SYS-${String(idx + 1).padStart(2, "0")}`,
        dateStr: `${year}.${month}`,
        timestamp: dateObj.getTime(),
        title: p.title,
        summary: p.summary,
        techOrTags: p.techStack || [],
        metrics: p.metrics,
        href: `/projects/${p.slug}`,
        externalUrl: p.githubUrl,
      };
    });

    const articleItems: TimelineItem[] = articles.map((a, idx) => {
      const dateObj = new Date(a.date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");

      return {
        id: `article-${a.slug}`,
        type: "essay",
        code: `DOC-${String(idx + 1).padStart(2, "0")}`,
        dateStr: `${year}.${month}`,
        timestamp: dateObj.getTime(),
        title: a.title,
        summary: a.excerpt,
        techOrTags: a.tags || [],
        metrics: a.readingTime,
        href: `/articles/${a.slug}`,
      };
    });

    return [...projectItems, ...articleItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [projects, articles]);

  const filteredItems = useMemo(() => {
    if (filter === "systems") {
      return allTimelineItems.filter((item) => item.type === "system" || item.type === "experiment");
    }
    if (filter === "essays") {
      return allTimelineItems.filter((item) => item.type === "essay");
    }
    return allTimelineItems;
  }, [allTimelineItems, filter]);

  const systemsCount = allTimelineItems.filter((i) => i.type !== "essay").length;
  const essaysCount = allTimelineItems.filter((i) => i.type === "essay").length;

  return (
    <section id="timeline" className="w-full scroll-mt-20 py-16 md:py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header & View Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
            <span>CHRONOLOGICAL ARCHIVE</span>
            <span>·</span>
            <span>2026 LEDGER</span>
          </div>
          <h2 className="font-geist font-bold text-3xl sm:text-4xl md:text-5xl text-stone-100 tracking-tight">
            Research, Systems & Monograph Timeline
          </h2>
          <p className="font-sans text-stone-400 text-sm md:text-base max-w-2xl font-normal">
            A comprehensive record of models, tokenization engines, cache algorithms, and written treatises,
            indexed chronologically without promotional vanity.
          </p>
        </div>

        {/* Minimal Monochromatic Filter Bar */}
        <div className="flex items-center gap-1.5 font-mono text-xs uppercase p-1 bg-stone-900 border border-stone-800 rounded-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 transition-colors cursor-pointer rounded-xs ${
              filter === "all"
                ? "bg-stone-800 text-white font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            All [{allTimelineItems.length}]
          </button>
          <button
            type="button"
            onClick={() => setFilter("systems")}
            className={`px-3 py-1.5 transition-colors cursor-pointer rounded-xs ${
              filter === "systems"
                ? "bg-stone-800 text-white font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Systems [{systemsCount}]
          </button>
          <button
            type="button"
            onClick={() => setFilter("essays")}
            className={`px-3 py-1.5 transition-colors cursor-pointer rounded-xs ${
              filter === "essays"
                ? "bg-stone-800 text-white font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Monographs [{essaysCount}]
          </button>
        </div>
      </div>

      {/* The Timeline Ledger Table */}
      <div className="w-full divide-y divide-stone-850">
        {filteredItems.map((item) => {
          const typeBadge =
            item.type === "system"
              ? "SYSTEM"
              : item.type === "experiment"
              ? "EXPERIMENT"
              : "MONOGRAPH";

          return (
            <article
              key={item.id}
              className="group py-8 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start transition-colors hover:bg-stone-900/30 px-2 sm:px-4"
            >
              {/* Left Column: Metadata Telemetry */}
              <div className="md:col-span-3 flex flex-row md:flex-col justify-between md:justify-start gap-1 font-mono text-xs">
                <div className="flex items-center md:items-start gap-2 md:gap-1.5 flex-wrap">
                  <span className="text-stone-300 font-bold tracking-wider">
                    {item.dateStr}
                  </span>
                  <span className="text-stone-600 hidden md:inline">/</span>
                  <span className="text-stone-500">{item.code}</span>
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-xs border border-stone-800 bg-stone-900 text-stone-400 font-medium">
                    {typeBadge}
                  </span>
                </div>
              </div>

              {/* Middle Column: Title, Abstract & Specs */}
              <div className="md:col-span-7 space-y-3">
                <h3 className="font-geist font-bold text-xl sm:text-2xl text-stone-100 tracking-tight leading-snug">
                  <Link
                    href={item.href}
                    className="group-hover:text-stone-300 group-hover:underline decoration-stone-600 underline-offset-4 transition-all"
                  >
                    {item.title}
                  </Link>
                </h3>

                <p className="font-sans text-stone-400 text-sm sm:text-base leading-relaxed font-normal">
                  {item.summary}
                </p>

                {/* Technical Specifications / Badges in JetBrains Mono */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs font-mono text-stone-500">
                  {item.techOrTags.length > 0 && (
                    <span className="text-stone-400">
                      [{item.techOrTags.slice(0, 4).join(" · ")}]
                    </span>
                  )}
                  {item.metrics && (
                    <>
                      <span className="text-stone-700">|</span>
                      <span className="text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded-xs border border-stone-800 text-[11px]">
                        {item.metrics}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Direct Archival Link */}
              <div className="md:col-span-2 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 font-mono text-xs">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-stone-200 hover:text-white font-medium uppercase tracking-wider underline decoration-stone-700 underline-offset-4 transition-colors"
                >
                  <span>{item.type === "essay" ? "Read Text" : "View Spec"}</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>

                {item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-500 hover:text-stone-300 text-[11px] uppercase tracking-wider transition-colors"
                  >
                    Source [gh] ↗
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      </div>
    </section>
  );
}
