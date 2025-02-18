/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat-Regular", "sans-serif"],
        "montserrat-bold": ["Montserrat-Bold", "sans-serif"],
        "montserrat-extrabold": ["Montserrat-ExtraBold", "sans-serif"],
        "montserrat-medium": ["Montserrat-Medium", "sans-serif"],
        "montserrat-light": ["Montserrat-Light", "sans-serif"],
      },
      colors: {
        primary: {
          100: "#475867",
        },
        yellow: {
          100: "#FDECAF",
        },
        orange: {
          100: "#EC997E",
        },
        black: {
          DEFAULT: "#000000",
          100: "#8C8E98",
          200: "#666876",
          300: "#191D31",
        },
        danger: "#F75555",
      },
    },
  },
  plugins: [],
};
