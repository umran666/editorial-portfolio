import { getAllArticles, getAllProjects, getSiteConfig } from "./content";

export async function generateRssFeed(feedPath: string = "/rss.xml"): Promise<string> {
  const { config } = await getSiteConfig();
  const articles = getAllArticles();
  const projects = getAllProjects();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shaikumran.dev";

  const allItems = [
    ...articles.map((a) => ({
      title: a.title,
      link: `${baseUrl}/articles/${a.slug}`,
      description: a.excerpt,
      pubDate: new Date(a.date).toUTCString(),
      guid: `${baseUrl}/articles/${a.slug}`,
      category: "Article",
    })),
    ...projects.map((p) => ({
      title: `Project: ${p.title}`,
      link: `${baseUrl}/projects/${p.slug}`,
      description: p.summary,
      pubDate: new Date(p.date).toUTCString(),
      guid: `${baseUrl}/projects/${p.slug}`,
      category: "Project",
    })),
  ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const itemsXml = allItems
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <category><![CDATA[${item.category}]]></category>
      <description><![CDATA[${item.description}]]></description>
    </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${config.siteTitle} — ${config.authorName}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${config.bio}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}${feedPath}" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;
}
