/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          300: "#93b4fd",
          500: "#4f7ef8",
          700: "#2952cc",
          900: "#1a2f7a",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          overlay: "var(--color-surface-overlay)",
        },
        page: "var(--color-page)",
        "text-primary": "var(--color-text-primary)",
        "text-muted": "var(--color-text-muted)",
        "text-inverse": "var(--color-text-inverse)",
        border: "var(--color-border)",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};
