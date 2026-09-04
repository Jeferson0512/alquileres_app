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
                sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
                // Numeros tabulares (KPIs, montos, lecturas de medidor) --
                // prototipo "Torre de Control". Uso puntual via `font-mono`,
                // no reemplaza sans en el resto del texto.
                mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
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
                    2: '#EEF2F9',
                    3: '#E5EAF5',
                },
                success: {
                    DEFAULT: '#16A34A',
                    tint: '#E8F7EE',
                },
                warning: {
                    DEFAULT: '#D97706',
                    tint: '#FDF1DF',
                },
                danger: {
                    DEFAULT: '#DC2626',
                    tint: '#FDECEC',
                },
                // Tokens semanticos nuevos -- prototipo "Torre de Control"
                // (docs/implementacion-ocupaciones-parciales.md no aplica, ver
                // plan de diseno visual). Coexisten con lo de arriba, no lo
                // reemplazan.
                ink: '#0F172A',
                paper: '#F1F5F9',
                border: {
                    DEFAULT: '#E2E8F3',
                    strong: '#CBD5E1',
                },
                muted: {
                    DEFAULT: '#64748B',
                    2: '#94A3B8',
                },
                sidebar: {
                    bg: '#0B1220',
                    ink: '#CBD5E1',
                    muted: '#64748B',
                    active: 'rgba(91,141,239,.18)',
                    border: 'rgba(255,255,255,.06)',
                },
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
