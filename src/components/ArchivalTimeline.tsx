"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Article, Project } from "@/lib/types";

export interface TimelineItem {
  id: string;
  type: "project" | "note";
  code: string;
  dateStr: string;
  timestamp: number;
  title: string;
  summary: string;
  techOrTags: string[];
  readingTime?: string;
  href: string;
  externalUrl?: string;
}

interface ArchivalTimelineProps {
  projects: Project[];
  articles: Article[];
}

export function ArchivalTimeline({ projects, articles }: ArchivalTimelineProps) {
  const [filter, setFilter] = useState<"all" | "projects" | "notes">("all");

  const allTimelineItems: TimelineItem[] = useMemo(() => {
    const projectItems: TimelineItem[] = projects.map((project, index) => {
      const date = new Date(project.date);
      return {
        id: `project-${project.slug}`,
        type: "project",
        code: `EXP-${String(index + 1).padStart(2, "0")}`,
        dateStr: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`,
        timestamp: date.getTime(),
        title: project.title,
        summary: project.summary,
        techOrTags: project.techStack || [],
        href: `/projects/${project.slug}`,
        externalUrl: project.githubUrl,
      };
    });

    const noteItems: TimelineItem[] = articles.map((article, index) => {
      const date = new Date(article.date);
      return {
        id: `article-${article.slug}`,
        type: "note",
        code: `NOTE-${String(index + 1).padStart(2, "0")}`,
        dateStr: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`,
        timestamp: date.getTime(),
        title: article.title,
        summary: article.excerpt,
        techOrTags: article.tags || [],
        readingTime: article.readingTime,
        href: `/articles/${article.slug}`,
      };
    });

    return [...projectItems, ...noteItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [projects, articles]);

  const filteredItems = useMemo(() => {
    if (filter === "projects") return allTimelineItems.filter((item) => item.type === "project");
    if (filter === "notes") return allTimelineItems.filter((item) => item.type === "note");
    return allTimelineItems;
  }, [allTimelineItems, filter]);

  const projectsCount = allTimelineItems.filter((item) => item.type === "project").length;
  const notesCount = allTimelineItems.filter((item) => item.type === "note").length;

  return (
    <section id="timeline" className="w-full scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-6 border-b border-stone-800 pb-8 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-stone-500">
              <span>RESEARCH LOG</span><span>·</span><span>2026</span>
            </div>
            <h2 className="font-geist text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl md:text-5xl">
              Experiments, notes, and implementation logs
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-stone-400 md:text-base">
              A chronological index of the work. Projects describe code and research direction; notes explain the questions, mechanisms, and evidence behind them.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start rounded-xs border border-stone-800 bg-stone-900 p-1 font-mono text-xs uppercase md:self-auto">
            {([
              ["all", `All [${allTimelineItems.length}]`],
              ["projects", `Projects [${projectsCount}]`],
              ["notes", `Notes [${notesCount}]`],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-xs px-3 py-2 transition-colors ${
                  filter === value ? "bg-stone-800 font-semibold text-white" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-stone-850">
          {filteredItems.map((item) => (
            <article key={item.id} className="group grid grid-cols-1 gap-6 px-2 py-8 transition-colors hover:bg-stone-900/30 sm:px-4 md:grid-cols-12 md:items-start md:py-10">
              <div className="flex flex-row justify-between gap-1 font-mono text-xs md:col-span-3 md:flex-col md:justify-start">
                <div className="flex flex-wrap items-center gap-2 md:items-start md:gap-1.5">
                  <span className="font-bold tracking-wider text-stone-300">{item.dateStr}</span>
                  <span className="hidden text-stone-600 md:inline">/</span>
                  <span className="text-stone-500">{item.code}</span>
                </div>
                <span className="mt-1 inline-block w-fit rounded-xs border border-stone-800 bg-stone-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-400">
                  {item.type === "project" ? "PROJECT" : "NOTE"}
                </span>
              </div>

              <div className="space-y-3 md:col-span-7">
                <h3 className="font-geist text-xl font-bold leading-snug tracking-tight text-stone-100 sm:text-2xl">
                  <Link href={item.href} className="transition-all group-hover:text-stone-300 group-hover:underline decoration-stone-600 underline-offset-4">
                    {item.title}
                  </Link>
                </h3>
                <p className="text-sm leading-relaxed text-stone-400 sm:text-base">{item.summary}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 font-mono text-xs text-stone-500">
                  {item.techOrTags.length > 0 && <span className="text-stone-400">[{item.techOrTags.slice(0, 4).join(" · ")}]</span>}
                  {item.readingTime && <><span className="text-stone-700">|</span><span>{item.readingTime}</span></>}
                </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-3 font-mono text-xs md:col-span-2 md:flex-col md:items-end md:justify-start">
                <Link href={item.href} className="inline-flex items-center gap-1.5 font-medium uppercase tracking-wider text-stone-200 underline decoration-stone-700 underline-offset-4 transition-colors hover:text-white">
                  <span>{item.type === "note" ? "Open note" : "Open project"}</span><span aria-hidden="true">→</span>
                </Link>
                {item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] uppercase tracking-wider text-stone-500 transition-colors hover:text-stone-300">Source [gh] ↗</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
