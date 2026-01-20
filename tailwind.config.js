/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      "2xs": {
        max: "424px",
      },
      xs: {
        min: "425px",
      },
      sm: {
        min: "640px",
      },
      md: {
        min: "768px",
      },
      lg: {
        min: "1024px",
      },
      xl: {
        min: "1280px",
      },
      "2xl": {
        min: "1536px",
      },
      "3xl": {
        min: "1936px",
      },
    },
    extend: {
      animation: {
        spin: "spin 1.5s linear infinite",
        ping: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        shimmer: "shimmer 2s infinite linear",
        ripple: "ripple 0.7s ease-out",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-out": "fadeOut 0.5s ease-in-out",
        "scale-in": "scaleIn 0.5s ease-in-out",
        "scale-out": "scaleOut 0.5s ease-in-out",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: 1 },
          "100%": { transform: "scale(4)", opacity: 0 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
      },
      fontFamily: {
        playFair: ["Playfair Display", "serif"],
        montserrat: ["Montserrat", "sans-serif"],
        phudu: ["Phudu", "sans-serif"],
        play: ["Play", "sans-serif"],
        yatramanav: ["Yantramanav", "sans-serif"],
      },
      colors: {
        mainColor: "#C0322E",
        secondaryColor: "#25292F",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      backgroundImage: {
        sevaImg: "url('./assets/sbg1.svg')",
        sevaImg2: "url('./assets/sbg2.svg')",
        sevaImg3: "url('./assets/sb3.svg')",
        sevaImg4: "url('./assets/sbg4.svg')",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      textStrokeWidth: {
        1: "1px",
        2: "2px",
        3: "3px",
        4: "4px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],

  important: "#root",
};
