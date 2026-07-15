import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
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

  const loadData = async () => {
    const fetchedTasks = await db.getTasks();
    setAllTasks(fetchedTasks);
    setTasks(fetchedTasks.filter(t => t.date === selectedDate));
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused, selectedDate]);

  const handleDelete = (id: string) => {
    Alert.alert('حذف تسک', 'آیا مطمئنی که میخوای این تسک رو حذف کنی؟', [
      { text: 'انصراف', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        await db.deleteTask(id);
        loadData();
      }}
    ]);
  };

  const handleToggleTask = async (id: string) => {
    await db.toggleTask(id);
    loadData();
  };

  const calendarDays = useMemo(() => {
    const year = (monthView as any).jYear();
    const month = (monthView as any).jMonth();
    const daysInMonth = (moment as any).jDaysInMonth(year, month);
    const firstDay = (monthView as any).clone().startOf('jMonth').day(); 
    const persianFirstDayOffset = (firstDay + 1) % 7;
    const days = [];
    for (let i = 0; i < persianFirstDayOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [monthView]);

  return (
    <SafeAreaView style={styles.container}>
      {/* هدر صفحه */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>تقویم</Text>
      </View>

      {/* بخش تقویم */}
      <View style={styles.calendarSection}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={() => setMonthView(monthView.clone().subtract(1, 'jMonth'))}>
            <Feather name="chevron-right" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{monthView.format('jMMMM jYYYY')}</Text>
          </View>
          <TouchableOpacity style={styles.navButton} onPress={() => setMonthView(monthView.clone().add(1, 'jMonth'))}>
            <Feather name="chevron-left" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>
          {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
            const dateStr = `${monthView.format('jYYYY/jMM')}/${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const hasTasks = allTasks.some(t => t.date === dateStr && !t.completed);
            return (
              <TouchableOpacity key={`day-${day}`} style={[styles.dayCell, isSelected && styles.selectedDay]} onPress={() => setSelectedDate(dateStr)}>
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                {hasTasks && <View style={[styles.dot, isSelected && styles.selectedDot]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* لیست تسک‌ها */}
      <View style={styles.taskListWrapper}>
        <Text style={styles.sectionHeader}>کارهای {selectedDate === moment().format('jYYYY/jMM/jDD') ? 'امروز' : selectedDate}</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
              <TouchableOpacity style={styles.checkbox} onPress={() => handleToggleTask(item.id)}>
                {item.completed && <Feather name="check" size={16} color={colors.surface} />}
              </TouchableOpacity>
              <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>{item.title}</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Feather name="trash-2" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>کاری برای این روز ثبت نشده</Text>
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
  pageHeader: { padding: 20, alignItems: 'center' },
  pageTitle: { fontFamily: 'Vazir-Bold', fontSize: 20, color: colors.text },
  // تقویم
  calendarSection: { paddingBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontFamily: 'Vazir-Bold', fontSize: 16, color: colors.text },
  navButton: { width: 35, height: 35, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  weekDaysContainer: { flexDirection: 'row-reverse', paddingHorizontal: 20, marginBottom: 5 },
  weekDay: { width: '14.28%', textAlign: 'center', color: colors.textMuted, fontFamily: 'Vazir-Bold', fontSize: 12 },
  calendarGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', paddingHorizontal: 15 },
  dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  selectedDay: { backgroundColor: colors.primaryDark },
  dayText: { fontSize: 13, color: colors.text, fontFamily: 'Vazir-Medium' },
  selectedDayText: { color: colors.surface, fontFamily: 'Vazir-Bold' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.primaryDark, marginTop: 3 },
  selectedDot: { backgroundColor: colors.surface },
  // لیست تسک‌ها
  taskListWrapper: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { fontFamily: 'Vazir-Bold', fontSize: 15, color: colors.text, textAlign: 'right', marginBottom: 10, marginTop: 10 },
  listContainer: { paddingBottom: 20 },
  taskCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  taskCardCompleted: { opacity: 0.6 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.primaryDark, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  taskTitle: { flex: 1, color: colors.text, fontFamily: 'Vazir-Medium', fontSize: 14, textAlign: 'right' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: colors.textMuted },
  deleteBtn: { padding: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: colors.textMuted, fontFamily: 'Vazir-Medium' }
});