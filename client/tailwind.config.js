/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                arteb: {
                    deepBlue: '#003366', // Azul Primário
                    deepBlueDark: '#002B5B', // Azul mais escuro para hover/detalhes
                    vibrantYellow: '#FFD700', // Amarelo de Destaque
                    yellowLight: '#F9D423', // Variação de amarelo
                    bgBlue: '#F4F7F9', // Fundo
                }
            }
        },
    },
    plugins: [],
}
