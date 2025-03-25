'use client';

import { Button } from '@heroui/react';
import { MoonFilledIcon, SunFilledIcon } from '@heroui/shared-icons';
import React, { useEffect, useReducer, useState } from 'react';

export const ThemeScript = ({ children }: { children: React.ReactNode }) => {
  const setSystemTheme = () => {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const htmlEl = document.documentElement;
    htmlEl.classList.remove(theme === 'dark' ? 'light' : 'dark');
    htmlEl.classList.add(theme);
    htmlEl.style.colorScheme = theme;
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `(${setSystemTheme.toString()})()` }} />
      {children}
    </>
  );
};

function setTheme(theme: 'dark' | 'light') {
  if (typeof window === 'undefined') return;

  const htmlEl = document.documentElement;
  htmlEl.classList.remove(theme === 'dark' ? 'light' : 'dark');
  htmlEl.classList.add(theme);
  htmlEl.style.colorScheme = theme;
}

const systemWantsDark = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const themeReducer = (prevState: themeState, from: 'system' | 'user') => {
  const newState = { ...prevState };

  if (from === 'user') {
    newState.userWantsDark = prevState.userForced ? !prevState.userWantsDark : !prevState.systemWantsDark;
    newState.userForced = true;
  } else {
    newState.systemWantsDark = !prevState.systemWantsDark;
  }
  newState.resultIsDark = (newState.userForced ? newState.userWantsDark : newState.systemWantsDark);

  return newState;
};

interface themeState {
  systemWantsDark: boolean;
  userForced: boolean;
  userWantsDark: boolean;
  resultIsDark: boolean;
}

export const ThemeSwitcher = () => {
  const [themeState, toggleDarkMode] = useReducer(themeReducer, {
    systemWantsDark: systemWantsDark(),
    userForced: false,
    userWantsDark: false,
    resultIsDark: systemWantsDark(),
  });
  useEffect(() => {
    const mediaQueryHandler = () => {
      toggleDarkMode('system');
    };
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    media.addEventListener('change', mediaQueryHandler);
    return () => {
      media.removeEventListener('change', mediaQueryHandler);
    };
  }, []);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return (
      <Button isIconOnly className="animate-pulse" />
    );
  }

  setTheme(themeState.resultIsDark ? 'dark' : 'light');

  const iconStyle = { height: '2rem', width: '2rem' };
  const icon = themeState.resultIsDark ?
    <SunFilledIcon style={iconStyle} /> : <MoonFilledIcon style={iconStyle} />;

  return (
    <Button isIconOnly onPress={() => toggleDarkMode('user')}
            title="Toggle Dark/Light Mode" className="bg-transparent">
      {icon}
    </Button>
  );
};
