import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050816",
        deep: "#0A1024",
        neon: "#35C8FF",
        nova: "#9065FF",
        snow: "#F5F7FF",
        ion: { 100: "#BFE9FF", 300: "#6FD6FF", 500: "#35C8FF", 700: "#1B7FB0", 900: "#0E3350" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 24px rgba(53,200,255,.35)",
        nova: "0 0 24px rgba(144,101,255,.35)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        flame: {
          "0%,100%": { transform: "scale(1) rotate(-2deg)" },
          "50%": { transform: "scale(1.12) rotate(2deg)" },
        },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        flame: "flame 1.1s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
