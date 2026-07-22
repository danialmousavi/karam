import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function HomeHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>کارام</Text>
      <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>چه خبر از امروز؟</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, marginBottom: 16 },
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