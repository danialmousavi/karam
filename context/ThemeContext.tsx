// context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, ThemeColors, getTheme, themes } from '../theme/colors';

interface ThemeContextType {
  themeName: ThemeName;
  colors: ThemeColors;
  setTheme: (themeName: ThemeName) => Promise<void>;
  allThemes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [colors, setColors] = useState<ThemeColors>(themes.light);

  // بارگذاری تم ذخیره شده
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@app_theme');
      if (savedTheme && themes[savedTheme as ThemeName]) {
        const theme = savedTheme as ThemeName;
        setThemeName(theme);
        setColors(getTheme(theme));
      }
    } catch (error) {
      console.error('خطا در بارگذاری تم:', error);
    }
  };

  const setTheme = async (newTheme: ThemeName) => {
    try {
      await AsyncStorage.setItem('@app_theme', newTheme);
      setThemeName(newTheme);
      setColors(getTheme(newTheme));
    } catch (error) {
      console.error('خطا در ذخیره تم:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        colors,
        setTheme,
        allThemes: themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};