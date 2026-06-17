import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        workbench: {
          ink: "#1f2328",
          muted: "#667085",
          line: "#d8dee4",
          panel: "#f8fafc",
          rail: "#eef2f6",
          accent: "#256f6b",
          amber: "#b06a00",
          plum: "#7a4c78",
        },
      },
      boxShadow: {
        hairline: "inset 0 -1px 0 rgba(31, 35, 40, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
