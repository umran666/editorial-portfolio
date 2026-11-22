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
    <div className="flex min-h-screen flex-col bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <main className="grow">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:px-8 md:py-20 lg:px-12">
          {/* Introduction */}
          <section className="grid gap-10 border-b border-stone-850 pb-14 lg:grid-cols-12 lg:gap-16 lg:pb-20">
            <div className="lg:col-span-8">
              <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                FIELD NOTES // ABOUT
              </p>
              <h1 className="max-w-4xl font-geist text-5xl font-black leading-[0.95] tracking-[-0.055em] text-stone-100 sm:text-6xl md:text-7xl">
                I build the parts of AI systems that are easy to hide.
              </h1>
              <p className="mt-8 max-w-2xl font-sans text-lg leading-relaxed text-stone-300 md:text-xl">
                {config.bio}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-xs uppercase tracking-wider">
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="text-stone-100 underline decoration-stone-600 underline-offset-4 transition-colors hover:text-white"
                  >
                    Email ↗
                  </a>
                )}
                {config.social.github && (
                  <a
                    href={config.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 underline decoration-stone-800 underline-offset-4 transition-colors hover:text-white"
                  >
                    GitHub ↗
                  </a>
                )}
                {config.social.huggingface && (
                  <a
                    href={config.social.huggingface}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 underline decoration-stone-800 underline-offset-4 transition-colors hover:text-white"
                  >
                    Hugging Face ↗
                  </a>
                )}
                {config.social.linkedin && (
                  <a
                    href={config.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 underline decoration-stone-800 underline-offset-4 transition-colors hover:text-white"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </div>

            <aside className="self-end border border-stone-800 bg-stone-900/45 p-5 md:p-6 lg:col-span-4">
              <div className="flex items-center gap-4 border-b border-stone-800 pb-5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-stone-700">
                  <Image
                    src={config.avatarUrl || "/images/avatar.jpg"}
                    alt={config.authorName}
                    fill
                    sizes="64px"
                    priority
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-geist text-xl font-bold tracking-tight text-stone-100">
                    {config.authorName}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">
                    {config.authorRole}
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-4 font-mono text-xs">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="uppercase tracking-widest text-stone-600">Working in</dt>
                  <dd className="text-right text-stone-300">Python / Rust</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="uppercase tracking-widest text-stone-600">Following</dt>
                  <dd className="text-right text-stone-300">Tokenizers / Inference</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="uppercase tracking-widest text-stone-600">Also testing</dt>
                  <dd className="text-right text-stone-300">Diffusion / Ablation</dd>
                </div>
              </dl>
            </aside>
          </section>

          <section className="grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              <div className="mb-8 flex items-center gap-3 border-b border-stone-850 pb-4">
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  01 / THE WORK
                </span>
                <span className="h-px flex-1 bg-stone-900" />
              </div>
              <div className="editorial-prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </div>

            {config.skills && config.skills.length > 0 && (
              <aside className="self-start lg:col-span-4">
                <div className="border-t border-stone-850 pt-4">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    02 / TOOLS & TERRITORY
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {config.skills.map((skill) => (
                      <span
                        key={skill}
                        className="border border-stone-800 bg-stone-900/60 px-3 py-2 font-mono text-[11px] leading-tight text-stone-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </section>

          {config.experience && config.experience.length > 0 && (
            <section className="border-t border-stone-850 pt-8 md:pt-10">
              <div className="mb-8 flex items-center gap-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  03 / WHERE THIS CAME FROM
                </span>
                <span className="h-px flex-1 bg-stone-900" />
              </div>

              <div className="divide-y divide-stone-850 border-y border-stone-850">
                {config.experience.map((exp, index) => (
                  <article
                    key={`${exp.company}-${exp.period}`}
                    className="grid gap-4 py-6 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-start md:gap-8"
                  >
                    <span className="font-mono text-xs text-stone-600">0{index + 1}</span>
                    <div>
                      <h2 className="font-geist text-xl font-bold tracking-tight text-stone-100">
                        {exp.role}
                      </h2>
                      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-stone-500">
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-stone-400">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <time className="font-mono text-xs uppercase tracking-widest text-stone-500 md:pt-1">
                      {exp.period}
                    </time>
                  </article>
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
