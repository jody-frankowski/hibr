'use client';

import { Button } from '@heroui/react';
import { MoonFilledIcon, SunFilledIcon } from '@heroui/shared-icons';
import React, { useEffect, useReducer, useState } from 'react';

const iconStyle = { height: '2rem', width: '2rem' };
const prefersDarkMediaQuery = '(prefers-color-scheme: dark)';

type theme = 'dark' | 'light';
type themeSource = 'system' | 'user';
// Toggle is the only action supported, but we still add it in the "payload" to better convey
// the action's meaning
type themeReducerAction = { from: themeSource, action: 'toggle' };
type themeState = { from: themeSource, theme: theme };

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


const oppositeTheme = (theme: theme): theme => {
  return theme === 'dark' ? 'light' : 'dark';
};

function setTheme(theme: theme) {
  if (typeof document === 'undefined') return;

  const htmlEl = document.documentElement;
  htmlEl.classList.remove(oppositeTheme(theme));
  htmlEl.classList.add(theme);
  htmlEl.style.colorScheme = theme;
}

const getSystemTheme = (): theme => {
  if (typeof document === 'undefined') return 'light';

  return window.matchMedia(prefersDarkMediaQuery).matches ? 'dark' : 'light';
};

const themeReducer = (state: themeState, action: themeReducerAction) => {
  if (action.from === 'user'
    || (action.from === 'system' && state.from !== 'user')) {
    return { from: action.from, theme: oppositeTheme(state.theme) };
  }
  return state;
};

export const ThemeSwitcher = () => {
  const [themeState, toggleTheme] = useReducer(themeReducer, {
    from: 'system',
    theme: getSystemTheme(),
  });
  useEffect(() => {
    const mediaQueryHandler = () => {
      toggleTheme({ from: 'system', action: 'toggle' });
    };
    const mediaQuery = window.matchMedia(prefersDarkMediaQuery);

    mediaQuery.addEventListener('change', mediaQueryHandler);
    return () => {
      mediaQuery.removeEventListener('change', mediaQueryHandler);
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

  setTheme(themeState.theme);

  const icon = themeState.theme === 'dark' ?
    <SunFilledIcon style={iconStyle} /> : <MoonFilledIcon style={iconStyle} />;

  return (
    <Button isIconOnly onPress={() => toggleTheme({ from: 'user', action: 'toggle' })}
            title="Toggle Dark/Light Mode" className="bg-transparent">
      {icon}
    </Button>
  );
};
