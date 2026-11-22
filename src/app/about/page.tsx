import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getSiteConfig();
  return {
    title: `About ${config.authorName} — ${config.siteTitle}`,
    description: config.bio,
  };
}

export default async function AboutPage() {
  const { config, contentHtml } = await getSiteConfig();

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <main className="grow w-full flex flex-col">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 pb-24">
          {/* Author Bio Header */}
          <section className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-stone-850 pb-12 mb-12">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-2 ring-stone-800 shadow-2xl">
              <Image
                src={config.avatarUrl || "/images/avatar.jpg"}
                alt={config.authorName}
                width={112}
                height={112}
                priority
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex flex-col gap-3 text-center md:text-left">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-5xl font-geist font-bold text-stone-100 tracking-tight">
                  {config.authorName}
                </h1>
                <p className="text-xs font-mono font-medium uppercase tracking-[0.2em] text-stone-400">
                  {config.authorRole}
                </p>
              </div>

              <p className="text-stone-300 font-sans text-base md:text-lg leading-relaxed max-w-2xl font-normal">
                {config.bio}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-mono">
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-stone-200 hover:text-white hover:underline decoration-stone-500 underline-offset-4"
                  >
                    <span>✉</span> {config.email}
                  </a>
                )}
                {config.social.github && (
                  <a
                    href={config.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-white hover:underline decoration-stone-500 underline-offset-4"
                  >
                    GitHub ↗
                  </a>
                )}
                {config.social.huggingface && (
                  <a
                    href={config.social.huggingface}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-white hover:underline decoration-stone-500 underline-offset-4"
                  >
                    Hugging Face ↗
                  </a>
                )}
                {config.social.linkedin && (
                  <a
                    href={config.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-white hover:underline decoration-stone-500 underline-offset-4"
                  >
                    LinkedIn ↗
                  </a>
                )}
                {config.social.twitter && (
                  <a
                    href={config.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-white hover:underline decoration-stone-500 underline-offset-4"
                  >
                    X / Twitter ↗
                  </a>
                )}
                {config.social.portfolio && (
                  <a
                    href={config.social.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-white hover:underline decoration-stone-500 underline-offset-4"
                  >
                    Portfolio ↗
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Rendered Prose from content/about.md */}
          <section className="mb-14">
            <div
              className="editorial-prose"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </section>

          {/* Technical Domains & Capabilities */}
          {config.skills && config.skills.length > 0 && (
            <section className="border-t border-stone-850 pt-10 mb-14">
              <h2 className="text-xs font-mono tracking-widest uppercase text-stone-500 font-semibold mb-6">
                Technical Domains & Capabilities
              </h2>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {config.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xs bg-stone-900 border border-stone-800 text-stone-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience & Milestones */}
          {config.experience && config.experience.length > 0 && (
            <section className="border-t border-stone-850 pt-10">
              <h2 className="text-xs font-mono tracking-widest uppercase text-stone-500 font-semibold mb-6">
                Selected Milestones & Experience
              </h2>
              <div className="flex flex-col gap-6">
                {config.experience.map((exp) => (
                  <div
                    key={`${exp.company}-${exp.period}`}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-stone-850 pb-6 last:border-b-0"
                  >
                    <div className="space-y-1">
                      <h3 className="font-geist font-bold text-lg text-stone-100">
                        {exp.role}{" "}
                        <span className="text-stone-500 font-normal">at</span>{" "}
                        <span className="font-bold text-stone-200">
                          {exp.company}
                        </span>
                      </h3>
                      {exp.description && (
                        <p className="text-stone-400 font-sans text-sm leading-relaxed max-w-xl font-normal">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <time className="text-xs font-mono text-stone-500 uppercase tracking-widest whitespace-nowrap shrink-0 mt-1 sm:mt-0">
                      {exp.period}
                    </time>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer config={config} />
    </div>
  );
}
