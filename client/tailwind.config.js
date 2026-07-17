/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Study lamp at night" palette
        ink: "#0F1428",        // deep indigo-navy background
        panel: "#1A2140",      // card / panel surface
        panelLight: "#232B52", // hover / raised surface
        glow: "#F2A93B",       // warm amber lamp-glow accent
        glowSoft: "#F2A93B33",
        teal: "#4FD1C5",       // success / correct
        coral: "#F16A6A",      // error / wrong
        ink2: "#9AA3C2",       // muted text
        paper: "#EDEEF5",      // primary text
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        lamp: "0 0 60px 10px rgba(242, 169, 59, 0.15)",
      },
    },
  },
  plugins: [],
};
