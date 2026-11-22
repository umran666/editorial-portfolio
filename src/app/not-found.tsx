import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-stone-100 gap-6 text-center px-4 bg-stone-950">
      <span className="text-xs font-mono tracking-widest uppercase text-stone-500 font-semibold border border-stone-850 bg-stone-900/60 px-2.5 py-1 rounded-xs">
        404 — ROUTE UNINDEXED
      </span>
      <h1 className="text-4xl md:text-6xl font-geist font-black tracking-tight text-stone-100 uppercase">
        Lost in the Archive
      </h1>
      <p className="text-stone-400 font-sans text-base md:text-lg max-w-md font-normal leading-relaxed">
        The leaf or research node you requested could not be located in the current collection ledger.
      </p>
      <Link
        href="/"
        className="mt-4 px-6 py-2.5 text-xs font-mono font-medium uppercase tracking-widest rounded-xs border border-stone-700 bg-stone-800 text-stone-100 hover:bg-stone-700 hover:border-stone-500 transition-colors"
      >
        Return to Front Page →
      </Link>
    </div>
  );
}
