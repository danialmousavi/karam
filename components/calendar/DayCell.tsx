import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

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
  if (!day) {
    return <View style={styles.dayCellEmpty} />;
  }

  return (
    <TouchableOpacity
      style={[
        styles.dayCell,
        isSelected && styles.selectedDay,
        isToday && !isSelected && styles.todayCell,
      ]}
      onPress={() => onSelect(dateStr)}
    >
      <Text
        style={[
          styles.dayText,
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayText,
        ]}
      >
        {day}
      </Text>
      {hasPendingTasks && (
        <View style={[styles.taskDot, isSelected && styles.taskDotSelected]} />
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
  selectedDay: {
    backgroundColor: colors.primaryDark,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Vazir-Bold',
  },
  selectedDayText: {
    color: colors.surface,
  },
  todayText: {
    color: colors.primaryDark,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryDark,
    position: 'absolute',
    bottom: 4,
  },
  taskDotSelected: {
    backgroundColor: colors.surface,
  },
});