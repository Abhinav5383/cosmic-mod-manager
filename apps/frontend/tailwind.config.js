module.exports = {
    darkMode: ["class"],
    content: ["./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./index.html"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1440px",
            },
        },
        extend: {
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
            colors: {
                "accent-bg": "hsla(var(--accent-bg))",
                "accent-foreground": "hsla(var(--accent-foreground))",
                background: "hsla(var(--background))",
                "body-background": "hsla(var(--body-background))",
                "background-shallow": "hsla(var(--background-shallow))",
                "background-shallower": "hsla(var(--background-shallower))",
                foreground: "hsla(var(--foreground))",
                "foreground-muted": "hsla(var(--foreground-muted))",
                "foreground-extra-muted": "hsla(var(--foreground-extra-muted))",
                "bg-hover": "hsla(var(--bg-hover))",
                "danger-bg": "hsla(var(--danger-bg))",
                "danger-text": "hsla(var(--danger-text))",
                "success-bg": "hsla(var(--success-bg))",
                "success-text": "hsla(var(--success-text))",
                shadow: "hsla(var(--shadow))",
                border: "hsla(var(--border))",
                "border-hicontrast": "hsla(var(--border-hicontrast))",
            },
            fontSize: {
                sm: "0.85rem",
                base: "0.975rem",
                lg: "1.25rem",
                xl: "1.625rem",
                "2xl": "2.15rem",
            },
            gap: {
                "card-gap": "0.75rem",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
