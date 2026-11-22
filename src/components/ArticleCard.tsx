import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  showCover?: boolean;
}

export function ArticleCard({ article, showCover = true }: ArticleCardProps) {
  const formattedDate = new Date(article.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const primaryTag = article.tags?.[0] || "Research";

  return (
    <article className="flex flex-col gap-6 border-b border-stone-850 pb-12">
      {showCover && (
        <Link
          href={`/articles/${article.slug}`}
          className="w-full aspect-video bg-stone-900 overflow-hidden block relative border border-stone-800 rounded-xs group"
        >
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          ) : (
            /* Editorial Typographical Cover Banner */
            <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-6 md:p-8 flex flex-col justify-between select-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] font-bold text-stone-300 bg-stone-800/80 px-2.5 py-1 rounded-xs border border-stone-700">
                  {primaryTag}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {article.readingTime}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-geist text-lg md:text-xl font-bold text-stone-100 tracking-tight line-clamp-2">
                  {article.title}
                </p>
                <p className="text-xs font-mono text-stone-500">
                  Shaik Umran — Lab Note
                </p>
              </div>
            </div>
          )}
        </Link>
      )}

      <div className="flex flex-col gap-3">
        <time
          dateTime={article.date}
          className="text-xs text-stone-400 font-mono tracking-widest uppercase font-medium"
        >
          {formattedDate}
        </time>

        <h2 className="text-2xl md:text-3xl font-bold text-stone-100 tracking-tight font-geist leading-tight">
          <Link
            href={`/articles/${article.slug}`}
            className="hover:underline decoration-stone-500 underline-offset-4 transition-all"
          >
            {article.title}
          </Link>
        </h2>

        <div className="post-content text-stone-300 leading-relaxed text-base md:text-lg font-sans [&>p]:inline">
          <p>{article.excerpt}</p>
          <Link
            href={`/articles/${article.slug}`}
            className="font-mono text-xs uppercase tracking-wider text-stone-100 ml-2 hover:underline decoration-stone-400 underline-offset-4 transition-all inline-block"
          >
            Read note →
          </Link>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-2 text-xs font-mono text-stone-500 tracking-wider uppercase font-medium flex flex-wrap gap-2 items-center">
            {article.tags.map((tag, idx) => (
              <span key={tag} className="flex items-center">
                {idx > 0 && <span className="mr-2 text-stone-700">·</span>}
                <Link
                  href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                  className="hover:text-stone-300 hover:underline decoration-stone-600 underline-offset-4 transition-all"
                >
                  {tag}
                </Link>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
