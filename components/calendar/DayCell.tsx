// components/calendar/DayCell.tsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface DayCellProps {
  day: number | null;
  dateStr: string;
  isSelected: boolean;
  isToday: boolean;
  hasPendingTasks: boolean;
  onSelect: (date: string) => void;
}

export default function DayCell({
  day,
  dateStr,
  isSelected,
  isToday,
  hasPendingTasks,
  onSelect,
}: DayCellProps) {
  const { colors } = useTheme();

  if (!day) {
    return <View style={styles.dayCellEmpty} />;
  }

  return (
    <TouchableOpacity
      style={[
        styles.dayCell,
        { backgroundColor: 'transparent' },
        isSelected && { backgroundColor: colors.primaryDark },
        isToday && !isSelected && { borderWidth: 1.5, borderColor: colors.primaryDark },
      ]}
      onPress={() => onSelect(dateStr)}
    >
      <Text
        style={[
          styles.dayText,
          { color: colors.text },
          isSelected && { color: colors.surface },
          isToday && !isSelected && { color: colors.primaryDark },
        ]}
      >
        {day}
      </Text>
      {hasPendingTasks && (
        <View style={[
          styles.taskDot,
          { backgroundColor: colors.primaryDark },
          isSelected && { backgroundColor: colors.surface },
        ]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 42,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Vazir-Bold',
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
});