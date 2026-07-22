import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function CategoriesHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>دسته‌بندی‌ها 📂</Text>
      <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>برنامه‌هات رو تفکیک و منظم کن</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 24,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
  },
});