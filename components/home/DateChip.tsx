import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.dateChip,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
        isSelected && {
          backgroundColor: colors.primaryDark,
          borderColor: colors.primaryDark,
        },
      ]}
      onPress={() => onSelect(day.fullDate)}
    >
      <Text
        style={[
          styles.dateChipDayName,
          { color: colors.textMuted },
          isSelected && { color: colors.surface },
        ]}
      >
        {day.dayName}
      </Text>
      <Text
        style={[
          styles.dateChipDate,
          { color: colors.text },
          isSelected && { color: colors.surface },
        ]}
      >
        {day.dayNum}
      </Text>
      <Text
        style={[
          styles.dateChipMonth,
          { color: colors.textMuted },
          isSelected && { color: colors.surface },
        ]}
      >
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
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  dateChipDayName: {
    fontFamily: 'Vazir-Bold',
    fontSize: 10,
    marginBottom: 2,
  },
  dateChipDate: {
    fontFamily: 'Vazir-Bold',
    fontSize: 15,
  },
  dateChipMonth: {
    fontFamily: 'Vazir',
    fontSize: 11,
    marginTop: 2,
  },
});