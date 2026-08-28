"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUp, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      id="cryptovision-footer"
      className="w-full bg-[#07090e] border-t border-slate-800/80 text-slate-400 text-sm mt-20 pt-16 pb-12 px-4 sm:px-6 lg:px-12 relative select-none"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Left Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-baseline group select-none">
              <span className="text-2xl font-light text-white tracking-tight">crypto</span>
              <span className="text-[26px] font-bold text-white font-serif tracking-normal ml-[1.5px] group-hover:text-blue-400 transition-colors">
                Vision
              </span>
            </Link>

            {/* Description */}
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Real-time cryptocurrency intelligence, live risk radar, and institutional blockchain forensics aggregated from 300+ trusted global market sources.
            </p>

            {/* Institutional Platform Status */}
            <div className="p-3.5 rounded-xl bg-[#0b101c] border border-slate-800/80 space-y-2 max-w-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Surveillance Telemetry:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  OPERATIONAL
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/50">
                <span className="text-slate-400 font-medium">Enclave Latency:</span>
                <span className="text-slate-200 font-mono font-bold">sub-15ms</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Join our Global Community
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                {/* GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0e1322] border border-slate-800/80 hover:border-slate-600 hover:text-white flex items-center justify-center transition hover:scale-105"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0e1322] border border-slate-800/80 hover:border-slate-600 hover:text-white flex items-center justify-center transition hover:scale-105"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0e1322] border border-slate-800/80 hover:border-slate-600 hover:text-white flex items-center justify-center transition hover:scale-105"
                  aria-label="Discord"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>

                {/* Telegram */}
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0e1322] border border-slate-800/80 hover:border-slate-600 hover:text-white flex items-center justify-center transition hover:scale-105"
                  aria-label="Telegram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Column 1: NEWS */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">NEWS</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/news" className="hover:text-white transition">Bitcoin</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Ethereum</Link></li>
              <li><Link href="/news" className="hover:text-white transition">DeFi</Link></li>
              <li><Link href="/news" className="hover:text-white transition">NFTs</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Regulation</Link></li>
              <li>
                <Link href="/risk-explorer" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition">
                  <span>&rarr; Altcoins</span>
                </Link>
              </li>
              <li><Link href="/coin/solana" className="hover:text-white transition">Solana</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Topics</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Podcast</Link></li>
            </ul>
          </div>

          {/* Navigation Column 2: MARKETS */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">MARKETS</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/defi" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition">
                  <span>&rarr; DeFi Intelligence Hub</span>
                </Link>
              </li>
              <li><Link href="/" className="hover:text-white transition">Overview</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Intelligence</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Fear & Greed</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Heatmap</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Screener</Link></li>
              <li><Link href="/alerts" className="hover:text-white transition">Gas Tracker</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Token Unlocks</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition">Derivatives</Link></li>
              <li><Link href="/defi" className="hover:text-white transition">Stablecoins</Link></li>
              <li><Link href="/defi" className="hover:text-white transition">L2 / Chains TVL</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Whales</Link></li>
              <li><Link href="/" className="hover:text-white transition">Exchanges</Link></li>
            </ul>
          </div>

          {/* Navigation Column 3: TOOLS */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">TOOLS</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/defi" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition">
                  <span>&rarr; Yield & IL Calculator</span>
                </Link>
              </li>
              <li><Link href="/docs" className="hover:text-white transition">Platform Docs</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Widget Builder</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Sources</Link></li>
              <li><Link href="/about" className="hover:text-white transition">Authors</Link></li>
              <li><Link href="/defi" className="hover:text-white transition">DeFi Calculator</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Compare</Link></li>
              <li><Link href="/news" className="hover:text-white transition">RSS Feed</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition">Watchlist</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition">Portfolio</Link></li>
              <li><Link href="/settings" className="hover:text-white transition">Settings</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Explore</Link></li>
              <li><Link href="/risk-explorer" className="hover:text-white transition">Sentiment</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Archive</Link></li>
            </ul>
          </div>

          {/* Navigation Column 4: COMPANY */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">COMPANY</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/learn" className="hover:text-white transition">About & Mission</Link></li>
              <li><Link href="/learn#features" className="hover:text-white transition">Features & Specs</Link></li>
              <li><Link href="/learn#architecture" className="hover:text-white transition">System Architecture</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-white transition">Editorial Policy</Link></li>
              <li><Link href="/docs" className="hover:text-white transition">Ethics</Link></li>
              <li><Link href="/docs" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/docs" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/learn" className="hover:text-white transition">Capabilities Guide</Link></li>
              <li><Link href="/alerts" className="hover:text-white transition">Threat Radar</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="/" className="hover:text-white transition">System Status</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Advertise</Link></li>
              <li><Link href="/docs" className="hover:text-white transition">Disclosure</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Press Releases</Link></li>
              <li><Link href="/news" className="hover:text-white transition">Submit Press</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal, Disclaimer & Copyright Strip */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} cryptoVision Intelligence. All rights reserved.</span>
            <span className="hidden md:inline text-slate-700">&bull;</span>
            <span className="text-slate-500">Market data provided for informational and analytical purposes only.</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <Link href="/docs" className="hover:text-white transition">Privacy</Link>
            <Link href="/docs" className="hover:text-white transition">Terms</Link>
            <Link href="/docs" className="hover:text-white transition">Cookies</Link>
            <Link href="/docs" className="hover:text-white transition">Security</Link>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-[#111726] hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white shadow-2xl shadow-black/50 transition duration-200 transform hover:scale-110 flex items-center justify-center cursor-pointer"
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      )}
    </footer>
  );
}
