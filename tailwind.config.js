const { fontFamily } = require("tailwindcss/defaultTheme")
const defaultTheme = require("tailwindcss/defaultTheme")
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "app/**/*.{ts,tsx}",
    "app/**/*.{js,jsx}",
    "components/**/*.{ts,tsx}",
    "components/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
        xxs: "240px",
        xs: "325px",
        ...defaultTheme.screens,
      },
    },
    extend: {
      scrollbar: {
        width: "4px" /* Adjust width as needed */,
        height: "8px" /* Adjust height as needed */,
        background: "rgba(255, 255, 255, 0.4)" /* Adjust color and opacity */,
        color: "rgba(0, 0, 0, 0.5)" /* Adjust thumb color */,
      },
      colors: {
        p: "#00BFFF", // Light blue
        s: "#1E90FF", // Dodger blue
        blue: "#1fb6ff",
        pink: "#ff49db",
        orange: "#ff7849",
        green: "#1b1e66",
        grayDark: "#273444",
        // gray: '#8492a6',
        grayLight: "#d3dce6",
        moon: "hsl(240, 60%, 50%)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // green: {
        //   DEFAULT: "hsl(var(--green))",
        //   foreground: "hsl(var(--green-foreground))",
        // },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: 0,
            transform: "scale(0)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(2)",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.4s ease-in",
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      animation: {
        gradient: "gradient 6s ease infinite",
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require("tailwindcss-animate"),
  ],
}
