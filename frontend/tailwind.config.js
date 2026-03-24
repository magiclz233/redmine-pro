import tailwindcssAnimate from "tailwindcss-animate";

const colorToken = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "PingFang SC", "Microsoft YaHei", "Segoe UI", "sans-serif"],
        heading: ["Inter", "PingFang SC", "Microsoft YaHei", "Segoe UI", "sans-serif"],
        mono: [
          "\"JetBrains Mono Variable\"",
          "\"JetBrains Mono\"",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        border: colorToken("--border"),
        input: colorToken("--input"),
        ring: colorToken("--ring"),
        background: colorToken("--background"),
        "background-deep": colorToken("--background-deep"),
        foreground: colorToken("--foreground"),
        surface: colorToken("--surface"),
        "surface-bright": colorToken("--surface-bright"),
        "surface-variant": colorToken("--surface-variant"),
        "surface-container-lowest": colorToken("--surface-container-lowest"),
        "surface-container-low": colorToken("--surface-container-low"),
        "surface-container": colorToken("--surface-container"),
        "surface-container-high": colorToken("--surface-container-high"),
        "surface-container-highest": colorToken("--surface-container-highest"),
        outline: colorToken("--outline"),
        "outline-variant": colorToken("--outline-variant"),
        "on-surface": colorToken("--on-surface"),
        "on-surface-variant": colorToken("--on-surface-variant"),
        primary: {
          DEFAULT: colorToken("--primary"),
          foreground: colorToken("--primary-foreground"),
        },
        "primary-container": {
          DEFAULT: colorToken("--primary-container"),
          foreground: colorToken("--primary-container-foreground"),
        },
        secondary: {
          DEFAULT: colorToken("--secondary"),
          foreground: colorToken("--secondary-foreground"),
        },
        "secondary-container": {
          DEFAULT: colorToken("--secondary-container"),
          foreground: colorToken("--secondary-container-foreground"),
        },
        tertiary: {
          DEFAULT: colorToken("--tertiary"),
          foreground: colorToken("--tertiary-foreground"),
        },
        muted: {
          DEFAULT: colorToken("--muted"),
          foreground: colorToken("--muted-foreground"),
        },
        accent: {
          DEFAULT: colorToken("--accent"),
          foreground: colorToken("--accent-foreground"),
        },
        card: {
          DEFAULT: colorToken("--card"),
          foreground: colorToken("--card-foreground"),
        },
        popover: {
          DEFAULT: colorToken("--popover"),
          foreground: colorToken("--popover-foreground"),
        },
        destructive: {
          DEFAULT: colorToken("--destructive"),
          foreground: colorToken("--destructive-foreground"),
        },
        sidebar: {
          DEFAULT: colorToken("--sidebar"),
          foreground: colorToken("--sidebar-foreground"),
          primary: colorToken("--sidebar-primary"),
          "primary-foreground": colorToken("--sidebar-primary-foreground"),
          accent: colorToken("--sidebar-accent"),
          "accent-foreground": colorToken("--sidebar-accent-foreground"),
          border: colorToken("--sidebar-border"),
          ring: colorToken("--sidebar-ring"),
        },
        chart: {
          1: colorToken("--chart-1"),
          2: colorToken("--chart-2"),
          3: colorToken("--chart-3"),
          4: colorToken("--chart-4"),
          5: colorToken("--chart-5"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
