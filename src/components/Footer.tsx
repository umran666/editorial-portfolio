import Link from "next/link";
import Image from "next/image";
import type { SiteConfig } from "@/lib/types";

interface FooterProps {
  config: SiteConfig;
}

export function Footer({ config }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto w-full border-t border-blue-200/15 bg-[#101827] font-sans text-slate-300 selection:bg-blue-900/50 selection:text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20 text-center">
        {/* Profile Head */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-blue-200/20 shadow-2xl">
            <Image
              src={config.avatarUrl || "/images/avatar.jpg"}
              alt={config.authorName}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-stone-100 font-geist">
              {config.authorName}
            </p>
            <p className="text-xs font-mono font-medium uppercase tracking-[0.2em] text-stone-400">
              {config.authorRole}
            </p>
          </div>
        </div>

        {/* Elsewhere Social Coordinates */}
        <div className="mt-8">
          <p className="text-xs font-mono font-semibold uppercase tracking-[0.24em] text-blue-200/60">
            Research links
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            {config.social.github && (
              <a
                href={config.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xs border border-blue-200/15 bg-slate-950/30 px-3.5 py-1.5 font-medium text-stone-300 transition-all hover:border-blue-200/45 hover:bg-blue-950/40 hover:text-white"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                GitHub
              </a>
            )}

            {config.social.huggingface && (
              <a
                href={config.social.huggingface}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xs border border-blue-200/15 bg-slate-950/30 px-3.5 py-1.5 font-medium text-stone-300 transition-all hover:border-blue-200/45 hover:bg-blue-950/40 hover:text-white"
              >
                <span className="text-xs">🤗</span>
                Hugging Face
              </a>
            )}

            {config.social.linkedin && (
              <a
                href={config.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xs border border-blue-200/15 bg-slate-950/30 px-3.5 py-1.5 font-medium text-stone-300 transition-all hover:border-blue-200/45 hover:bg-blue-950/40 hover:text-white"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
            )}

            <Link
              href={config.social.rss || "/rss.xml"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to RSS Feed"
              className="inline-flex items-center gap-2 rounded-xs border border-blue-200/15 bg-slate-950/30 px-3.5 py-1.5 font-medium text-stone-300 transition-all hover:border-blue-200/45 hover:bg-blue-950/40 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              RSS
            </Link>
          </div>
        </div>

        {/* Legal & Notice */}
        <div className="mt-10 space-y-2 text-xs font-mono text-stone-500">
          <p>
            Copyright © {currentYear} {config.authorName}.{" "}
            {config.email && (
              <a
                href={`mailto:${config.email}`}
                className="text-stone-300 underline decoration-stone-600 underline-offset-4 transition-colors hover:text-white"
              >
                {config.email}
              </a>
            )}
          </p>
          <p className="text-[11px] text-blue-100/35">
            Engineered with Next.js 15, TypeScript, Tailwind CSS & Shiki syntax highlighting.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-stone-400">
            <Link
              href="/about"
              className="underline decoration-stone-700 underline-offset-4 hover:text-stone-200 transition-colors"
            >
              About the researcher
            </Link>
            <span className="text-stone-700">·</span>
            <Link
              href="/tags"
              className="underline decoration-stone-700 underline-offset-4 hover:text-stone-200 transition-colors"
            >
              Research index
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
