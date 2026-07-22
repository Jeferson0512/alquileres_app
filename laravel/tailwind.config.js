import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Paleta "azul confianza/financiero" — docs/requerimientos-proyecto.md, sección 7.
                primary: {
                    DEFAULT: '#2563EB',
                    dark: '#1D4ED8',
                    light: '#DBEAFE',
                },
                surface: {
                    DEFAULT: '#F8FAFC',
                    dark: '#0F172A',
                },
                success: '#16A34A',
                warning: '#D97706',
                danger: '#DC2626',
            },
            keyframes: {
                blob: {
                    '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -60px) scale(1.15)' },
                    '66%': { transform: 'translate(-25px, 25px) scale(0.9)' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                blob: 'blob 8s infinite',
                'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
            },
        },
    },

    plugins: [forms],
};
