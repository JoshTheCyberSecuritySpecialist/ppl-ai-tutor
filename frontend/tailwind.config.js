/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cockpit: {
          900: "#020617",
          800: "#02081f",
        },
      },
      boxShadow: {
        "soft-glow": "0 0 40px rgba(59,130,246,0.35)",
      },
    },
  },
  plugins: [],
};

