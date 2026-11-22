import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  SiteConfigSchema,
  ArticleFrontmatterSchema,
  ProjectFrontmatterSchema,
  QuoteSchema,
  type SiteConfig,
  type Article,
  type Project,
  type Quote,
  type TagCount,
} from "./types";
import { calculateReadingTime, renderMarkdown } from "./markdown";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const ABOUT_FILE = path.join(CONTENT_DIR, "about.md");
const QUOTES_FILE = path.join(CONTENT_DIR, "quotes.json");

/**
 * Reads global site configuration and author profile from content/about.md
 * with Zod schema fallback validation.
 */
export async function getSiteConfig(): Promise<{
  config: SiteConfig;
  content: string;
  contentHtml: string;
}> {
  try {
    if (fs.existsSync(ABOUT_FILE)) {
      const fileContents = fs.readFileSync(ABOUT_FILE, "utf8");
      const { data, content } = matter(fileContents);
      const parsedConfig = SiteConfigSchema.safeParse(data);

      const config = parsedConfig.success
        ? parsedConfig.data
        : SiteConfigSchema.parse({});

      const contentHtml = await renderMarkdown(content);

      return { config, content, contentHtml };
    }
  } catch (error) {
    console.error("Error reading site config from about.md:", error);
  }

  // Fallback defaults
  const defaultConfig = SiteConfigSchema.parse({});
  const fallbackMarkdown =
    "Systems engineer, distributed architect, and technical essayist.";
  return {
    config: defaultConfig,
    content: fallbackMarkdown,
    contentHtml: `<p>${fallbackMarkdown}</p>`,
  };
}

/**
 * Retrieves all articles sorted descending by date.
 */
export function getAllArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  const fileNames = fs.readdirSync(ARTICLES_DIR);
  const articles: Article[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".md") && !fileName.endsWith(".mdx")) continue;

    const slug = fileName.replace(/\.mdx?$/, "");
    const fullPath = path.join(ARTICLES_DIR, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const parsed = ArticleFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`Invalid frontmatter in article ${fileName}:`, parsed.error);
      continue;
    }

    if (parsed.data.draft && process.env.NODE_ENV === "production") {
      continue;
    }

    const readingTime = calculateReadingTime(content);

    articles.push({
      ...parsed.data,
      slug,
      readingTime,
      content,
    });
  }

  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Retrieves a single article by slug with rendered HTML.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = getAllArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return null;

  const contentHtml = await renderMarkdown(article.content);
  return {
    ...article,
    contentHtml,
  };
}

/**
 * Retrieves all projects sorted descending by date.
 */
export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const fileNames = fs.readdirSync(PROJECTS_DIR);
  const projects: Project[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".md") && !fileName.endsWith(".mdx")) continue;

    const slug = fileName.replace(/\.mdx?$/, "");
    const fullPath = path.join(PROJECTS_DIR, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const parsed = ProjectFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`Invalid frontmatter in project ${fileName}:`, parsed.error);
      continue;
    }

    if (parsed.data.draft && process.env.NODE_ENV === "production") {
      continue;
    }

    projects.push({
      ...parsed.data,
      slug,
      content,
    });
  }

  return projects.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Retrieves a single project by slug with rendered HTML.
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = getAllProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;

  const contentHtml = await renderMarkdown(project.content);
  return {
    ...project,
    contentHtml,
  };
}

/**
 * Retrieves all quotes.
 */
export function getAllQuotes(): Quote[] {
  if (!fs.existsSync(QUOTES_FILE)) return [];

  try {
    const raw = fs.readFileSync(QUOTES_FILE, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data
        .map((item) => {
          const parsed = QuoteSchema.safeParse(item);
          return parsed.success ? parsed.data : null;
        })
        .filter((q): q is Quote => q !== null);
    }
  } catch (error) {
    console.error("Error reading quotes.json:", error);
  }

  return [];
}

/**
 * Aggregates all tags across articles and projects.
 */
export function getAllTags(): TagCount[] {
  const articles = getAllArticles();
  const projects = getAllProjects();

  const countMap = new Map<string, number>();

  const processTag = (t: string) => {
    const normalized = t.trim().toLowerCase();
    if (!normalized) return;
    countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
  };

  articles.forEach((a) => a.tags.forEach(processTag));
  projects.forEach((p) => p.tags.forEach(processTag));

  const result: TagCount[] = [];
  countMap.forEach((count, name) => {
    result.push({ name, count });
  });

  return result.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Finds all articles and projects associated with a given tag.
 */
export function getItemsByTag(tag: string): {
  tag: string;
  articles: Article[];
  projects: Project[];
} {
  let decoded = tag;
  try {
    decoded = decodeURIComponent(tag);
  } catch {
    decoded = tag;
  }
  const normalized = decoded.trim().toLowerCase();
  const articles = getAllArticles().filter((a) =>
    a.tags.some((t) => t.trim().toLowerCase() === normalized)
  );
  const projects = getAllProjects().filter((p) =>
    p.tags.some((t) => t.trim().toLowerCase() === normalized)
  );

  return {
    tag: normalized,
    articles,
    projects,
  };
}
