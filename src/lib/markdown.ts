import { Marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

declare global {
  var __shikiHighlighterPromise: Promise<Highlighter> | undefined;
}

async function getHighlighterInstance(): Promise<Highlighter> {
  if (!globalThis.__shikiHighlighterPromise) {
    globalThis.__shikiHighlighterPromise = createHighlighter({
      themes: ["github-dark-dimmed"],
      langs: [
        "javascript",
        "typescript",
        "tsx",
        "jsx",
        "bash",
        "sh",
        "json",
        "yaml",
        "yml",
        "python",
        "rust",
        "go",
        "c",
        "cpp",
        "toml",
        "diff",
        "dockerfile",
        "html",
        "css",
        "markdown",
        "sql",
      ],
    });
  }
  return globalThis.__shikiHighlighterPromise;
}

export function calculateReadingTime(text: string): string {
  if (!text || typeof text !== "string") return "1 min read";
  const cleanText = text.replace(/```[\s\S]*?```/g, "").replace(/<[^>]*>/g, "");
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export async function renderMarkdown(content: string): Promise<string> {
  if (!content || typeof content !== "string") return "";
  const highlighter = await getHighlighterInstance();

  const customMarked = new Marked();

  customMarked.use({
    renderer: {
      code({ text, lang }) {
        const rawLanguage = (lang || "text").trim().toLowerCase();
        let highlightedHtml: string;

        try {
          // If language is loaded in shiki
          const loadedLangs = highlighter.getLoadedLanguages();
          const targetLang = loadedLangs.includes(rawLanguage) ? rawLanguage : "text";

          highlightedHtml = highlighter.codeToHtml(text, {
            lang: targetLang,
            theme: "github-dark-dimmed",
          });
        } catch {
          highlightedHtml = `<pre class="shiki"><code>${escapeHtml(text)}</code></pre>`;
        }

        const encodedRaw = encodeURIComponent(text);

        return `
          <div class="shiki-wrapper group relative my-6 rounded-lg border border-stone-800 bg-[#1e1e1e] shadow-sm overflow-hidden" data-raw-code="${encodedRaw}">
            <div class="shiki-header flex items-center justify-between border-b border-stone-800 bg-stone-900/90 px-4 py-2 text-xs font-mono text-stone-400">
              <span class="uppercase tracking-wider font-semibold text-stone-400">${escapeHtml(
                rawLanguage || "code"
              )}</span>
              <button
                type="button"
                class="code-copy-btn inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs text-stone-300 hover:text-stone-100 hover:bg-stone-800 border border-stone-700/60 transition-colors cursor-pointer"
                aria-label="Copy code to clipboard"
              >
                <svg class="copy-icon w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                <span class="btn-text">Copy</span>
              </button>
            </div>
            <div class="overflow-x-auto text-sm leading-relaxed p-4 font-mono">
              ${highlightedHtml}
            </div>
          </div>
        `;
      },
      html({ text }) {
        return escapeHtml(text);
      },

      link({ href, title, text }) {
        const safeHref = sanitizeHref(href);
        if (!safeHref) return text;

        const isExternal = /^https?:\/\//i.test(safeHref);
        const rel = isExternal ? ' rel="noopener noreferrer"' : "";
        const target = isExternal ? ' target="_blank"' : "";
        const titleAttr = title
          ? ` title="${escapeHtml(title)}"`
          : "";

        return `<a href="${escapeHtml(safeHref)}"${rel}${target}${titleAttr} class="text-stone-100 underline decoration-stone-600 underline-offset-4 hover:decoration-stone-200 transition-colors">${text}</a>`;
      },
    },
  });

  const parsed = await customMarked.parse(content);
  return parsed;
}

function sanitizeHref(href: string): string | null {
  const value = href.trim();
  if (!value || value.startsWith("//")) return null;

  if (
    value.startsWith("/") ||
    value.startsWith("#") ||
    value.startsWith("?") ||
    value.startsWith("./") ||
    value.startsWith("../")
  ) {
    return value;
  }

  try {
    const url = new URL(value, "https://shaikumran.blog");
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? value
      : null;
  } catch {
    return null;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
