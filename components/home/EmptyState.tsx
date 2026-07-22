// components/home/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function EmptyState() {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>
        هیچ کاری برای این روز ثبت نکردی!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 16,
  },
});