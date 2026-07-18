// components/home/DateChip.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface DateChipProps {
  day: {
    fullDate: string;
    dayNum: string;
    dayName: string;
    monthName: string;
  };
  isSelected: boolean;
  onSelect: (date: string) => void;
}

export default function DateChip({ day, isSelected, onSelect }: DateChipProps) {
  return (
    <TouchableOpacity
      style={[styles.dateChip, isSelected && styles.dateChipSelected]}
      onPress={() => onSelect(day.fullDate)}
    >
      <Text style={[styles.dateChipDayName, isSelected && styles.dateChipTextSelected]}>
        {day.dayName}
      </Text>
      <Text style={[styles.dateChipDate, isSelected && styles.dateChipTextSelected]}>
        {day.dayNum}
      </Text>
      <Text style={[styles.dateChipMonth, isSelected && styles.dateChipTextSelected]}>
        {day.monthName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dateChip: {
    width: 52,
    height: 82,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipSelected: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  dateChipDayName: { fontFamily: 'Vazir-Bold', fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  dateChipDate: { fontFamily: 'Vazir-Bold', fontSize: 15, color: colors.text },
  dateChipMonth: { fontFamily: 'Vazir-Medium', fontSize: 11, color: colors.textMuted, marginTop: 2 },
  dateChipTextSelected: { color: colors.surface },
});