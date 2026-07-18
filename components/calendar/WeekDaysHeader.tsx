import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export default function WeekDaysHeader() {
  return (
    <View style={styles.weekDaysContainer}>
      {WEEK_DAYS.map((day) => (
        <Text key={day} style={styles.weekDay}>
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
    color: colors.textMuted,
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
  },
});