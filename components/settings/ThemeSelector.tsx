// components/settings/ThemeSelector.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ThemeName } from '../../theme/colors';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeSelector({ visible, onClose }: ThemeSelectorProps) {
  const { colors, themeName, setTheme, allThemes, isDarkMode } = useTheme();
  
  const themeOptions: { key: ThemeName; label: string; icon: string }[] = [
    { key: 'light', label: 'روشن', icon: 'sun' },
    { key: 'ocean', label: 'اقیانوسی', icon: 'droplet' },
    { key: 'lavender', label: 'اسطوخودوس', icon: 'flower' },
    { key: 'sunset', label: 'غروب', icon: 'sunset' },
    { key: 'forest', label: 'جنگلی', icon: 'tree' },
  ];

  const handleSelectTheme = (theme: ThemeName) => {
    setTheme(theme);
    onClose();
  };

  const getBaseTheme = (): ThemeName => {
    const baseNames = ['light', 'ocean', 'lavender', 'sunset', 'forest'];
    for (const name of baseNames) {
      if (themeName === name || themeName === `${name}Dark`) {
        return name as ThemeName;
      }
    }
    return 'light';
  };

  const baseTheme = getBaseTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.text }]}>🎨 انتخاب تم</Text>
          
          <View style={[styles.darkModeStatus, { backgroundColor: colors.background }]}>
            <Text style={[styles.darkModeStatusText, { color: colors.text }]}>
              {isDarkMode ? '🌙 حالت دارک فعال است' : '☀️ حالت روشن فعال است'}
            </Text>
            <Text style={[styles.darkModeStatusSub, { color: colors.textMuted }]}>
              {isDarkMode ? 'نسخه دارک تم‌ها نمایش داده می‌شوند' : 'نسخه روشن تم‌ها نمایش داده می‌شوند'}
            </Text>
          </View>

          <View style={styles.themeGrid}>
            {themeOptions.map((theme) => {
              const isSelected = baseTheme === theme.key;
              const previewThemeName = isDarkMode ? `${theme.key}Dark` as ThemeName : theme.key as ThemeName;
              const themeColors = allThemes[previewThemeName] || allThemes[theme.key as ThemeName];
              
              return (
                <TouchableOpacity
                  key={theme.key}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: themeColors.surface,
                      borderColor: isSelected ? colors.primaryDark : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleSelectTheme(theme.key as ThemeName)}
                >
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: themeColors.primary },
                    ]}
                  >
                    <Feather name={theme.icon as any} size={24} color={themeColors.surface} />
                  </View>
                  <Text style={[styles.themeLabel, { color: themeColors.text }]}>
                    {theme.label}
                  </Text>
                  <View
                    style={[
                      styles.themeColorStrip,
                      {
                        backgroundColor: themeColors.border,
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: themeColors.primary }]} />
                    <View style={[styles.colorDot, { backgroundColor: themeColors.primaryDark }]} />
                    <View style={[styles.colorDot, { backgroundColor: themeColors.textMuted }]} />
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Feather name="check-circle" size={20} color={colors.primaryDark} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.modalCloseButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>بستن</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  darkModeStatus: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  darkModeStatusText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
  },
  darkModeStatusSub: {
    fontFamily: 'Vazir',
    fontSize: 12,
    marginTop: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  themeOption: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  themePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeLabel: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    marginBottom: 6,
  },
  themeColorStrip: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCloseText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 16,
  },
});