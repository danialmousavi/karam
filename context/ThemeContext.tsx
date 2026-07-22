// context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, ThemeColors, getTheme, themes } from '../theme/colors';

interface ThemeContextType {
  themeName: ThemeName;
  colors: ThemeColors;
  setTheme: (themeName: ThemeName) => Promise<void>;
  allThemes: typeof themes;
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  useSystemTheme: boolean;
  toggleSystemTheme: (value: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [colors, setColors] = useState<ThemeColors>(themes.light);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [baseTheme, setBaseTheme] = useState<ThemeName>('light'); // تم اصلی انتخاب شده

  // بارگذاری تم ذخیره شده
  useEffect(() => {
    loadTheme();
  }, []);

  // تشخیص تغییر حالت سیستم
  useEffect(() => {
    if (useSystemTheme) {
      const isDark = systemColorScheme === 'dark';
      setIsDarkMode(isDark);
      applyTheme(baseTheme, isDark);
    }
  }, [systemColorScheme, useSystemTheme]);

  const applyTheme = (theme: ThemeName, dark: boolean) => {
    // اگر دارک مود فعال باشه، نسخه دارک تم رو انتخاب کن
    let finalThemeName: ThemeName = theme;
    
    if (dark) {
      // تبدیل به نسخه دارک
      const darkMap: Record<string, ThemeName> = {
        'light': 'dark',
        'ocean': 'oceanDark',
        'lavender': 'lavenderDark',
        'sunset': 'sunsetDark',
        'forest': 'forestDark',
        'dark': 'dark',
        'oceanDark': 'oceanDark',
        'lavenderDark': 'lavenderDark',
        'sunsetDark': 'sunsetDark',
        'forestDark': 'forestDark',
      };
      finalThemeName = darkMap[theme] || 'dark';
    } else {
      // اگر دارک نباشه، نسخه روشن رو انتخاب کن
      const lightMap: Record<string, ThemeName> = {
        'light': 'light',
        'dark': 'light',
        'ocean': 'ocean',
        'oceanDark': 'ocean',
        'lavender': 'lavender',
        'lavenderDark': 'lavender',
        'sunset': 'sunset',
        'sunsetDark': 'sunset',
        'forest': 'forest',
        'forestDark': 'forest',
      };
      finalThemeName = lightMap[theme] || 'light';
    }
    
    setThemeName(finalThemeName);
    setColors(getTheme(finalThemeName));
  };

  const loadTheme = async () => {
    try {
      const savedBaseTheme = await AsyncStorage.getItem('@base_theme');
      const savedDarkMode = await AsyncStorage.getItem('@dark_mode_enabled');
      const savedUseSystem = await AsyncStorage.getItem('@use_system_theme');
      
      const useSystem = savedUseSystem === null ? true : JSON.parse(savedUseSystem);
      setUseSystemTheme(useSystem);
      
      const base = (savedBaseTheme as ThemeName) || 'light';
      setBaseTheme(base);
      
      let isDark = false;
      if (useSystem) {
        isDark = systemColorScheme === 'dark';
      } else {
        isDark = savedDarkMode === null ? false : JSON.parse(savedDarkMode);
      }
      
      setIsDarkMode(isDark);
      applyTheme(base, isDark);
      
    } catch (error) {
      console.error('خطا در بارگذاری تم:', error);
    }
  };

  const setTheme = async (newTheme: ThemeName) => {
    try {
      // ذخیره تم پایه
      setBaseTheme(newTheme);
      await AsyncStorage.setItem('@base_theme', newTheme);
      
      // غیرفعال کردن حالت سیستم
      setUseSystemTheme(false);
      await AsyncStorage.setItem('@use_system_theme', JSON.stringify(false));
      
      // اعمال تم با وضعیت دارک فعلی
      applyTheme(newTheme, isDarkMode);
      
    } catch (error) {
      console.error('خطا در ذخیره تم:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newIsDark = !isDarkMode;
      setIsDarkMode(newIsDark);
      
      // ذخیره وضعیت دارک مود
      await AsyncStorage.setItem('@dark_mode_enabled', JSON.stringify(newIsDark));
      
      // غیرفعال کردن حالت سیستم
      setUseSystemTheme(false);
      await AsyncStorage.setItem('@use_system_theme', JSON.stringify(false));
      
      // اعمال تم با وضعیت دارک جدید
      applyTheme(baseTheme, newIsDark);
      
    } catch (error) {
      console.error('خطا در تغییر حالت تاریک:', error);
    }
  };

  const toggleSystemTheme = async (value: boolean) => {
    try {
      setUseSystemTheme(value);
      await AsyncStorage.setItem('@use_system_theme', JSON.stringify(value));
      
      if (value) {
        const systemIsDark = systemColorScheme === 'dark';
        setIsDarkMode(systemIsDark);
        await AsyncStorage.setItem('@dark_mode_enabled', JSON.stringify(systemIsDark));
        applyTheme(baseTheme, systemIsDark);
      }
      
    } catch (error) {
      console.error('خطا در تغییر همگام‌سازی:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        colors,
        setTheme,
        allThemes: themes,
        isDarkMode,
        toggleDarkMode,
        useSystemTheme,
        toggleSystemTheme,
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