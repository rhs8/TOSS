import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        toss: {
          green: "#2D5A3D",
          mint: "#8FBC8F",
          cream: "#F5F5DC",
          earth: "#6B4423",
          rust: "#B7410E",
        },
      fontFamily: {
        display: "var(--font-display), system-ui, sans-serif",
        body: "var(--font-body), system-ui, sans-serif",
      },
      },
    },
  },
  plugins: [],
};
export default config;
