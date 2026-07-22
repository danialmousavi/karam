import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import moment from 'moment-jalaali';
import { useTheme } from '../../context/ThemeContext';
import { Task } from '../../services/database';

interface CalendarStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  tasks: Task[];
}

export default function CalendarStrip({ selectedDate, onSelectDate, tasks }: CalendarStripProps) {
  const { colors } = useTheme();
  const todayString = moment().format('jYYYY/jMM/jDD');

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = -7; i <= 30; i++) {
      const date = moment().add(i, 'days');
      days.push({
        fullDate: date.format('jYYYY/jMM/jDD'),
        dayNum: date.format('jDD'),
        dayName: i === 0 ? 'امروز' : date.format('dddd').replace('شنبه', 'ش'),
        monthName: date.format('jMMMM'),
      });
    }
    return days;
  }, []);

  return (
    <View style={styles.calendarStripContainer}>
      <FlatList
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        data={calendarDays}
        keyExtractor={(item) => item.fullDate}
        contentContainerStyle={styles.calendarList}
        initialScrollIndex={7}
        getItemLayout={(data, index) => ({ length: 68, offset: 68 * index, index })}
        renderItem={({ item: day }) => {
          const isSelected = selectedDate === day.fullDate;
          const isToday = day.fullDate === todayString;
          return (
            <TouchableOpacity
              style={[
                styles.dateFlag,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                isSelected && { 
                  backgroundColor: colors.primaryDark, 
                  borderColor: colors.primaryDark,
                  transform: [{ scale: 1.05 }],
                },
                isToday && !isSelected && { borderColor: colors.primaryDark, borderWidth: 2 },
              ]}
              onPress={() => onSelectDate(day.fullDate)}
            >
              <Text style={[
                styles.dateFlagName, 
                { color: colors.textMuted },
                isSelected && { color: colors.surface },
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.dateFlagNum, 
                { color: colors.text },
                isSelected && { color: colors.surface },
              ]}>
                {day.dayNum}
              </Text>
              <Text style={[
                styles.dateFlagMonth, 
                { color: colors.textMuted },
                isSelected && { color: colors.surface },
              ]}>
                {day.monthName}
              </Text>
              {tasks.some((t) => t.date === day.fullDate && !t.completed) && (
                <View style={[
                  styles.taskIndicator, 
                  { backgroundColor: colors.primaryDark },
                  isSelected && { backgroundColor: colors.surface },
                ]} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarStripContainer: { height: 105, marginBottom: 10 },
  calendarList: { paddingHorizontal: 16, alignItems: 'center' },
  dateFlag: {
    width: 56,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    elevation: 1,
  },
  dateFlagName: {
    fontFamily: 'Vazir-Bold',
    fontSize: 11,
    marginBottom: 2,
  },
  dateFlagNum: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
  },
  dateFlagMonth: {
    fontFamily: 'Vazir',
    fontSize: 12,
    marginTop: 2,
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});