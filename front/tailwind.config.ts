import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';
import { semanticColors } from '@heroui/theme';

// Override to improve contrast
const darkColors = {
  ...semanticColors.dark,
  foreground: {
    ...(typeof semanticColors.dark.foreground === 'string' ? {} : semanticColors.dark.foreground),
    DEFAULT: '#fff',
  },
};
const lightColors = {
  ...semanticColors.light,
  foreground: {
    ...(typeof semanticColors.light.foreground === 'string' ? {} : semanticColors.light.foreground),
    DEFAULT: '#000',
  },
};

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
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
