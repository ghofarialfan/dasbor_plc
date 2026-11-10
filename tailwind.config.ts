import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { 'surface': 'rgb(var(--color-surface) / <alpha-value>)', 'surface-soft': 'rgb(var(--color-surface-soft) / <alpha-value>)', 'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)', 'accent': 'rgb(var(--color-accent) / <alpha-value>)', 'accent-soft': 'rgb(var(--color-accent-soft) / <alpha-value>)', 'warning': 'rgb(var(--color-warning) / <alpha-value>)', 'warning-soft': 'rgb(var(--color-warning-soft) / <alpha-value>)', 'success': 'rgb(var(--color-success) / <alpha-value>)', 'success-soft': 'rgb(var(--color-success-soft) / <alpha-value>)', 'danger': 'rgb(var(--color-danger) / <alpha-value>)',  navy: 'rgb(var(--color-navy) / <alpha-value>)', brand: '#2563eb', border: 'rgb(var(--color-border) / <alpha-value>)', background: 'rgb(var(--color-background) / <alpha-value>)', foreground: 'rgb(var(--color-foreground) / <alpha-value>)', muted: 'rgb(var(--color-muted) / <alpha-value>)', primary: '#2563eb', 'primary-foreground': '#ffffff', ring: 'rgb(var(--color-ring) / <alpha-value>)' },
    fontFamily: { sans: ['Inter Variable', 'sans-serif'] },
    boxShadow: { card: '0 2px 6px rgb(15 23 42 / 0.025)' },
  } },
  plugins: [animate],
} satisfies Config;