import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllArticles, getArticleBySlug, getSiteConfig } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const { config } = await getSiteConfig();

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shaikumran.dev";
  const canonicalUrl = `${siteUrl}/articles/${slug}`;
  const ogImage = article.coverImage
    ? `${siteUrl}${article.coverImage}`
    : `${siteUrl}/images/articles/uniqtoken.svg`;

  return {
    title: `${article.title} — ${config.siteTitle}`,
    description: article.excerpt,
    authors: [{ name: article.author }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const { config } = await getSiteConfig();

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: {
      "@type": "Person",
      name: article.author,
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Header siteTitle={config.siteTitle} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="grow w-full flex flex-col">
        <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 pb-24">
          {/* Article Header */}
          <header className="flex flex-col gap-4 text-left border-b border-stone-850 pb-8 mb-12">
            <Link
              href="/articles"
              className="text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-stone-300 transition-colors mb-2 inline-block"
            >
              ← Back to all lab notes
            </Link>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-100 leading-tight font-geist">
              {article.title}
            </h1>

            <div className="text-xs font-mono text-stone-400 uppercase tracking-wider flex items-center flex-wrap gap-2 pt-2">
              <time dateTime={article.date}>{formattedDate}</time>
              <span className="text-stone-600">·</span>
              <span>{article.readingTime}</span>
              {article.tags && article.tags.length > 0 && (
                <>
                  <span className="text-stone-600">·</span>
                  <div className="flex items-center gap-1.5">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                        className="text-stone-400 hover:text-white underline decoration-stone-700 underline-offset-4 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Optional Cover Banner */}
          {article.coverImage && (
            <div className="w-full aspect-video relative rounded-xs overflow-hidden border border-stone-800 mb-12 bg-stone-900">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}

          {/* Rendered Markdown Body with Shiki Highlighting */}
          <div
            className="editorial-prose"
            dangerouslySetInnerHTML={{ __html: article.contentHtml || "" }}
          />

          {/* Article Signoff & Author Callout */}
          <div className="mt-16 pt-8 border-t border-stone-850 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between bg-stone-900/40 p-6 rounded-xs border border-stone-800">
            <div className="space-y-1">
              <p className="font-geist font-bold text-stone-100 text-lg">
                Note by {article.author}
              </p>
              <p className="text-xs font-sans text-stone-400 max-w-md leading-relaxed font-normal">
                {config.bio}
              </p>
            </div>
            <Link
              href="/about"
              className="px-4 py-2 text-xs font-mono font-medium uppercase tracking-wider rounded-xs border border-stone-700 bg-stone-800 text-stone-100 hover:bg-stone-700 transition-colors shrink-0"
            >
              About the researcher →
            </Link>
          </div>
        </article>
      </main>

      <Footer config={config} />
    </div>
  );
}
