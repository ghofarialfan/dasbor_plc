import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { navy: '#10233f', brand: '#2563eb', border: '#e5eaf1', background: '#f4f6fa', foreground: '#18283e', muted: '#64748b', primary: '#2563eb', 'primary-foreground': '#ffffff', ring: '#2563eb' },
    fontFamily: { sans: ['Inter Variable', 'sans-serif'] },
    boxShadow: { card: '0 2px 6px rgb(15 23 42 / 0.025)' },
  } },
  plugins: [animate],
} satisfies Config;