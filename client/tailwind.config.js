/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "on-error": "#ffffff",
        "on-secondary": "#ffffff",
        "outline": "#6e7880",
        "on-primary-fixed-variant": "#004c6a",
        "on-surface": "#1c1c19",
        "error-container": "#ffdad6",
        "surface-dim": "#dcdad5",
        "on-tertiary-fixed-variant": "#6b00af",
        "secondary-fixed": "#ffdcbc",
        "primary-container": "#2bb2ee",
        "on-secondary-fixed-variant": "#683d00",
        "inverse-on-surface": "#f3f0eb",
        "inverse-primary": "#7fd0ff",
        "primary-fixed-dim": "#7fd0ff",
        "surface-bright": "#fcf9f4",
        "on-tertiary": "#ffffff",
        "outline-variant": "#bdc8d1",
        "surface-container": "#f0ede8",
        "surface-variant": "#e5e2dd",
        "background": "#fcf9f4",
        "primary": "#00658c",
        "on-background": "#1c1c19",
        "tertiary": "#862dcb",
        "surface-container-highest": "#e5e2dd",
        "surface": "#fcf9f4",
        "tertiary-container": "#cb8bff",
        "on-tertiary-container": "#5c0097",
        "on-primary": "#ffffff",
        "on-error-container": "#93000a",
        "on-tertiary-fixed": "#2e004e",
        "tertiary-fixed-dim": "#e0b6ff",
        "surface-container-low": "#f6f3ee",
        "on-primary-fixed": "#001e2d",
        "error": "#ba1a1a",
        "on-secondary-fixed": "#2c1700",
        "secondary-fixed-dim": "#ffb86b",
        "surface-container-high": "#ebe8e3",
        "inverse-surface": "#31302d",
        "secondary": "#895100",
        "on-secondary-container": "#663b00",
        "on-surface-variant": "#3e484f",
        "primary-fixed": "#c5e7ff",
        "surface-container-lowest": "#ffffff",
        "tertiary-fixed": "#f2daff",
        "on-primary-container": "#00415b",
        "secondary-container": "#fd9d1a",
        "surface-tint": "#00658c"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        "max-width": "1440px",
        "margin-mobile": "16px",
        "gutter": "24px",
        "unit": "8px",
        "margin-desktop": "48px"
      },
      fontFamily: {
        "headline-display": ["Plus Jakarta Sans"],
        "body-md": ["Hanken Grotesk"],
        "headline-lg": ["Plus Jakarta Sans"],
        "headline-lg-mobile": ["Plus Jakarta Sans"],
        "label-caps": ["JetBrains Mono"]
      },
      fontSize: {
        "headline-display": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.1em", fontWeight: "600" }]
      }
    }
  },
  plugins: []
};