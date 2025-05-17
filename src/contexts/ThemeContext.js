import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProviderCustom = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('mui-theme-mode');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('mui-theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}; 