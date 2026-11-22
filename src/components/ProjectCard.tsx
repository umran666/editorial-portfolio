import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = new Date(project.date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 rounded-xs border border-stone-850 bg-stone-900/40 p-6 md:p-8 hover:border-stone-700 transition-all">
      <div className="flex items-center justify-between text-xs text-stone-400 font-mono tracking-widest uppercase font-medium">
        <span>{formattedDate}</span>
        {project.metrics && (
          <span className="text-stone-300 font-mono text-[11px] bg-stone-800 border border-stone-700 px-2 py-0.5 rounded-xs">
            {project.metrics}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xl md:text-2xl font-geist font-bold text-stone-100 tracking-tight">
          <Link
            href={`/projects/${project.slug}`}
            className="hover:underline decoration-stone-500 underline-offset-4 transition-all"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 text-stone-300 font-sans text-sm md:text-base leading-relaxed">
          {project.summary}
        </p>
      </div>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-xs bg-stone-900 text-stone-400 border border-stone-800"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 mt-auto border-t border-stone-850 flex items-center justify-between text-xs font-mono">
        <Link
          href={`/projects/${project.slug}`}
          className="text-stone-200 hover:text-white uppercase tracking-wider hover:underline decoration-stone-500 underline-offset-4 font-semibold"
        >
          Open project →
        </Link>

        <div className="flex items-center gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-stone-100 transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub ↗
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-stone-100 transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
            >
              Demo ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
