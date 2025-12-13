/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                monad: {
                    purple: "#FFD700", // Gold Accents
                    black: "#6D1525",  // Deep Maroon Background
                    dark: "#121212",   // Deep Black Cards
                    light: "#FFFFFF",  // White text
                    accent: "#000000"  // Black accents
                }
            }
        },
    },
    plugins: [],
}
