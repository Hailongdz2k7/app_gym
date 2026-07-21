/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tùy chỉnh màu nhấn (lime / orange) nếu muốn, nhưng Tailwind mặc định đã có lime và orange rất đẹp
      }
    },
  },
  plugins: [],
}
