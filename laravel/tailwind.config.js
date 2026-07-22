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
        },
    },

    plugins: [forms],
};
