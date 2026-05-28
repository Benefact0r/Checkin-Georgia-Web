import type { Config } from "tailwindcss";

// Checkin Georgia brand tokens — single source of truth for color.
// Direction: bold · premium · modern · eager · high colour.
// Signature: Checkin Violet → Eager Coral gradient.
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Primary — Checkin Violet (brand, buttons, links).
        // `brand` keeps the old token name so existing usages light up.
        brand: {
          50: "#F3EEFE",
          100: "#E4D9FD",
          200: "#C9B3FB",
          300: "#A985F7",
          400: "#8B5CF3",
          DEFAULT: "#6D28E8",
          500: "#6D28E8",
          600: "#5A1FD0",
          700: "#4818A8",
          800: "#361280",
          900: "#240C54",
          dark: "#4818A8",
        },
        // Accent — Eager Coral (CTAs, urgency).
        accent: {
          50: "#FFEAEF",
          100: "#FFD0DB",
          200: "#FFA3B8",
          300: "#FF7593",
          400: "#FF4D71",
          DEFAULT: "#FF1E54",
          500: "#FF1E54",
          600: "#E50047",
          700: "#B80039",
          800: "#8A002B",
          900: "#5C001D",
        },
        // Highlight — Signal Gold (ratings, premium tags).
        gold: "#FFB020",
        // Neutrals — Ink (cool, faint violet tint).
        ink: {
          0: "#FFFFFF",
          50: "#F7F6FB",
          100: "#EFEDF5",
          200: "#DEDBE8",
          300: "#C2BDD2",
          400: "#9A93AE",
          500: "#726B86",
          600: "#524C63",
          700: "#383247",
          800: "#221E2E",
          900: "#14111C",
        },
        // Semantic
        success: "#00C2A8",
        warning: "#FFB020",
        danger: "#FF1E54",
      },
      backgroundImage: {
        // Signature brand gradient.
        sunset: "linear-gradient(135deg, #6D28E8 0%, #FF1E54 100%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
