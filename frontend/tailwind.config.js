/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        bg: {
          base:    "#08090e",
          surface: "#0f1117",
          elevated:"#161b27",
          card:    "#131929",
        },
        blue: {
          DEFAULT: "#3b82f6",
          bright:  "#60a5fa",
          dim:     "#1d4ed8",
        },
        cyan:  { DEFAULT: "#06b6d4", bright: "#22d3ee" },
        green: { DEFAULT: "#10b981", bright: "#34d399" },
        yellow:{ DEFAULT: "#f59e0b", bright: "#fbbf24" },
        red:   { DEFAULT: "#ef4444", bright: "#f87171" },
        orange:{ DEFAULT: "#f97316", bright: "#fb923c" },
        purple:{ DEFAULT: "#8b5cf6", bright: "#a78bfa" },
        text: {
          primary:   "#f1f5f9",
          secondary: "#94a3b8",
          muted:     "#475569",
          dim:       "#2d3748",
        },
        border: {
          subtle:  "rgba(255,255,255,0.06)",
          default: "rgba(255,255,255,0.10)",
          strong:  "rgba(255,255,255,0.18)",
        },
      },
      boxShadow: {
        card:    "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        blue:    "0 0 20px rgba(59,130,246,0.35)",
        cyan:    "0 0 20px rgba(6,182,212,0.35)",
        green:   "0 0 15px rgba(16,185,129,0.30)",
        red:     "0 0 15px rgba(239,68,68,0.30)",
        modal:   "0 25px 60px rgba(0,0,0,0.7)",
        elevated:"0 8px 30px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        sm: "6px", DEFAULT: "8px", md: "10px", lg: "12px", xl: "16px", "2xl": "20px",
      },
      backgroundImage: {
        "gradient-blue":    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        "gradient-blue-cyan":"linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
        "gradient-green":   "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-red":     "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        "gradient-card":    "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        "gradient-sidebar": "linear-gradient(180deg, #0d1117 0%, #0a0b0f 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in":    "fadeIn 0.3s ease",
        "slide-up":   "slideUp 0.3s ease",
        "shimmer":    "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0, transform: "translateY(6px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
      },
    },
  },
  plugins: [],
};
