/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
      },
    },

    extend: {
      colors: {
        background: "#0B1120",
        surface: "#111827",
        card: "#182233",
        elevated: "#1E293B",

        primary: "#6366F1",
        secondary: "#06B6D4",

        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",

        text: "#F8FAFC",
        muted: "#94A3B8",

        border: "rgba(255,255,255,.08)",

        glow: "#7C3AED",
      },

      fontFamily: {
        heading: [
          "Sora",
          "sans-serif",
        ],

        body: [
          "Inter",
          "sans-serif",
        ],

        mono: [
          "JetBrains Mono",
          "monospace",
        ],
      },

      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "28px",
        "2xl": "36px",
      },

      boxShadow: {
        soft:
          "0 8px 30px rgba(0,0,0,.25)",

        glass:
          "0 8px 40px rgba(0,0,0,.35)",

        glow:
          "0 0 40px rgba(99,102,241,.35)",

        hover:
          "0 25px 45px rgba(0,0,0,.30)",
      },

      backdropBlur: {
        xs: "2px",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(.22,.61,.36,1)",
      },

      animation: {
        float: "float 8s ease-in-out infinite",

        fadeUp: "fadeUp .7s ease",

        fadeIn: "fadeIn .5s ease",

        pulseGlow: "pulseGlow 2.5s infinite",

        slideIn: "slideIn .45s ease",
      },

      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },

          "50%": {
            transform: "translateY(-12px)",
          },
        },

        fadeUp: {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },

          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        fadeIn: {
          from: {
            opacity: "0",
          },

          to: {
            opacity: "1",
          },
        },

        pulseGlow: {
          "0%,100%": {
            boxShadow:
              "0 0 0 rgba(99,102,241,0)",
          },

          "50%": {
            boxShadow:
              "0 0 35px rgba(99,102,241,.4)",
          },
        },

        slideIn: {
          from: {
            opacity: "0",
            transform: "translateX(-25px)",
          },

          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },

      backgroundImage: {
        hero:
          "radial-gradient(circle at top,#1e293b 0%,#0b1120 65%)",

        card:
          "linear-gradient(180deg,#1E293B,#162033)",

        primary:
          "linear-gradient(135deg,#6366F1,#06B6D4)",

        glass:
          "linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.03))",
      },
    },
  },

  plugins: [],
};