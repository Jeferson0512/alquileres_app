import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    // 'class' (no 'media'): el toggle de tema del Portal de Inquilinos
    // necesita control manual via localStorage, no solo prefers-color-scheme.
    // El panel admin no usa clases dark: en ningun componente, asi que
    // activar esto no le cambia nada -- el toggle solo existe en el portal.
    darkMode: 'class',
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
                // Solo para el monto del Hero del Portal de Inquilinos — ver
                // artifact "Mi Alquiler". El resto de la app sigue con sans.
                serif: ['Fraunces', ...defaultTheme.fontFamily.serif],
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
                // Acento puntual de la seccion "Como pagar" del Portal — el
                // morado real de la marca Yape, no el azul de la app (para
                // que el inquilino la reconozca antes de leer una palabra).
                yape: {
                    DEFAULT: '#6D28D9',
                    dark: '#5B21B6',
                    light: '#F1EBFC',
                },
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
