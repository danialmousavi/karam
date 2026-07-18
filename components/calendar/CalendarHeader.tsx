// components/calendar/CalendarHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface CalendarHeaderProps {
  onGoToToday: () => void;
}

export default function CalendarHeader({ onGoToToday }: CalendarHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.pageTitle}>تقویم من 📅</Text>
        <TouchableOpacity style={styles.todayButton} onPress={onGoToToday}>
          <Text style={styles.todayButtonText}>امروز</Text>
          <Feather name="calendar" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSubtitle}>با تقویم برنامت رو بچین</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 24,
    color: colors.primaryDark,
  },
  headerSubtitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  todayButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  todayButtonText: {
    fontFamily: 'Vazir-Medium',
    fontSize: 13,
    color: colors.primaryDark,
    marginRight: 6,
  },
});