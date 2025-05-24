
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
                figuro: {
                    dark: "#1A1F2C",
                    darker: "#151922",
                    accent: "#9b87f5",
                    "accent-hover": "#a699f6",
                    "accent-dark": "#7E69AB",
                    light: "#D6BCFA"
                }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "glow": {
                    "0%, 100%": { 
                        boxShadow: "0 0 5px rgba(155, 135, 245, 0.5), 0 0 20px rgba(155, 135, 245, 0.2)" 
                    },
                    "50%": { 
                        boxShadow: "0 0 10px rgba(155, 135, 245, 0.8), 0 0 30px rgba(155, 135, 245, 0.4)" 
                    }
                },
                "rotate-slow": {
                    "0%": { transform: "rotateY(0deg)" },
                    "100%": { transform: "rotateY(360deg)" }
                },
                "slide-up": {
                    "0%": { transform: "translateY(100%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" }
                },
                "slide-down": {
                    "0%": { transform: "translateY(-100%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" }
                },
                "slide-left": {
                    "0%": { transform: "translateX(100%)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" }
                },
                "slide-right": {
                    "0%": { transform: "translateX(-100%)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" }
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" }
                },
                "fade-out": {
                    "0%": { opacity: "1" },
                    "100%": { opacity: "0" }
                },
                "scale-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" }
                },
                "scale-out": {
                    "0%": { transform: "scale(1)", opacity: "1" },
                    "100%": { transform: "scale(0.95)", opacity: "0" }
                },
                "bounce-subtle": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5px)" }
                },
                "pulse-glow": {
                    "0%, 100%": { 
                        boxShadow: "0 0 0 0 rgba(155, 135, 245, 0.7)" 
                    },
                    "70%": { 
                        boxShadow: "0 0 0 10px rgba(155, 135, 245, 0)" 
                    }
                }
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
                "float": "float 6s ease-in-out infinite",
                "glow": "glow 3s ease-in-out infinite",
                "rotate-slow": "rotate-slow 20s linear infinite",
                "slide-up": "slide-up 0.5s ease-out",
                "slide-down": "slide-down 0.5s ease-out",
                "slide-left": "slide-left 0.5s ease-out",
                "slide-right": "slide-right 0.5s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "fade-out": "fade-out 0.3s ease-out",
                "scale-in": "scale-in 0.3s ease-out",
                "scale-out": "scale-out 0.3s ease-out",
                "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2s infinite"
			},
            boxShadow: {
                glow: "0 0 10px rgba(155, 135, 245, 0.8), 0 0 30px rgba(155, 135, 245, 0.4)",
                "glow-sm": "0 0 5px rgba(155, 135, 245, 0.5), 0 0 15px rgba(155, 135, 245, 0.2)",
                "glow-lg": "0 0 20px rgba(155, 135, 245, 0.6), 0 0 40px rgba(155, 135, 245, 0.3)",
                "inner-glow": "inset 0 0 10px rgba(155, 135, 245, 0.3)"
            },
            backdropBlur: {
                xs: '2px',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
