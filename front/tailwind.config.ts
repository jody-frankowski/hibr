import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';
import { semanticColors } from '@heroui/theme';

// Override to improve contrast
const darkColors = semanticColors.dark;
const lightColors = semanticColors.light;
if (typeof darkColors.foreground !== 'string' && typeof lightColors.foreground !== 'string') {
  darkColors.foreground.DEFAULT = '#fff';
  lightColors.foreground.DEFAULT = '#000';
}

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [heroui({
    themes: {
      dark: {
        colors: darkColors,
      },
      light: {
        colors: lightColors,
      },
    },
  })],
} satisfies Config;
