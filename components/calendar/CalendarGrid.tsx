import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import moment from 'moment-jalaali';
import { colors } from '../../theme/colors';
import { Task } from '../../services/database';
import DayCell from './DayCell';

interface CalendarGridProps {
  currentMonth: moment.Moment;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  allTasks: Task[];
}

export default function CalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  allTasks,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const year = (currentMonth as any).jYear();
    const month = (currentMonth as any).jMonth();
    const daysInMonth = (moment as any).jDaysInMonth(year, month);
    const firstDay = (currentMonth as any).clone().startOf('jMonth').day();
    const persianFirstDayOffset = (firstDay + 1) % 7;

    const daysArray = [];
    for (let i = 0; i < persianFirstDayOffset; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  }, [currentMonth]);

  const todayStr = moment().format('jYYYY/jMM/jDD');

  return (
    <View style={styles.calendarGrid}>
      {days.map((day, index) => {
        if (!day) {
          return <DayCell key={`empty-${index}`} day={null} dateStr="" isSelected={false} isToday={false} hasPendingTasks={false} onSelect={() => {}} />;
        }

        const dateStr = `${currentMonth.format('jYYYY/jMM')}/${String(day).padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const isToday = todayStr === dateStr;
        const hasPendingTasks = allTasks.some(
          (t) => t.date === dateStr && !t.completed
        );

        return (
          <DayCell
            key={`day-${day}`}
            day={day}
            dateStr={dateStr}
            isSelected={isSelected}
            isToday={isToday}
            hasPendingTasks={hasPendingTasks}
            onSelect={onSelectDate}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
});