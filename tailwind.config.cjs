/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');

const customColors = {
  '50':  '#f0e9e0',
  '100': '#5ce1e6',
  '200': '#04444f',
  '300': '#06252b',
  '400': '#18222f',
  '500': '#0b1523',
  '600': '#323131',
  '700': '#1c191a',
  '800': '#0f0f10',
  '900': '#060708',
  '950': '#020304',
};

const graphic = {
    '50':  '#f2ece4',  // Diseño-gráfico-5 (muy claro)
    '100': '#e8e4db',  // Interpolado
    '200': '#d9d6cd',  // Interpolado
    '300': '#bfbdb4',  // Diseño-gráfico-4
    '400': '#979788',  // Interpolado entre 3 y 4
    '500': '#565948',  // Diseño-gráfico-3
    '600': '#484b3e',  // Interpolado
    '700': '#3d4032',  // Diseño-gráfico-1
    '800': '#2e2f24',  // Interpolado
    '900': '#24261e',  // Diseño-gráfico-2
    '950': '#181910', // extrapolado oscuro
};

const slate = {
    '50': '#fafaf9',
    '100': '#f5f5f4',
    '200': '#e7e5e4',
    '300': '#d6d3d1',
    '400': '#a8a29e',
    '500': '#78716c',
    '600': '#57534e',
    '700': '#44403c',
    '800': '#292524',
    '900': '#1c1917',
    '950': '#0c0a09',
};

const nishikigo = {
    '50':  '#f0f0f0',   // extrapolación clara 
    '100': '#dbdbdb',   // tono claro similar al 5
    '200': '#bfbfbf',   // Diseño-5 (neutral claro)
    '300': '#a2b4b3',   // interpolado entre 3 y 5
    '400': '#8aa6a3',   // Diseño-3 (verde grisáceo claro)
    '500': '#637371',   // Diseño-4 (gris verdoso medio)
    '600': '#396d67',   // entre 1 y 4
    '700': '#127369',   // Diseño-1 (verde profundo)
    '800': '#10403b',   // Diseño-2 (verde petróleo oscuro)
    '900': '#0b2b27',   // extrapolación más oscura
    '950': '#051615',   // casi negro verdoso
};

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      white: '#ffffff',
      primary: nishikigo,
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.75rem', '1rem'],
      sm: ['0.875rem', '1.25rem'],
      base: ['1rem', '1.75rem'],
      lg: ['1.125rem', '2rem'],
      xl: ['1.25rem', '2.125rem'],
      '2xl': ['1.5rem', '2rem'],
      '3xl': ['1.875rem', '2.375rem'],
      '4xl': ['2.25rem', '2.75rem'],
      '5xl': ['3rem', '3.5rem'],
      '6xl': ['3.75rem', '4.25rem'],
    },
  },
};
