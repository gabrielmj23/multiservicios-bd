import type { Config } from "tailwindcss";
import * as flowbite from "flowbite-react/tailwind";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", flowbite.content()],
  theme: {
    fontSize: {
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
    },
    extend: {},
  },
  plugins: [flowbite.plugin()],
} satisfies Config;
