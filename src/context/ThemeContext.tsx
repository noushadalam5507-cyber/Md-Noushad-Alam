import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppTheme = 'purple' | 'dark' | 'light';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('instagrand_theme') as AppTheme;
    if (saved === 'purple' || saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'purple';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('instagrand_theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'purple') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('purple');
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('theme-purple', 'theme-dark', 'theme-light');
    body.classList.remove('theme-purple', 'theme-dark', 'theme-light');

    root.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);

    if (theme === 'light') {
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '#f4f4f8';
      body.style.color = '#0f172a';
    } else if (theme === 'dark') {
      root.style.colorScheme = 'dark';
      body.style.backgroundColor = '#050505';
      body.style.color = '#f1f5f9';
    } else {
      root.style.colorScheme = 'dark';
      body.style.backgroundColor = '#090314';
      body.style.color = '#e2d9f3';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
