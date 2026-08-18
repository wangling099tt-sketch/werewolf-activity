/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Wolvesville Dark Theme
        "wv-bg": "#0f0a1e",
        "wv-bg-deep": "#0a0612",
        "wv-bg-panel": "#1e1035",
        "wv-bg-card": "#2b174f",
        "wv-bg-elevated": "#3d2280",
        "wv-primary": "#6c5ce7",
        "wv-primary-light": "#a29bfe",
        "wv-primary-glow": "rgba(108, 92, 231, 0.4)",
        "wv-accent": "#fd79a8",
        "wv-accent-cyan": "#00cec9",
        "wv-accent-pink": "#e84393",
        "wv-gold": "#fdcb6e",
        "wv-success": "#00b894",
        "wv-danger": "#d63031",
        "wv-warning": "#e17055",
        // Phase colors
        "night-bg": "#0a0612",
        "night-sky": "#1a0a2e",
        "day-sky": "#87ceeb",
        "day-sunset": "#fd79a8",
        "dawn": "#fab1a0",
        "dusk": "#6c5ce7",
        // Wolves
        "wolf-red": "#e74c3c",
        "wolf-dark": "#2d1b1b",
        // Town
        "town-blue": "#3498db",
        "town-green": "#27ae60",
        // Neutral
        "neutral-purple": "#9b59b6",
        // Text
        "wv-text": "#f0e6ff",
        "wv-text-dim": "#9b8ab8",
        "wv-text-muted": "#6c5a7c",
      },
      fontFamily: {
        "wv-display": ["Fredoka One", "Comic Neue", "cursive"],
        "wv-body": ["Nunito", "Quicksand", "sans-serif"],
        "wv-mono": ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "wv-hero": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "wv-title": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "wv-subtitle": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        "wv-body": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "wv-caption": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
      },
      borderRadius: {
        "wv-sm": "0.5rem",
        "wv-md": "1rem",
        "wv-lg": "1.5rem",
        "wv-xl": "2rem",
        "wv-pill": "9999px",
      },
      boxShadow: {
        "wv-glow": "0 0 20px rgba(108, 92, 231, 0.4)",
        "wv-glow-pink": "0 0 20px rgba(253, 121, 168, 0.4)",
        "wv-glow-cyan": "0 0 20px rgba(0, 206, 201, 0.4)",
        "wv-glow-gold": "0 0 20px rgba(253, 203, 110, 0.4)",
        "wv-card": "0 8px 32px rgba(0, 0, 0, 0.4)",
        "wv-card-hover": "0 12px 40px rgba(108, 92, 231, 0.3)",
        "wv-inset": "inset 0 2px 4px rgba(0,0,0,0.3)",
      },
      animation: {
        "wv-pulse-glow": "wvPulseGlow 2s ease-in-out infinite",
        "wv-float": "wvFloat 3s ease-in-out infinite",
        "wv-twinkle": "wvTwinkle 1.5s ease-in-out infinite",
        "wv-spin-slow": "wvSpin 8s linear infinite",
        "wv-bounce-subtle": "wvBounceSubtle 2s ease-in-out infinite",
        "wv-shimmer": "wvShimmer 2s linear infinite",
      },
      keyframes: {
        wvPulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        wvFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wvTwinkle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        wvSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        wvBounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        wvShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "wv-gradient": "linear-gradient(135deg, #1e1035 0%, #2b174f 50%, #1e1035 100%)",
        "wv-gradient-radial": "radial-gradient(ellipse at center, #2b174f 0%, #1e1035 100%)",
        "wv-shine": "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        "wv-night-sky": "linear-gradient(180deg, #0a0612 0%, #1a0a2e 50%, #2b174f 100%)",
        "wv-day-sky": "linear-gradient(180deg, #87ceeb 0%, #a8e6cf 50%, #fd79a8 100%)",
      },
    },
  },
  plugins: [],
};