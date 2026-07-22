// components/calendar/WeekDaysHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export default function WeekDaysHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.weekDaysContainer}>
      {WEEK_DAYS.map((day) => (
        <Text key={day} style={[styles.weekDay, { color: colors.textMuted }]}>
          {day}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  weekDaysContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
  },
});