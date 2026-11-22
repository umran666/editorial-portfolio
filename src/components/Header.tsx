"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  siteTitle?: string;
}

export function Header({ siteTitle = "Shaik Umran" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Journal" },
    { href: "/#timeline", label: "Lab Log" },
    { href: "/articles", label: "Notes" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
    { href: "/tags", label: "Index" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  const brandName = siteTitle.includes("—") ? siteTitle.split("—")[0].trim() : siteTitle;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-stone-950/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 py-4 md:py-5">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-opacity hover:opacity-90"
            title={siteTitle}
          >
            <span className="font-geist text-base font-black uppercase leading-none tracking-tight text-stone-100 sm:text-lg lg:text-xl">
              {brandName}
            </span>
            <span className="rounded-xs border border-stone-800 px-2 py-0.5 font-mono text-[10px] uppercase leading-none tracking-widest text-stone-500 transition-colors group-hover:border-stone-700 group-hover:text-stone-300">
              AI Lab // Journal
            </span>
          </Link>

          <nav
            className="hidden shrink-0 items-center gap-x-4 font-mono text-xs uppercase tracking-wider md:flex lg:gap-x-7"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap py-1 transition-colors ${
                  isActive(link.href)
                    ? "border-b-2 border-stone-100 font-semibold text-stone-100"
                    : "text-stone-400 hover:text-stone-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-stone-600 xl:inline">
              Public research log
            </span>
            <Link
              href="/rss.xml"
              target="_blank"
              title="Subscribe to the research journal RSS feed"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs border border-stone-800 px-2.5 py-1 font-mono text-xs text-stone-400 transition-colors hover:border-stone-600 hover:text-stone-100"
              aria-label="Subscribe via RSS"
              rel="noopener"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              <span className="hidden sm:inline">RSS</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-300 transition-colors hover:text-white md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="flex flex-col gap-3 border-t border-stone-800 py-4 font-mono text-xs uppercase tracking-wider md:hidden">
            <p className="mb-1 text-[10px] font-semibold text-stone-500">Journal index</p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 transition-colors ${
                  isActive(link.href) ? "font-bold text-stone-100" : "text-stone-400 hover:text-stone-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
