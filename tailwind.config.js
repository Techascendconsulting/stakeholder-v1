/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Core Concepts gradient colors
    'from-purple-500', 'to-indigo-600',
    'from-blue-500', 'to-cyan-600', 
    'from-emerald-500', 'to-teal-600',
    'from-orange-500', 'to-red-600',
    'from-pink-500', 'to-rose-600',
    'from-violet-500', 'to-purple-600',
    'from-amber-500', 'to-yellow-600',
    'from-green-500', 'to-emerald-600',
    'from-slate-500', 'to-gray-600',
    'from-indigo-500', 'to-blue-600',
    'from-teal-500', 'to-cyan-600',
    'from-rose-500', 'to-pink-600',
    'from-yellow-500', 'to-orange-600',
    // Ensure gradient directions are included
    'bg-gradient-to-r',
    'bg-gradient-to-br'
  ]
};
