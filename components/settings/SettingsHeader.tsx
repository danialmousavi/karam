import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>تنظیمات</Text>
      <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
        اپلیکیشن رو مطابق سلیقه‌ات تنظیم کن
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 28,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontFamily: 'Vazir',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
  },
});