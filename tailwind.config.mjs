/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F4EE",
        surface: "#FFFFFF",
        ink: "#131310",
        "ink-soft": "#5C5A4E",
        "ink-faint": "#96937F",
        line: "#E6E1D3",
        "line-soft": "#F0EDE2",
        accent: {
          DEFAULT: "#D2FF4D",
          soft: "#F1FFC9",
          ink: "#1E2A05",
          600: "#9FCC1E",
        },
        danger: {
          DEFAULT: "#C4432A",
          soft: "#FBEAE3",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};
