/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  safelist: [
    'animate-pulse-glow',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "#fbbf24",
          light: "#fbbf24",
          dark: "#b45309",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warroom: {
          bg: "#0a0a0a",
          surface: "#0d0d0d",
          "surface-alt": "#0f0f0f",
          "surface-hover": "#111010",
          border: "#292524",
          "border-dim": "#1c1917",
          "border-task": "#1a1918",
          text: "#e5e5e5",
          "text-strong": "#fafaf9",
          "text-muted": "#a8a29e",
          "text-dim": "#78716c",
          "text-faint": "#57534e",
          "text-ghost": "#44403c",
          amber: "#f59e0b",
          "amber-bright": "#fbbf24",
          green: "#22c55e",
          "green-soft": "#34d399",
          blue: "#60a5fa",
          red: "#dc2626",
          "red-soft": "#f87171",
        },
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        container: "0px",
        glass: "0px",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        display: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
        // Legacy class name: was DM Serif; now matches tactical display (Chakra Petch).
        'serif-display': ['"Chakra Petch"', 'system-ui', 'sans-serif'],
        azeret: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'sm': ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.02em' }],
        'base': ['0.8125rem', { lineHeight: '1.25rem' }],
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.125rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.5rem', { lineHeight: '1.875rem' }],
        '4xl': ['1.75rem', { lineHeight: '2rem' }],
        '5xl': ['2rem', { lineHeight: '1' }],
        '6xl': ['2.5rem', { lineHeight: '1' }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.7)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
