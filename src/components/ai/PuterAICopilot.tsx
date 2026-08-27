"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  X,
  Send,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  ChevronDown,
  Cpu,
  ShieldCheck,
  Compass,
  Briefcase,
  Bell,
  LineChart,
  Wrench,
  ArrowRight,
  Copy,
  Check,
  Search,
  Sparkles,
} from "lucide-react";
import { askPuterAI, puterKvGet, puterKvSet, APP_GUIDE_SYSTEM_PROMPT } from "@/lib/puter";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

const AVAILABLE_MODELS = [
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
  { id: "mistral-large-latest", name: "Mistral Large", provider: "Mistral" },
];

const GUIDANCE_TOPICS = [
  {
    icon: Compass,
    label: "App Navigation",
    query: "Where do I find all the main tools and pages in cryptoVision?",
  },
  {
    icon: ShieldCheck,
    label: "Risk Score Guide",
    query: "How are composite Risk Scores (0-100) calculated and what do they mean?",
  },
  {
    icon: Briefcase,
    label: "Portfolio & VaR",
    query: "How do I add coins to my portfolio and calculate Value at Risk (VaR)?",
  },
  {
    icon: Bell,
    label: "Threat Wire Alerts",
    query: "How do I set up real-time whale and price drop alerts?",
  },
  {
    icon: Sparkles,
    label: "ModernFinBERT NLP",
    query: "How does the ModernFinBERT sentiment analysis and financial NLP engine work in the app?",
  },
  {
    icon: LineChart,
    label: "Candlestick Charts",
    query: "How do I open the live candlestick chart and order book for a coin?",
  },
  {
    icon: Wrench,
    label: "Troubleshooting",
    query: "Prices or feed not updating? How do I troubleshoot app issues?",
  },
];

const SUGGESTED_QUICK_ACTIONS = [
  "How to use ModernFinBERT NLP Studio?",
  "How to add holdings to Portfolio?",
  "What is a Critical Risk score?",
  "How to view 6-Section Coin Report?",
  "How to use ⌘K search shortcut?",
];

export function PuterAICopilot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-3-5-sonnet");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "👋 Welcome! I am your **cryptoVision App Assistant & Support Guide** powered by Puter.js.\n\nI can help you:\n- 🧭 **Navigate the platform** & find tools\n- 🛡️ **Interpret Risk Scores (0–100)** & forensic metrics\n- 💼 **Manage your Portfolio & calculate VaR**\n- 🚨 **Set up Threat Wire alerts**\n- 📊 **Inspect Candlestick Charts & Order Books**\n- 🔧 **Troubleshoot any issues with the app**\n\nClick any topic below or ask me a question!",
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from Puter KV on mount
  useEffect(() => {
    async function loadHistory() {
      const saved = await puterKvGet<Message[] | null>("ai_copilot_history", null);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setMessages(saved);
      }
    }
    loadHistory();
  }, []);

  // Save chat history to Puter KV on update
  useEffect(() => {
    if (messages.length > 1) {
      puterKvSet("ai_copilot_history", messages.slice(-20));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      // Build conversation context with explicit App Support System Prompt
      const chatPayload = [
        {
          role: "system",
          content: APP_GUIDE_SYSTEM_PROMPT,
        },
        ...messages.slice(-6).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: query },
      ];

      // Stream response using Puter.js
      let streamBuffer = "";
      await askPuterAI(chatPayload, {
        model: selectedModel,
        stream: true,
        onChunk: (chunk: string) => {
          streamBuffer += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: streamBuffer } : m
            )
          );
        },
      });

      // If no chunks were streamed, set full text
      if (!streamBuffer) {
        const fullResp = await askPuterAI(query, { model: selectedModel });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: fullResp } : m
          )
        );
      }
    } catch (err) {
      console.error("AI Copilot error:", err);
      const fallbackResp = await askPuterAI(query, { model: selectedModel });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, content: fallbackResp } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    const initial = [
      {
        id: `welcome-${Date.now()}`,
        role: "assistant" as const,
        content:
          "👋 Chat history cleared. How can I guide you with cryptoVision or help resolve an app issue today?",
        timestamp: Date.now(),
      },
    ];
    setMessages(initial);
    await puterKvSet("ai_copilot_history", initial);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to extract relevant app links from response
  const getRelevantNavigationLinks = (text: string) => {
    const links: { label: string; href: string }[] = [];
    const lower = text.toLowerCase();

    if (lower.includes("/portfolio") || lower.includes("portfolio")) {
      links.push({ label: "Go to Portfolio", href: "/portfolio" });
    }
    if (lower.includes("/risk-explorer") || lower.includes("risk explorer")) {
      links.push({ label: "Open Risk Explorer", href: "/risk-explorer" });
    }
    if (lower.includes("/alerts") || lower.includes("threat wire") || lower.includes("alert")) {
      links.push({ label: "View Threat Wire Alerts", href: "/alerts" });
    }
    if (lower.includes("/news") || lower.includes("news")) {
      links.push({ label: "Read News & Impact Radar", href: "/news" });
    }
    if (lower.includes("/reports") || lower.includes("reports")) {
      links.push({ label: "Forensic Reports", href: "/reports" });
    }
    if (lower.includes("/settings") || lower.includes("settings")) {
      links.push({ label: "App Settings", href: "/settings" });
    }

    return links.slice(0, 2); // Max 2 quick buttons
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          type="button"
          id="open-app-assistant-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-xl shadow-blue-500/30 border border-blue-400/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
          title="Open cryptoVision App Assistant & Support Guide"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <HelpCircle size={13} className="text-cyan-200 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="tracking-wide">App Guide & Support</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">
            AI Copilot
          </span>
        </button>
      )}

      {/* Floating Copilot Modal */}
      {isOpen && (
        <div
          id="app-copilot-modal-container"
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-6 right-6 w-80 h-14"
              : "bottom-6 right-4 sm:right-6 w-[92vw] sm:w-[460px] h-[600px] max-h-[85vh]"
          } bg-[#0c101a] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#0f1422] border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <HelpCircle size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">cryptoVision App Guide</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    Puter.js
                  </span>
                </div>
                {!isMinimized && (
                  <p className="text-[10px] text-slate-400">
                    Interactive Help, Navigation & Issue Resolution
                  </p>
                )}
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              {!isMinimized && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Clear conversation"
                >
                  <Trash2 size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Model Selector & Status Bar */}
              <div className="px-3.5 py-1.5 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Cpu size={12} className="text-indigo-400" />
                  <span>AI Engine:</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="flex items-center gap-1 text-slate-200 hover:text-white font-medium bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/80 cursor-pointer text-[10px]"
                    >
                      <span>
                        {AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name ||
                          selectedModel}
                      </span>
                      <ChevronDown size={10} />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute top-6 left-0 w-48 bg-[#111624] border border-slate-700 rounded-lg shadow-xl p-1 z-30 space-y-0.5">
                        {AVAILABLE_MODELS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(m.id);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                              selectedModel === m.id
                                ? "bg-blue-600 text-white font-bold"
                                : "text-slate-300 hover:bg-slate-800"
                            } cursor-pointer`}
                          >
                            <span>{m.name}</span>
                            <span className="text-[9px] opacity-70">{m.provider}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <ShieldCheck size={11} />
                  <span>24/7 App Guide</span>
                </div>
              </div>

              {/* Guidance Topic Chips Bar */}
              <div className="px-3 py-2 bg-[#0a0e1a] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 no-scrollbar">
                {GUIDANCE_TOPICS.map((topic, i) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(topic.query)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-blue-600/30 hover:border-blue-500/50 text-slate-300 hover:text-white text-[10px] font-medium whitespace-nowrap border border-slate-700/70 transition cursor-pointer"
                    >
                      <Icon size={11} className="text-blue-400" />
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((m) => {
                  const navLinks =
                    m.role === "assistant" ? getRelevantNavigationLinks(m.content) : [];

                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2.5 ${
                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          m.role === "user"
                            ? "bg-slate-700 text-slate-200"
                            : "bg-blue-600/30 border border-blue-500/40 text-blue-400"
                        }`}
                      >
                        {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                          m.role === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-[#131929] border border-slate-800 text-slate-200 rounded-bl-none leading-relaxed"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>

                        {/* Interactive Page Navigation Links */}
                        {navLinks.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                            {navLinks.map((link, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  router.push(link.href);
                                  // keep assistant open or accessible
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[10px] font-semibold transition cursor-pointer"
                              >
                                <span>{link.label}</span>
                                <ArrowRight size={10} />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Footer */}
                        <div
                          className={`flex items-center justify-between text-[9px] mt-1.5 ${
                            m.role === "user" ? "text-blue-200" : "text-slate-500"
                          }`}
                        >
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {m.role === "assistant" && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(m.content, m.id)}
                              className="hover:text-slate-300 flex items-center gap-0.5 cursor-pointer ml-2"
                              title="Copy answer"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check size={9} className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={9} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs pl-8 animate-pulse">
                    <Sparkles size={13} className="text-blue-400 animate-spin" />
                    <span>Resolving query via {selectedModel}...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions (Shown if few messages) */}
              {messages.length <= 3 && (
                <div className="px-3 py-1.5 bg-[#090d16] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 no-scrollbar">
                  {SUGGESTED_QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(action)}
                      className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] whitespace-nowrap border border-slate-700/60 transition cursor-pointer"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[#0f1422] border-t border-slate-800 flex items-center gap-2 flex-shrink-0"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask how to use any feature or resolve an issue..."
                    disabled={isLoading}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                  {input && (
                    <button
                      type="button"
                      onClick={() => setInput("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition shadow-md shadow-blue-500/20 cursor-pointer"
                  title="Ask guide"
                >
                  <Send size={13} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
