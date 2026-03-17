import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#9833eb", // Figma deep vibrant purple
          foreground: "#ffffff",
          50: "#faf5ff",
          100: "#f3e8ff",
          500: "#9833eb", // Base primary
          600: "#7e22ce", // Darker primary
          700: "#6b21a8",
        },
        secondary: {
          DEFAULT: "#14b8a6",
          foreground: "#ffffff",
        },
        surface: {
          DEFAULT: "#f3eef6", // Figma exact profile background
        },
        figma: {
           card: "#e8dded",
           toggleOn: "#8a56a4",
           toggleOff: "#b7bbc3",
           textMuted: "#6f6f6f",
           statQuiz: "#f0e4ff",
           statStreak: "#fff0dc",
           statGem: "#e7fbff",
        },
        accent: {
          DEFAULT: "#f472b6",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
export default config;
