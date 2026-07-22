import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import moment from 'moment-jalaali';
import { colors } from '../../theme/colors';
import { Task } from '../../services/database';

interface CalendarStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  tasks: Task[];
}

export default function CalendarStrip({ selectedDate, onSelectDate, tasks }: CalendarStripProps) {
  const todayString = moment().format('jYYYY/jMM/jDD');

  // متغیرهای تنظیم بازه تقویم (به راحتی می‌توانی تغییرشان دهی)
  const PAST_DAYS = 365;   // ۱ سال گذشته
  const FUTURE_DAYS = 365; // ۱ سال آینده

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
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
        
        // ایندکس اسکرول اولیه را دقیقاً روی روز "امروز" تنظیم می‌کنیم
        initialScrollIndex={PAST_DAYS} 
        
        getItemLayout={(data, index) => ({ length: 68, offset: 68 * index, index })}
        
        // --- پراپ‌های بهینه‌سازی پرفورمنس برای لیست‌های بزرگ ---
        initialNumToRender={7} // تعداد آیتم‌هایی که در لود اولیه ساخته می‌شوند
        maxToRenderPerBatch={14} // تعداد آیتم‌هایی که در هر اسکرول به حافظه اضافه می‌شوند
        windowSize={5} // مدیریت حافظه (آیتم‌های دورتر از دید را از حافظه پاک می‌کند)
        removeClippedSubviews={true} // برای اندروید عالی است و رم را خالی نگه می‌دارد
        // --------------------------------------------------------

        renderItem={({ item: day }) => {
          const isSelected = selectedDate === day.fullDate;
          const isToday = day.fullDate === todayString;
          return (
            <TouchableOpacity
              style={[
                styles.dateFlag,
                isSelected && styles.dateFlagSelected,
                isToday && !isSelected && styles.dateFlagToday,
              ]}
              onPress={() => onSelectDate(day.fullDate)}
            >
              <Text style={[styles.dateFlagName, isSelected && styles.dateFlagTextSelected]}>
                {day.dayName}
              </Text>
              <Text style={[styles.dateFlagNum, isSelected && styles.dateFlagTextSelected]}>
                {day.dayNum}
              </Text>
              <Text style={[styles.dateFlagMonth, isSelected && styles.dateFlagTextSelected]}>
                {day.monthName}
              </Text>
              {tasks.some((t) => t.date === day.fullDate && !t.completed) && (
                <View style={[styles.taskIndicator, isSelected && { backgroundColor: colors.surface }]} />
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  dateFlagSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    transform: [{ scale: 1.05 }],
  },
  dateFlagToday: { borderColor: colors.primaryDark, borderWidth: 2 },
  dateFlagName: { fontFamily: 'Vazir-Bold', fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  dateFlagNum: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.text },
  dateFlagMonth: { fontFamily: 'Vazir-Medium', fontSize: 12, color: colors.textMuted, marginTop: 2 },
  dateFlagTextSelected: { color: colors.surface },
  taskIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryDark,
  },
});