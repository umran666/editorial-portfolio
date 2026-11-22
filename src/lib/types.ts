import { z } from "zod";

export const SocialLinksSchema = z.object({
  github: z.string().url().optional().catch(undefined),
  huggingface: z.string().url().optional().catch(undefined),
  linkedin: z.string().url().optional().catch(undefined),
  twitter: z.string().url().optional().catch(undefined),
  portfolio: z.string().url().optional().catch(undefined),
  rss: z.string().default("/rss.xml").catch("/rss.xml"),
});

export const ExperienceItemSchema = z.object({
  role: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.string().optional(),
});

export const SiteConfigSchema = z.object({
  siteTitle: z
    .string()
    .default("Shaik Umran — Research & Engineering Journal")
    .catch("Shaik Umran — Research & Engineering Journal"),
  siteSubtitle: z
    .string()
    .default("Language Models, Tokenizer Architectures & Diffusion Research")
    .catch("Language Models, Tokenizer Architectures & Diffusion Research"),
  authorName: z.string().default("Shaik Umran").catch("Shaik Umran"),
  authorRole: z
    .string()
    .default("AI/ML Researcher & Software Engineer")
    .catch("AI/ML Researcher & Software Engineer"),
  bio: z
    .string()
    .default(
      "Independent AI/ML researcher and computer science engineer exploring language models, tokenizer architectures, diffusion models, and efficient AI systems."
    )
    .catch(
      "Independent AI/ML researcher and computer science engineer exploring language models, tokenizer architectures, diffusion models, and efficient AI systems."
    ),
  email: z.string().email().default("shaikumran487@gmail.com").catch("shaikumran487@gmail.com"),
  avatarUrl: z.string().default("/images/avatar.jpg").catch("/images/avatar.jpg"),
  social: SocialLinksSchema.default({
    github: "https://github.com/umran666",
    huggingface: "https://huggingface.co/Umranz",
    rss: "/rss.xml",
  }),
  experience: z.array(ExperienceItemSchema).default([]).catch([]),
  skills: z.array(z.string()).default([]).catch([]),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export const ArticleFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  excerpt: z.string(),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  author: z.string().default("Shaik Umran"),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

export interface Article extends ArticleFrontmatter {
  slug: string;
  readingTime: string;
  content: string;
  contentHtml?: string;
}

export const ProjectFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional(),
  liveDemoUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  role: z.string().optional(),
  metrics: z.string().optional(),
  draft: z.boolean().default(false),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
  slug: string;
  content: string;
  contentHtml?: string;
}

export const QuoteSchema = z.object({
  id: z.string(),
  quote: z.string(),
  author: z.string(),
  source: z.string().optional(),
  date: z.string().optional(),
  category: z.string().default("Philosophy"),
});

export type Quote = z.infer<typeof QuoteSchema>;

export interface TagCount {
  name: string;
  count: number;
}
