/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primárias
        'nuvio-blue':  '#1C5FD9',
        'sky-blue':    '#3B8BEB',
        'ice-blue':    '#E8F1FC',
        // Neutros
        'deep-dark':   '#0D1B2A',
        'slate':       '#1E2D3D',
        'muted':       '#7A9AB5',
        // Acentos
        'teal':        '#0DCFB4',
        'amber':       '#F5A623',
        'green':       '#2DC78A',
        // Semânticos
        'success':     '#2DC78A',
        'warning':     '#F5A623',
        'error':       '#E94F4F',
      },
      fontFamily: {
        sora:    ['Sora', 'sans-serif'],
        dm:      ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(28,95,217,0.08)',
        'card-hover': '0 8px 32px 0 rgba(28,95,217,0.16)',
      },
    },
  },
  plugins: [],
}
