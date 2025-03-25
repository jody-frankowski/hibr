'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeScript } from '@/app/components/ThemeSwitcher';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeScript>
        {children}
      </ThemeScript>
    </HeroUIProvider>
  );
}
