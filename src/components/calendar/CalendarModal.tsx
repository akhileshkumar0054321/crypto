"use client";

import React, { useState } from "react";
import CalendarEventsWidget from "@/components/calendar/CalendarEventsWidget";
import { Calendar as CalendarIcon, X, Maximize2, Minimize2, Globe, Clock, Filter } from "lucide-react";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative bg-[#090d16] border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all ${
          isFullScreen
            ? "w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0"
            : "w-full max-w-4xl max-h-[90vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <CalendarIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-white">Calendar</h2>
                <span className="text-[10px] uppercase font-mono font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                  Live Global Events
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Economic indicators, central bank decisions & macro data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition cursor-pointer"
              title={isFullScreen ? "Exit Fullscreen" : "Expand Fullscreen"}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Widget Container */}
        <div className="flex-1 p-3 sm:p-4 bg-[#0a0f1d] overflow-hidden flex flex-col min-h-[550px]">
          <CalendarEventsWidget height={isFullScreen ? 780 : 560} width="100%" />
        </div>
      </div>
    </div>
  );
}
