module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "!./node_modules/**/*", // Ignore node_modules explicitly
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00acb4",
        secondary: "#058187",
      },
    },
  },
  plugins: [],
};
