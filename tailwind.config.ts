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
      fontFamily: {
        sans: [
          '"SF Pro Text"',
          '"SF Pro Display"',
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        display: [
          '"SF Pro Display"',
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        palette: {
          white: "#FFFFFF",
          parchment: "#F7F7F5",
          hairline: "#E5E5E5",
          terracotta: "#D05236",
          terracottaHover: "#C94730",
          muted: "#6B6B6B",
          dark: "#171717",
          darkSurface: "#212121",
          darkElevated: "#2A2A2A",
          green: "#31805A",
        },
        apple: {
          canvas: "#FFFFFF",
          parchment: "#F7F7F5",
          ink: "#171717",
          inkMuted: "#6B6B6B",
          tile1: "#212121",
          tile2: "#2A2A2A",
          black: "#171717",
          hairline: "#E5E5E5",
          hairlineDark: "rgba(255, 255, 255, 0.08)",
          amber: {
            50: "#FDF5F3",
            100: "#FCEBE7",
            200: "#F9D5CE",
            500: "#D05236", // Primary Warm Terracotta from palette
            600: "#C94730", // Hover Terracotta
            hover: "#C94730",
          },
          green: "#31805A", // Forest Green from palette
        },
      },
      letterSpacing: {
        appleTight: "-0.025em",
        appleHero: "-0.028em",
        appleBody: "-0.022em",
      },
      borderRadius: {
        appleSm: "8px",
        appleMd: "11px",
        appleLg: "18px",
        applePill: "9999px",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
