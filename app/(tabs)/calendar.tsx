// مسیر فایل: app/(tabs)/calendar.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment-jalaali';
import { colors } from '../../theme/colors'; // ایمپورت تم اختصاصی شما
import { db, Task } from '../../services/database';
import { useIsFocused } from '@react-navigation/native';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function CalendarScreen() {
  const isFocused = useIsFocused();
  
  // تاریخ انتخاب شده به صورت پیش‌فرض امروز است
  const [selectedDate, setSelectedDate] = useState(moment().format('jYYYY/jMM/jDD'));
  // ماهی که در حال نمایش است
  const [monthView, setMonthView] = useState(moment());
  const [tasks, setTasks] = useState<Task[]>([]);

  // بارگذاری تسک‌های مربوط به روز انتخاب شده
  const loadTasksForDate = async (date: string) => {
    const allTasks = await db.getTasks();
    const filtered = allTasks.filter(t => t.date === date);
    setTasks(filtered);
  };

  useEffect(() => {
    if (isFocused) {
      loadTasksForDate(selectedDate);
    }
  }, [isFocused, selectedDate]);

  // رفتن به ماه قبل
  const handlePrevMonth = () => {
    setMonthView(monthView.clone().subtract(1, 'jMonth'));
  };

  // رفتن به ماه بعد
  const handleNextMonth = () => {
    setMonthView(monthView.clone().add(1, 'jMonth'));
  };

  // تولید روزهای شبکه تقویم بر اساس شروع از شنبه
  const generateDays = () => {
    const year = (monthView as any).jYear();
    const month = (monthView as any).jMonth();
    const daysInMonth = (moment as any).jDaysInMonth(year, month);
    
    // پیدا کردن روز اول ماه در هفته (0 = یکشنبه ... 6 = شنبه)
    const firstDay = (monthView as any).clone().startOf('jMonth').day(); 
    
    // تبدیل روز به فرمت شروع از شنبه
    const persianFirstDayOffset = (firstDay + 1) % 7;
    
    const days = [];
    // خانه‌های خالی ابتدای ماه
    for (let i = 0; i < persianFirstDayOffset; i++) {
      days.push(null);
    }
    // شماره روزهای ماه
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // تغییر وضعیت انجام کار مستقیم از داخل لیست تقویم
  const handleToggleTask = async (id: string) => {
    await db.toggleTask(id);
    loadTasksForDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* هدر ناوبری ماه */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevMonth}>
          <Feather name="chevron-right" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{monthView.format('jMMMM jYYYY')}</Text>
        
        <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
          <Feather name="chevron-left" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* روزهای هفته */}
      <View style={styles.weekDaysContainer}>
        {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      {/* گرید روزهای ماه */}
      <View style={styles.calendarGrid}>
        {generateDays().map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
          }

          const dateStr = `${monthView.format('jYYYY/jMM')}/${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isToday = moment().format('jYYYY/jMM/jDD') === dateStr;

          return (
            <TouchableOpacity 
              key={`day-${day}`} 
              style={[
                styles.dayCell, 
                isSelected && styles.selectedDay,
                isToday && !isSelected && styles.todayCell
              ]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <Text style={[
                styles.dayText, 
                isSelected && styles.selectedDayText,
                isToday && !isSelected && styles.todayText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* بخش نمایش تسک‌های روز */}
      <View style={styles.taskListHeader}>
        <Text style={styles.taskLabel}>کارهای روز {selectedDate}</Text>
      </View>
      
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.taskCard, item.completed && styles.taskCardCompleted]} 
            onPress={() => handleToggleTask(item.id)}
          >
            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
              {item.completed && <Feather name="check" size={14} color={colors.surface} />}
            </View>
            <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="coffee" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>کاری برای این روز برنامه‌ریزی نشده!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingVertical: 15,
    marginTop: 10
  },
  headerTitle: { fontFamily: 'Vazir-Bold', fontSize: 20, color: colors.text },
  navButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: colors.surface, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  weekDaysContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 8 
  },
  weekDay: { 
    width: '14.28%', 
    textAlign: 'center', 
    color: colors.textMuted, 
    fontFamily: 'Vazir-Bold',
    fontSize: 13 
  },
  calendarGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 20, 
    paddingBottom: 15,
    backgroundColor: colors.surface, 
    marginHorizontal: 20, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  dayCell: { 
    width: '14.28%', 
    height: 42, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 12,
    marginVertical: 3
  },
  dayCellEmpty: { 
    width: '14.28%', 
    height: 42 
  },
  selectedDay: { 
    backgroundColor: colors.primaryDark 
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },
  dayText: { 
    fontSize: 14, 
    color: colors.text, 
    fontFamily: 'Vazir-Bold' 
  },
  selectedDayText: { 
    color: colors.surface 
  },
  todayText: {
    color: colors.primaryDark
  },
  taskListHeader: { 
    paddingHorizontal: 25, 
    paddingTop: 20,
    paddingBottom: 10
  },
  taskLabel: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 16, 
    color: colors.text,
    textAlign: 'right'
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  taskCard: { 
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface, 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  taskCardCompleted: {
    opacity: 0.7
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  checkboxChecked: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark
  },
  taskTitle: { 
    flex: 1,
    color: colors.text, 
    fontFamily: 'Vazir-Bold',
    fontSize: 15,
    textAlign: 'right'
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 30
  },
  emptyText: { 
    textAlign: 'center', 
    color: colors.textMuted, 
    fontFamily: 'Vazir-Bold',
    marginTop: 10,
    fontSize: 14
  }
});