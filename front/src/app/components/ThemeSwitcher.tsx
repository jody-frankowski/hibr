'use client';

import { useTheme } from 'next-themes';
import { Button } from '@heroui/react';
import { MoonFilledIcon } from '@heroui/shared-icons';

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button isIconOnly onPress={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')} title="Toggle Dark/Light Mode">
      <MoonFilledIcon />
    </Button>
  );
}
