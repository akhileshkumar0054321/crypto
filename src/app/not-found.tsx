import React from "react";
import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Compass size={32} />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          The crypto asset intelligence, report, or terminal screen you are looking for does not exist or has moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 transition"
        >
          <Home size={14} />
          <span>Return Home</span>
        </Link>
        <Link
          href="/risk-explorer"
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs inline-flex items-center gap-2 transition"
        >
          <ArrowLeft size={14} />
          <span>Explore All Coins</span>
        </Link>
      </div>
    </div>
  );
}
