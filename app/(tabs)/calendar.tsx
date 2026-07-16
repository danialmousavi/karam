import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Alert, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment-jalaali';
import { colors } from '../../theme/colors';
import { db, Task } from '../../services/database';
import { useIsFocused } from '@react-navigation/native';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function CalendarScreen() {
  const isFocused = useIsFocused();
  
  const [selectedDate, setSelectedDate] = useState(moment().format('jYYYY/jMM/jDD'));
  const [monthView, setMonthView] = useState(moment());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // بارگذاری داده‌ها
  const loadTasksForDate = async (date: string) => {
    const allTasksData = await db.getTasks();
    setAllTasks(allTasksData);
    setTasks(allTasksData.filter(t => t.date === date));
  };

  useEffect(() => {
    if (isFocused) {
      loadTasksForDate(selectedDate);
    }
  }, [isFocused, selectedDate]);

  const handlePrevMonth = () => setMonthView(monthView.clone().subtract(1, 'jMonth'));
  const handleNextMonth = () => setMonthView(monthView.clone().add(1, 'jMonth'));
  
  const goToToday = () => {
    setMonthView(moment());
    setSelectedDate(moment().format('jYYYY/jMM/jDD'));
  };

  const generateDays = () => {
    const year = (monthView as any).jYear();
    const month = (monthView as any).jMonth();
    const daysInMonth = (moment as any).jDaysInMonth(year, month);
    const firstDay = (monthView as any).clone().startOf('jMonth').day(); 
    const persianFirstDayOffset = (firstDay + 1) % 7;
    
    const days = [];
    for (let i = 0; i < persianFirstDayOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const handleToggleTask = async (id: string) => {
    await db.toggleTask(id);
    loadTasksForDate(selectedDate);
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert('حذف کار', 'آیا مطمئنی که می‌خوای این کار رو حذف کنی؟', [
      { text: 'انصراف', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        await db.deleteTask(id);
        loadTasksForDate(selectedDate);
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* هدر صفحه */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>تقویم من</Text>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>امروز</Text>
          <Feather name="calendar" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* بخش تقویم */}
      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
            <Feather name="chevron-right" size={22} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>{monthView.format('jMMMM jYYYY')}</Text>
          
          <TouchableOpacity style={styles.navButton} onPress={handlePrevMonth}>
            <Feather name="chevron-left" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>
          {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {generateDays().map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;

            const dateStr = `${monthView.format('jYYYY/jMM')}/${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isToday = moment().format('jYYYY/jMM/jDD') === dateStr;
            const hasPendingTasks = allTasks.some(t => t.date === dateStr && !t.completed);

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
                {hasPendingTasks && <View style={[styles.taskDot, isSelected && styles.taskDotSelected]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* بخش لیست تسک‌ها - با استفاده از FlatList برای اسکرول */}
      <View style={styles.tasksSection}>
        <View style={styles.taskListHeader}>
          <Text style={styles.taskLabel}>
            برنامه {selectedDate === moment().format('jYYYY/jMM/jDD') ? 'امروز' : selectedDate}
          </Text>
        </View>
        
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => handleToggleTask(item.id)}>
                <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                  {item.completed && <Feather name="check" size={14} color={colors.surface} />}
                </View>
              </TouchableOpacity>
              
              <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                {item.title}
              </Text>

              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTask(item.id)}>
                <Feather name="trash-2" size={18} color={colors.danger || '#ef4444'} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="coffee" size={32} color={colors.primaryDark} />
              </View>
              <Text style={styles.emptyText}>برای این روز برنامه‌ای ثبت نشده!</Text>
              <Text style={styles.emptySubText}>می‌تونی استراحت کنی یا کار جدیدی اضافه کنی</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // هدر صفحه
  pageHeader: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 5 
  },
  // تغییر رنگ تایتل به رنگ سبز اصلی تم
  pageTitle: { fontFamily: 'Vazir-Bold', fontSize: 22, color: colors.primaryDark },
  
  todayButton: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    backgroundColor: colors.surface, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  todayButtonText: { fontFamily: 'Vazir-Medium', fontSize: 13, color: colors.primaryDark, marginRight: 6 },
  
  calendarCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 24,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  monthNav: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  monthTitle: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.text },
  navButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  weekDaysContainer: { flexDirection: 'row-reverse', paddingHorizontal: 15, marginBottom: 10 },
  weekDay: { width: '14.28%', textAlign: 'center', color: colors.textMuted, fontFamily: 'Vazir-Bold', fontSize: 13 },
  calendarGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', paddingHorizontal: 15 },
  dayCell: { width: '14.28%', height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginVertical: 2 },
  dayCellEmpty: { width: '14.28%', height: 42, marginVertical: 2 },
  selectedDay: { backgroundColor: colors.primaryDark },
  todayCell: { borderWidth: 1.5, borderColor: colors.primaryDark },
  dayText: { fontSize: 14, color: colors.text, fontFamily: 'Vazir-Bold' },
  selectedDayText: { color: colors.surface },
  todayText: { color: colors.primaryDark },
  taskDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primaryDark, position: 'absolute', bottom: 4 },
  taskDotSelected: { backgroundColor: colors.surface },

  // بخش لیست تسک‌ها
  tasksSection: { flex: 1, marginTop: 10 },
  taskListHeader: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 10 },
  taskLabel: { fontFamily: 'Vazir-Bold', fontSize: 16, color: colors.text, textAlign: 'right' },
  // پدینگ پایین لیست رو بیشتر کردم که اگر تسک‌ها زیاد بود، آخری‌ها زیر منوی پایین مخفی نشن
  listContainer: { paddingHorizontal: 20, paddingBottom: 80 },
  taskCard: { 
    flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.surface, 
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 12, 
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
  },
  taskCardCompleted: { opacity: 0.6, backgroundColor: colors.background },
  checkboxContainer: { padding: 4, marginLeft: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: colors.primaryDark, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: colors.primaryDark },
  taskTitle: { flex: 1, color: colors.text, fontFamily: 'Vazir-Bold', fontSize: 14, textAlign: 'right' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: colors.textMuted },
  deleteButton: { padding: 8, marginRight: -8 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: `${colors.primaryDark}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyText: { textAlign: 'center', color: colors.text, fontFamily: 'Vazir-Bold', fontSize: 16, marginBottom: 5 },
  emptySubText: { textAlign: 'center', color: colors.textMuted, fontFamily: 'Vazir-Medium', fontSize: 13 }
});