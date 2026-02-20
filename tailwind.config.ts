import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Healthcare OS Design Tokens
        os: {
          bg: "#080c14",
          surface: "#0d1421",
          panel: "#111827",
          border: "#1e2a3a",
          glow: "#00e5ff",
        },
        health: {
          green: "#00e676",
          amber: "#ffab40",
          red: "#ff1744",
          blue: "#40c4ff",
          purple: "#e040fb",
        },
        accent: {
          DEFAULT: "#00e5ff",
          muted: "#0097a7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "island-expand": "islandExpand 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "heartbeat": "heartbeat 0.8s ease-in-out infinite",
        "scan-line": "scanLine 3s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 10px #00e5ff44" },
          "50%": { boxShadow: "0 0 30px #00e5ffaa, 0 0 60px #00e5ff44" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        islandExpand: {
          from: { width: "120px", borderRadius: "999px" },
          to: { width: "360px", borderRadius: "24px" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.1)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(1)" },
        },
        scanLine: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "os-grid": "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        "health-gradient": "linear-gradient(135deg, #0d1421 0%, #080c14 50%, #0a0f1a 100%)",
        "glow-radial": "radial-gradient(ellipse at center, rgba(0,229,255,0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid-40": "40px 40px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
