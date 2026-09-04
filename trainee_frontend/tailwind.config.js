/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        kantumruy: ["Kantumruy Pro", "sans-serif", "cursive"],
      },
      keyframes: {
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "drawer-out": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "backdrop-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "backdrop-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "drawer-in": "drawer-in 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        "drawer-out": "drawer-out 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        "backdrop-in": "backdrop-in 280ms ease-out",
        "backdrop-out": "backdrop-out 300ms ease-in",
      },
    },
  },
  plugins: [],
};
