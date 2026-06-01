import type { Config } from "tailwindcss";

/**
 * Design tokens lifted from the original single-file index.html theme
 * (pastel hamster). Kept 1:1 so the look carries over exactly.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C5C52",
        secondary: "#B78792",
        accent: "#E7A8BC",
        "accent-d": "#d98aa3",
        highlight: "#FFD8E6",
        success: "#9CC9A3",
        warning: "#F3C98B",
        danger: "#F2A6A6",
        bborder: "#B68E7D",
        dot: "#F4CDD8",
        line: "#EBC9D3",
        bg1: "#FFF9F7",
        bg2: "#FDECF2",
        bg3: "#FFF6EE",
        bg4: "#FFFDF8",
        panel: "#FFFFFF",
        "panel-pink": "#FFF4F7",
        "panel-cream": "#FFF9F2",
      },
      fontFamily: {
        head: ["var(--f-head)", "cursive"],
        sub: ["var(--f-sub)", "sans-serif"],
        body: ["var(--f-body)", "sans-serif"],
        deco: ["var(--f-deco)", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
      },
      boxShadow: {
        soft: "0 22px 50px -22px rgba(182,142,125,.5)",
        card: "0 8px 22px -12px rgba(214,160,170,.5)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-16px) rotate(6deg)" },
        },
        pop: {
          "0%": { transform: "scale(.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadein: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        blink: {
          "0%,100%": { opacity: ".35", transform: "scale(.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        floaty: "floaty 9s ease-in-out infinite",
        pop: "pop .3s ease",
        fadein: "fadein .35s ease",
        blink: "blink 1.8s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
