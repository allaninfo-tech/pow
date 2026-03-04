import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Core brand palette
                navy: {
                    950: "#020409",
                    900: "#060b14",
                    800: "#0a0e1a",
                    700: "#0f1526",
                    600: "#141c32",
                    500: "#1a243f",
                },
                indigo: {
                    950: "#1e0f5f",
                    900: "#2d1a8a",
                    800: "#3d25b5",
                    700: "#4f35d0",
                    600: "#6147e8",
                    500: "#7c5af6",
                    400: "#9478fa",
                    300: "#b3a0fc",
                    200: "#d4cbfe",
                    100: "#eeebff",
                },
                cyan: {
                    950: "#001a1f",
                    900: "#00303b",
                    800: "#00495a",
                    700: "#006278",
                    600: "#007b97",
                    500: "#0096b8",
                    400: "#00b5d8",
                    300: "#00d4ff",
                    200: "#6ee9ff",
                    100: "#c8f5ff",
                },
                emerald: {
                    500: "#10b981",
                    400: "#34d399",
                    300: "#6ee7b7",
                },
                amber: {
                    500: "#f59e0b",
                    400: "#fbbf24",
                },
                rose: {
                    500: "#f43f5e",
                    400: "#fb7185",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "hero-grid": "linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)",
                "glass": "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                "card-glow": "radial-gradient(circle at 50% 0%, rgba(108,99,255,0.15), transparent 70%)",
            },
            animation: {
                "float": "float 6s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                "slide-up": "slide-up 0.6s ease-out",
                "fade-in": "fade-in 0.4s ease-out",
                "shimmer": "shimmer 2s linear infinite",
                "spin-slow": "spin 3s linear infinite",
                "bounce-slow": "bounce 3s ease-in-out infinite",
                "count-up": "count-up 2s ease-out",
                "scanline": "scanline 8s linear infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(108,99,255,0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(108,99,255,0.6), 0 0 80px rgba(108,99,255,0.2)" },
                },
                "slide-up": {
                    from: { opacity: "0", transform: "translateY(30px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                "count-up": {
                    from: { opacity: "0", transform: "translateY(10px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                scanline: {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(100vh)" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
            boxShadow: {
                "glass": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                "glow-indigo": "0 0 30px rgba(108,99,255,0.4), 0 0 60px rgba(108,99,255,0.15)",
                "glow-cyan": "0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)",
                "glow-emerald": "0 0 20px rgba(16,185,129,0.4)",
                "card": "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)",
                "card-hover": "0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(108,99,255,0.3)",
            },
            transitionDuration: {
                "400": "400ms",
            },
        },
    },
    plugins: [],
};

export default config;
