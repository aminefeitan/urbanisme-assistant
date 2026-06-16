/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        appBorder: 'var(--border)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        appText: 'var(--text)',
        muted: 'var(--muted)',
        userBg: 'var(--user-bg)',
        botBg: 'var(--bot-bg)',
      },
      fontFamily: {
        sans: ['DM Sans', 'IBM Plex Sans Arabic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
