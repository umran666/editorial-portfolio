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
    { href: "/", label: "Archive" },
    { href: "/#timeline", label: "Timeline" },
    { href: "/articles", label: "Writing" },
    { href: "/projects", label: "Systems" },
    { href: "/about", label: "About" },
    { href: "/quotes", label: "Axioms" },
    { href: "/tags", label: "Index" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  const brandName = siteTitle.includes("—") ? siteTitle.split("—")[0].trim() : siteTitle;

  return (
    <div className="w-full border-b border-white/10 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <header className="py-4 md:py-5 flex justify-between items-center gap-4">
          {/* Brand Wordmark & Monospace Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 whitespace-nowrap"
              title={siteTitle}
            >
              <span className="font-geist font-black text-base sm:text-lg lg:text-xl tracking-tight text-stone-100 uppercase whitespace-nowrap leading-none">
                {brandName}
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-stone-500 border border-stone-800 px-2 py-0.5 rounded-xs whitespace-nowrap leading-none group-hover:text-stone-300 group-hover:border-stone-700 transition-colors">
                Journal // 2026
              </span>
            </Link>
          </div>

          {/* Desktop Nav - Minimalist, Monochromatic, JetBrains Mono & Inter */}
          <nav
            className="hidden md:flex items-center gap-x-3.5 sm:gap-x-4 lg:gap-x-7 text-xs font-mono uppercase tracking-wider shrink-0"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 whitespace-nowrap ${
                  isActive(link.href)
                    ? "text-stone-100 font-semibold border-b-2 border-stone-100"
                    : "text-stone-400 hover:text-stone-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action: RSS & System Status */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-stone-500 whitespace-nowrap">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE</span>
            </div>

            <Link
              href="/rss.xml"
              target="_blank"
              title="Subscribe to Research RSS Feed"
              className="text-stone-400 hover:text-stone-100 transition-colors flex items-center gap-1.5 text-xs font-mono border border-stone-800 hover:border-stone-600 px-2.5 py-1 rounded-xs whitespace-nowrap"
              aria-label="Subscribe via RSS"
              rel="noopener"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              <span className="hidden sm:inline">RSS</span>
            </Link>

            {/* Mobile / Tablet Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-stone-300 hover:text-white transition-colors p-1"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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

        {/* Mobile / Tablet Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-800 mb-2 flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
            <p className="text-[10px] text-stone-500 font-semibold mb-1">
              Navigation Index
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 transition-colors ${
                  isActive(link.href)
                    ? "text-stone-100 font-bold"
                    : "text-stone-400 hover:text-stone-100"
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
