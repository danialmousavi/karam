// theme/colors.ts
export const themes = {
  light: {
    background: '#F8FCFA',
    surface: '#FFFFFF',
    primary: '#A8E6CF',
    primaryDark: '#35a17d',
    text: '#2D3436',
    textMuted: '#B2BEC3',
    danger: '#ea1e0f',
    success: '#A8E6CF',
    border: '#EAF4EF',
  },
  ocean: {
    background: '#F0F7FF',
    surface: '#FFFFFF',
    primary: '#7EC8E3',
    primaryDark: '#2B7A9C',
    text: '#1A2A3A',
    textMuted: '#8FAABC',
    danger: '#e74c3c',
    success: '#7EC8E3',
    border: '#D4E8F0',
  },
  lavender: {
    background: '#F8F4FF',
    surface: '#FFFFFF',
    primary: '#C9B1FF',
    primaryDark: '#7C5CBF',
    text: '#2D1B4E',
    textMuted: '#9B8AB5',
    danger: '#e74c3c',
    success: '#C9B1FF',
    border: '#E8DFF5',
  },
  sunset: {
    background: '#FFF8F0',
    surface: '#FFFFFF',
    primary: '#FFB38A',
    primaryDark: '#E07C3E',
    text: '#3D2B1F',
    textMuted: '#C4A88A',
    danger: '#e74c3c',
    success: '#FFB38A',
    border: '#F5E6D8',
  },
  forest: {
    background: '#F0F7F0',
    surface: '#FFFFFF',
    primary: '#8FBC8F',
    primaryDark: '#4A7A4A',
    text: '#1A3A1A',
    textMuted: '#8AA88A',
    danger: '#e74c3c',
    success: '#8FBC8F',
    border: '#D4E8D4',
  },
};

export type ThemeName = keyof typeof themes;
export type ThemeColors = typeof themes.light;

// ✅ تابع برای گرفتن تم
export const getTheme = (themeName: ThemeName = 'light'): ThemeColors => {
  return themes[themeName] || themes.light;
};

// ✅ برای استفاده در کامپوننت‌ها (پیش‌فرض)
export const colors = themes.light;