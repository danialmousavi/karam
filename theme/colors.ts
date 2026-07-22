// theme/colors.ts
export const themes = {
  // ===== تم روشن =====
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
  // ===== تم تاریک (پیش‌فرض دارک) =====
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#A8E6CF',
    primaryDark: '#35a17d',
    text: '#E8E8E8',
    textMuted: '#8A8A8A',
    danger: '#ff4444',
    success: '#A8E6CF',
    border: '#2A2A2A',
  },
  
  // ===== تم اقیانوسی =====
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
  // ===== تم اقیانوسی دارک =====
  oceanDark: {
    background: '#0D1B2A',
    surface: '#1B2D45',
    primary: '#7EC8E3',
    primaryDark: '#2B7A9C',
    text: '#E8F0F8',
    textMuted: '#8FAABC',
    danger: '#ff6b6b',
    success: '#7EC8E3',
    border: '#2A4A6A',
  },
  
  // ===== تم اسطوخودوس =====
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
  // ===== تم اسطوخودوس دارک =====
  lavenderDark: {
    background: '#1A0D2E',
    surface: '#2D1B4E',
    primary: '#C9B1FF',
    primaryDark: '#7C5CBF',
    text: '#F0E8FF',
    textMuted: '#9B8AB5',
    danger: '#ff6b6b',
    success: '#C9B1FF',
    border: '#3D2B6E',
  },
  
  // ===== تم غروب =====
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
  // ===== تم غروب دارک =====
  sunsetDark: {
    background: '#1A0E08',
    surface: '#2D1A10',
    primary: '#FFB38A',
    primaryDark: '#E07C3E',
    text: '#F5E6D8',
    textMuted: '#C4A88A',
    danger: '#ff6b6b',
    success: '#FFB38A',
    border: '#4A2A18',
  },
  
  // ===== تم جنگلی =====
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
  // ===== تم جنگلی دارک =====
  forestDark: {
    background: '#0A1A0A',
    surface: '#1A3A1A',
    primary: '#8FBC8F',
    primaryDark: '#4A7A4A',
    text: '#E8F5E8',
    textMuted: '#8AA88A',
    danger: '#ff6b6b',
    success: '#8FBC8F',
    border: '#2A5A2A',
  },
};

export type ThemeName = keyof typeof themes;
export type ThemeColors = typeof themes.light;

export const getTheme = (themeName: ThemeName = 'light'): ThemeColors => {
  return themes[themeName] || themes.light;
};

export const colors = themes.light;