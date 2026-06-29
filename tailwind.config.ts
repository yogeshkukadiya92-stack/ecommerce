import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111315",
        graphite: "#2C3338",
        slate: "#647077",
        mist: "#F4F6F5",
        cloud: "#EAEEEC",
        lime: "#B8F24B",
        forest: "#113A31",
        mint: "#DDF8D1",
        coral: "#F06449",
        amber: "#F4B740"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "Helvetica", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(17, 19, 21, 0.08)",
        card: "0 12px 30px rgba(17, 19, 21, 0.06)"
      },
      borderRadius: {
        card: "8px"
      }
    }
  },
  plugins: []
};

export default config;
