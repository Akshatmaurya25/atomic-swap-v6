import type { Config } from "tailwindcss";

const config: Config = {
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
        yellow: {
          primary: "var(--yellow-primary)",
          secondary: "var(--yellow-secondary)",
          dark: "var(--yellow-dark)",
        },
        gray: {
          dark: "var(--gray-dark)",
          medium: "var(--gray-medium)",
          light: "var(--gray-light)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Courier New", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      boxShadow: {
        "glow-yellow": "0 0 20px rgba(255, 235, 59, 0.3)",
      },
      backgroundImage: {
        "gradient-yellow": "linear-gradient(135deg, var(--yellow-primary), var(--yellow-secondary))",
        "gradient-gray": "linear-gradient(135deg, var(--gray-medium), var(--gray-light))",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;