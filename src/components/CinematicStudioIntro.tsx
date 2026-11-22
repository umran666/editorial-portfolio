"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Project, Article } from "@/lib/types";
import { audio } from "@/lib/audio";

interface CinematicStudioIntroProps {
  projects: Project[];
  articles: Article[];
}

export function CinematicStudioIntro({ projects, articles }: CinematicStudioIntroProps) {
  // Gate overlay state
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFading, setGateFading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Floating inverting wordmark toggle
  const [wordmarkMorph, setWordmarkMorph] = useState<0 | 1>(0);

  // Carousel physics & drag references
  const reelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const lastAudioScrollRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Merge projects and articles into archival slides
  const slides = [
    ...projects.map((p, i) => ({
      id: `sys-${p.slug}`,
      num: String(i + 1).padStart(2, "0"),
      type: "SYSTEM",
      title: p.title,
      summary: p.summary,
      tech: p.techStack || [],
      metrics: p.metrics || "Active System",
      href: `/projects/${p.slug}`,
      codeUrl: p.githubUrl,
      diagram: i === 0 ? "tokenizer" : i === 1 ? "diffusion" : "kvcache",
    })),
    ...articles.map((a, i) => ({
      id: `doc-${a.slug}`,
      num: String(projects.length + i + 1).padStart(2, "0"),
      type: "MONOGRAPH",
      title: a.title,
      summary: a.excerpt,
      tech: a.tags || [],
      metrics: a.readingTime,
      href: `/articles/${a.slug}`,
      codeUrl: undefined,
      diagram: "monograph",
    })),
  ];

  // 1. Initial Gate Check with sessionStorage & automated test awareness
  useEffect(() => {
    const hasUnlocked = sessionStorage.getItem("su_gate_unlocked");
    const isAutomated = typeof navigator !== "undefined" && Boolean(navigator.webdriver);
    if (hasUnlocked === "true" || isAutomated) {
      setGateOpen(true);
    }
    setSoundEnabled(!audio.isMuted());
  }, []);

  // 2. Wordmark Morph Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setWordmarkMorph((prev) => (prev === 0 ? 1 : 0));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // 3. Unlock Gate Action
  const handleEnter = (withSound: boolean) => {
    if (withSound) {
      audio.setMuted(false);
      setSoundEnabled(true);
      audio.playEnterSwell();
    } else {
      audio.setMuted(true);
      setSoundEnabled(false);
    }

    setGateFading(true);
    setTimeout(() => {
      setGateOpen(true);
      setGateFading(false);
      sessionStorage.setItem("su_gate_unlocked", "true");
    }, 600);
  };

  // Replay Gate
  const handleReplayGate = () => {
    setGateOpen(false);
    setGateFading(false);
    sessionStorage.removeItem("su_gate_unlocked");
  };

  // Toggle Sound Action
  const handleToggleSound = () => {
    const muted = audio.toggleMute();
    setSoundEnabled(!muted);
  };

  // 4. Horizontal Scroll & Drag Physics
  const updateProgress = useCallback(() => {
    if (!reelRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = reelRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    setScrollProgress(progress);

    // Audio click trigger every 60px of drag
    if (Math.abs(scrollLeft - lastAudioScrollRef.current) > 60) {
      audio.playTapeClick();
      lastAudioScrollRef.current = scrollLeft;
    }

    // Determine active slide index
    const cardWidth = 420;
    const idx = Math.min(
      slides.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveSlideIndex(idx);
  }, [slides.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!reelRef.current) return;
    isDraggingRef.current = true;
    setIsGrabbing(true);
    startXRef.current = e.pageX - reelRef.current.offsetLeft;
    scrollLeftRef.current = reelRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !reelRef.current) return;
    e.preventDefault();
    const x = e.pageX - reelRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    reelRef.current.scrollLeft = scrollLeftRef.current - walk;
    updateProgress();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsGrabbing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!reelRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - reelRef.current.offsetLeft;
    scrollLeftRef.current = reelRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !reelRef.current) return;
    const x = e.touches[0].pageX - reelRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    reelRef.current.scrollLeft = scrollLeftRef.current - walk;
    updateProgress();
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Filmstrip Ruler Scrubber Click
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!reelRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = reelRef.current.scrollWidth - reelRef.current.clientWidth;
    reelRef.current.scrollTo({ left: ratio * maxScroll, behavior: "smooth" });
    audio.playTickSound(1.4);
  };

  // Scroll to bottom timeline
  const scrollToTimeline = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("timeline");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. THE OPENING STUDIO GATE SCREEN (TLB Style Monochromatic Entrance)      */}
      {/* ========================================================================= */}
      {!gateOpen && (
        <div
          className={`fixed inset-0 z-[9999] bg-stone-100 text-stone-900 flex flex-col justify-between p-6 sm:p-10 md:p-16 transition-all duration-700 ease-in-out select-none ${
            gateFading
              ? "-translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Studio Opening Gate"
        >
          {/* Gate Top Bar */}
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-stone-600 border-b border-stone-300 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-stone-900">SHAIK UMRAN</span>
              <span>·</span>
              <span>THE LOOKBACK (SU®/2026)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="hidden md:inline">COORD: 13.6288° N, 79.4192° E</span>
              <span className="flex items-center gap-1.5 text-stone-800 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                LIVE ARCHIVE
              </span>
            </div>
          </div>

          {/* Gate Center Content: 2-Column Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8 items-start">
            {/* Left Column: Big Brand Statement & Entry Actions */}
            <div className="lg:col-span-7 space-y-6">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-stone-500 font-medium block">
                AI/ML Systems Researcher & Engineer
              </span>
              <h1 className="font-geist font-black text-5xl sm:text-7xl md:text-8xl tracking-tighter uppercase leading-[0.88] text-stone-950">
                Better Off® <br />
                The Lookback <br />
                <span className="text-stone-500">(BO®S/2026)</span>
              </h1>
              <p className="font-sans text-base sm:text-lg text-stone-700 max-w-xl leading-relaxed">
                A definitive ledger of tokenizer engines, KV-cache compaction runtimes, and
                diffusion concept ablation monographs engineered with mathematical rigor.
              </p>

              {/* Enter Actions with Audio Synthesis */}
              <div className="pt-4 flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleEnter(true)}
                  className="bg-stone-950 hover:bg-stone-800 text-stone-50 px-6 py-3.5 font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Enter Archive with Sound</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEnter(false)}
                  className="border border-stone-400 hover:border-stone-900 text-stone-800 px-5 py-3.5 transition-colors cursor-pointer"
                >
                  Enter Silently
                </button>
              </div>
            </div>

            {/* Right Column: TLB Editorial Ledger Index (Monospace 2-Column Catalog) */}
            <div className="lg:col-span-5 bg-stone-200/60 border border-stone-300 p-6 font-mono text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-stone-300 text-stone-500 uppercase tracking-widest text-[10px]">
                <span>Archival Index</span>
                <span>9 Research Nodes</span>
              </div>
              <ul className="divide-y divide-stone-300/60 mt-2 text-[11px] leading-loose">
                {slides.map((s) => (
                  <li
                    key={s.id}
                    className="py-1.5 flex justify-between items-center text-stone-700 hover:text-stone-950"
                  >
                    <span className="font-bold text-stone-900">{s.num}</span>
                    <span className="truncate mx-2 text-stone-800">{s.title}</span>
                    <span className="text-[10px] text-stone-500 shrink-0">[{s.type}]</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gate Bottom Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-stone-500 border-t border-stone-300 pt-4">
            <span>Clicking with sound initializes synthetic Web Audio feedback.</span>
            <span>Shaik Umran Archive // 2026</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. THE KINETIC DRAGGABLE RUNWAY (TLB Style Interactive Reel)              */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-stone-950 text-stone-100 select-none pb-10 border-b border-white/10">
        {/* Floating inverting wordmark (mix-blend-difference) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none mix-blend-difference text-white w-full max-w-6xl px-4 text-center">
          <div className="flex flex-col items-center justify-center transition-all duration-700 ease-in-out">
            {wordmarkMorph === 0 ? (
              <div className="space-y-0.5 animate-hero-fade">
                <span className="font-geist font-black text-4xl sm:text-6xl md:text-8xl tracking-tighter uppercase leading-none block">
                  Shaik Umran ®
                </span>
                <span className="font-mono text-[11px] sm:text-xs tracking-[0.3em] uppercase opacity-90 block">
                  (SU® / 2026 · AI & Systems Research Archive)
                </span>
              </div>
            ) : (
              <div className="space-y-0.5 animate-hero-fade">
                <span className="font-geist font-black text-4xl sm:text-6xl md:text-8xl tracking-tighter uppercase leading-none block">
                  The Lookback · TLB
                </span>
                <span className="font-mono text-[11px] sm:text-xs tracking-[0.3em] uppercase opacity-90 block">
                  Research Monograph & Systems Ledger / 2026
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Runway Telemetry Header */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 pb-4 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-stone-400">
          <div className="flex items-center gap-3">
            <span className="text-stone-200 font-bold">
              RUNWAY [{slides[activeSlideIndex]?.num || "01"} / {slides.length}]
            </span>
            <span className="text-stone-700">|</span>
            <span className="text-stone-400 hidden sm:inline">
              {slides[activeSlideIndex]?.title}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs border transition-colors cursor-pointer text-[11px] ${
                soundEnabled
                  ? "border-emerald-600 bg-emerald-950/40 text-emerald-400"
                  : "border-stone-800 bg-stone-900 text-stone-500 hover:text-stone-300"
              }`}
              title="Toggle Procedural Audio"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  soundEnabled ? "bg-emerald-400 animate-pulse" : "bg-stone-600"
                }`}
              />
              <span>AUDIO: {soundEnabled ? "ON" : "OFF"}</span>
            </button>

            {/* Replay Gate Trigger */}
            <button
              type="button"
              onClick={handleReplayGate}
              className="text-stone-400 hover:text-white transition-colors underline decoration-stone-700 underline-offset-4 cursor-pointer text-[11px] hidden md:inline"
            >
              Replay Gate ↺
            </button>

            <span className="text-stone-500 text-[11px] hidden sm:inline">
              ← Drag or Swipe →
            </span>
          </div>
        </div>

        {/* The Draggable Horizontal Filmstrip */}
        <div className="pt-24 md:pt-32 pb-4">
          <div
            ref={reelRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`flex gap-6 overflow-x-auto scrollbar-none px-4 sm:px-6 md:px-12 cursor-grab active:cursor-grabbing transition-transform ${
              isGrabbing ? "cursor-grabbing" : ""
            }`}
            style={{
              scrollBehavior: isDraggingRef.current ? "auto" : "smooth",
            }}
          >
            {slides.map((item) => (
              <div
                key={item.id}
                className="group relative min-w-[20rem] sm:min-w-[24rem] md:min-w-[28rem] rounded-xs bg-stone-900/90 border border-stone-800 p-6 md:p-7 flex flex-col justify-between shrink-0 shadow-2xl transition-all duration-300 hover:border-stone-500 hover:shadow-stone-950/80"
              >
                {/* Card Top: Number + Type + Metrics */}
                <div className="flex items-center justify-between text-xs font-mono text-stone-400 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-100 font-bold tracking-widest text-sm">
                      {item.num}
                    </span>
                    <span className="text-stone-600">/</span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] bg-stone-950 px-2 py-0.5 rounded-xs text-stone-300 border border-stone-800 font-mono">
                    {item.metrics}
                  </span>
                </div>

                {/* Generative Vector Diagram Poster Frame */}
                <div className="my-5 aspect-video rounded-xs bg-stone-950 border border-stone-800 p-4 flex flex-col justify-between overflow-hidden relative group-hover:border-stone-700 transition-colors">
                  <div className="flex justify-between items-start z-10 text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                    <span>SPEC // ARCHIVE</span>
                    <span>SU-2026</span>
                  </div>

                  {/* Dynamic SVG Visuals based on diagram type */}
                  <div className="my-auto py-2 z-10">
                    {item.diagram === "tokenizer" && (
                      <svg
                        className="w-full h-16 text-stone-600"
                        viewBox="0 0 320 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 50 L80 15 L160 35 L240 10 L310 40"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                        <circle cx="80" cy="15" r="4" fill="#fafafa" />
                        <circle cx="160" cy="35" r="3" fill="#a1a1aa" />
                        <circle cx="240" cy="10" r="4" fill="#fafafa" />
                        <text x="85" y="12" fill="#fafafa" fontSize="9" fontFamily="monospace">
                          BPE ROOT
                        </text>
                        <text x="245" y="12" fill="#fafafa" fontSize="9" fontFamily="monospace">
                          4.8X KV
                        </text>
                      </svg>
                    )}

                    {item.diagram === "diffusion" && (
                      <svg
                        className="w-full h-16 text-stone-600"
                        viewBox="0 0 320 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 30 Q 90 -10, 160 30 T 310 30"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M10 30 Q 90 70, 160 30 T 310 30"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                        <circle cx="160" cy="30" r="4" fill="#fafafa" />
                        <text x="170" y="28" fill="#fafafa" fontSize="9" fontFamily="monospace">
                          ABLATION VECTOR
                        </text>
                      </svg>
                    )}

                    {item.diagram === "kvcache" && (
                      <svg
                        className="w-full h-16 text-stone-600"
                        viewBox="0 0 320 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="20" y="10" width="40" height="40" fill="#27272a" stroke="#52525b" />
                        <rect x="70" y="10" width="40" height="40" fill="#fafafa" />
                        <rect x="120" y="10" width="40" height="40" fill="#27272a" stroke="#52525b" />
                        <rect x="170" y="10" width="40" height="40" fill="#fafafa" />
                        <rect x="220" y="10" width="40" height="40" fill="#27272a" stroke="#52525b" />
                        <text x="75" y="34" fill="#09090b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          HIT
                        </text>
                        <text x="175" y="34" fill="#09090b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          3.2X
                        </text>
                      </svg>
                    )}

                    {item.diagram === "monograph" && (
                      <svg
                        className="w-full h-16 text-stone-600"
                        viewBox="0 0 320 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line x1="20" y1="15" x2="300" y2="15" stroke="#3f3f46" strokeWidth="2" />
                        <line x1="20" y1="30" x2="240" y2="30" stroke="#71717a" strokeWidth="2" />
                        <line x1="20" y1="45" x2="180" y2="45" stroke="#fafafa" strokeWidth="2" />
                        <text x="250" y="48" fill="#fafafa" fontSize="9" fontFamily="monospace">
                          DOC // TEXT
                        </text>
                      </svg>
                    )}
                  </div>

                  <p className="font-geist font-bold text-base text-stone-200 tracking-tight leading-snug truncate z-10">
                    {item.title}
                  </p>

                  {/* Watermark Number */}
                  <span className="absolute -right-2 -bottom-4 font-geist font-black text-8xl text-stone-900/60 select-none pointer-events-none">
                    {item.num}
                  </span>
                </div>

                {/* Card Bottom: Summary & Direct Links */}
                <div className="space-y-4">
                  <p className="text-stone-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs font-mono">
                    <Link
                      href={item.href}
                      className="text-stone-100 hover:text-white underline decoration-stone-600 underline-offset-4 transition-colors font-semibold flex items-center gap-1.5"
                    >
                      <span>{item.type === "SYSTEM" ? "View Spec" : "Read Text"}</span>
                      <span>→</span>
                    </Link>

                    {item.codeUrl && (
                      <a
                        href={item.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-500 hover:text-stone-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source [gh] ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Filmstrip Calibrated Ruler (Scrub & Tick) */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mt-4 space-y-2">
          <div
            onClick={handleRulerClick}
            className="w-full h-8 bg-stone-900 border border-stone-800 rounded-xs flex items-center justify-between px-3 cursor-pointer relative overflow-hidden group hover:border-stone-600 transition-colors"
            title="Click or drag to scrub filmstrip ruler"
          >
            {/* Ruler Ticks */}
            <div className="flex items-center justify-between w-full font-mono text-[9px] text-stone-600 select-none">
              {Array.from({ length: 30 }).map((_, idx) => (
                <span key={idx} className={idx % 5 === 0 ? "text-stone-400 font-bold" : ""}>
                  {idx % 5 === 0 ? `|·${idx}` : "·"}
                </span>
              ))}
            </div>

            {/* Draggable Indicator */}
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-stone-200 shadow-md transition-all duration-75"
              style={{ left: `${scrollProgress * 98}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 uppercase tracking-widest pt-1">
            <span>Ruler: 35mm // Frame Scrubber</span>
            <a
              href="#timeline"
              onClick={scrollToTimeline}
              className="text-stone-400 hover:text-white underline decoration-stone-700 underline-offset-4 transition-colors flex items-center gap-1"
            >
              <span>Explore Archival Timeline</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
