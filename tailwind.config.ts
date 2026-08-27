import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0a0e17",
          secondary: "#131a2a",
          tertiary: "#1a2235",
          card: "#161d30",
        },
        accent: {
          cyan: "#00d4ff",
          purple: "#7c3aed",
          "cyan-dim": "#0099bb",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        "text-primary": "#ffffff",
        "text-secondary": "#94a3b8",
        "text-muted": "#475569",
        border: {
          DEFAULT: "#1e2d45",
          light: "#243352",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-card": "linear-gradient(135deg, #161d30 0%, #131a2a 100%)",
        "gradient-cyan": "linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)",
        "gradient-danger": "linear-gradient(135deg, #ef4444 0%, #7c3aed 100%)",
      },
      boxShadow: {
        "cyan-glow": "0 0 20px rgba(0, 212, 255, 0.15)",
        "purple-glow": "0 0 20px rgba(124, 58, 237, 0.15)",
        "danger-glow": "0 0 20px rgba(239, 68, 68, 0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(0,212,255,0.6)" },
        },
      },
      borderRadius: { lg: "0.75rem", md: "0.5rem", sm: "0.375rem" },
    },
  },
  plugins: [],
};
export default config;
