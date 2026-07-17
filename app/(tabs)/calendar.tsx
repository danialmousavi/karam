import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  SafeAreaView, Alert, Platform, StatusBar, Modal, TextInput, KeyboardAvoidingView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment-jalaali';
import { colors } from '../../theme/colors';
import { db, Task, Category } from '../../services/database';
import { useIsFocused } from '@react-navigation/native';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function CalendarScreen() {
  const isFocused = useIsFocused();
  
  const [selectedDate, setSelectedDate] = useState(moment().format('jYYYY/jMM/jDD'));
  const [monthView, setMonthView] = useState(moment());
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // State های مودال ساخت تسک
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // بارگذاری داده‌ها (تسک‌ها و دسته‌بندی‌ها)
  const loadData = async () => {
    const loadedCategories = await db.getCategories();
    setCategories(loadedCategories);
    
    if (loadedCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(loadedCategories[0].id);
    }

    const allTasksData = await db.getTasks();
    setAllTasks(allTasksData);
    setTasks(allTasksData.filter(t => t.date === selectedDate).reverse());
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
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
    loadData();
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert('حذف کار', 'آیا مطمئنی که می‌خوای این کار رو حذف کنی؟', [
      { text: 'انصراف', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        await db.deleteTask(id);
        loadData();
      }}
    ]);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('خطا', 'لطفاً عنوان کار را وارد کنید.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('خطا', 'لطفاً یک دسته‌بندی انتخاب کنید.');
      return;
    }

    await db.addTask({
      title: newTaskTitle.trim(),
      categoryId: selectedCategoryId,
      dates: [selectedDate],
    });

    setNewTaskTitle('');
    setModalVisible(false);
    loadData();
  };

  const getCategoryDetails = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { color: '#EEEEEE', textColor: '#9e9e9e', icon: 'box', name: 'نامشخص' };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* هدر صفحه */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>تقویم من 📅</Text>
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
                ]}>{day}</Text>
                {hasPendingTasks && <View style={[styles.taskDot, isSelected && styles.taskDotSelected]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* لیست تسک‌ها */}
      <View style={styles.tasksSection}>
        <View style={styles.taskListHeader}>
          <Text style={styles.taskLabel}>
            برنامه {selectedDate === moment().format('jYYYY/jMM/jDD') ? 'امروز' : selectedDate}
          </Text>
        </View>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>هیچ کاری برای این روز ثبت نکردی!</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const cat = getCategoryDetails(item.categoryId);
              return (
                <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
                  <View style={styles.taskLeft}>
                    <TouchableOpacity style={[styles.checkbox, item.completed && styles.checkboxChecked]} onPress={() => handleToggleTask(item.id)}>
                      {item.completed && <Feather name="check" size={16} color={colors.surface} />}
                    </TouchableOpacity>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>{item.title}</Text>
                      <View style={styles.badgeContainer}>
                        <View style={[styles.categoryBadge, { backgroundColor: cat.color }]}>
                          <Feather name={cat.icon as any} size={10} color={cat.textColor} />
                          <Text style={[styles.categoryBadgeText, { color: cat.textColor }]}>{cat.name}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.deleteBtn}>
                    <Feather name="trash-2" size={20} color={colors.danger || '#ef4444'} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* دکمه شناور اضافه کردن تسک */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)} 
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color={colors.surface} />
      </TouchableOpacity>

      {/* مودال ساخت تسک */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>ثبت کار برای {selectedDate} ✨</Text>

            <TextInput
              style={styles.input}
              placeholder="می‌خوای چیکار کنی؟..."
              placeholderTextColor={colors.textMuted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus={true}
            />

            <Text style={styles.sectionLabel}>دسته‌بندی رو انتخاب کن:</Text>
            <View style={styles.horizontalListContainer}>
              <FlatList
                horizontal
                inverted
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.horizontalScrollContent}
                renderItem={({ item: cat }) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        { backgroundColor: isSelected ? cat.color : colors.background },
                        isSelected && { borderColor: cat.textColor, borderWidth: 1 }
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <Feather name={cat.icon as any} size={16} color={isSelected ? cat.textColor : colors.textMuted} />
                      <Text style={[styles.categoryChipText, { color: isSelected ? cat.textColor : colors.textMuted }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleAddTask}>
                <Text style={styles.btnSaveText}>ثبت کار</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // تغییر اصلی اینجاست: رفع مشکل چسبیدن به سقف دیوایس در اندروید و آیفون‌های جدید 👇
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0 
  },
  
  // اضافه کردن پدینگ ملایم برای ایجاد فضا بعد از لبه‌ی ناچ دیوایس
  pageHeader: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingTop: 15, // یک فاصله استاندارد اضافی
    marginBottom: 5 
  },
  
  pageTitle: { fontFamily: 'Vazir-Bold', fontSize: 24, color: colors.primaryDark },
  todayButton: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  todayButtonText: { fontFamily: 'Vazir-Medium', fontSize: 13, color: colors.primaryDark, marginRight: 6 },
  
  calendarCard: { backgroundColor: colors.surface, marginHorizontal: 20, marginTop: 15, borderRadius: 24, paddingVertical: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: colors.border },
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

  tasksSection: { flex: 1, marginTop: 10 },
  taskListHeader: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 10 },
  taskLabel: { fontFamily: 'Vazir-Bold', fontSize: 16, color: colors.text, textAlign: 'right' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 130 }, 
  
  taskCard: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border, elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  taskCardCompleted: { backgroundColor: colors.background, opacity: 0.7 },
  taskLeft: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  checkboxChecked: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  taskInfo: { flex: 1 },
  taskTitle: { fontFamily: 'Vazir-Bold', fontSize: 15, color: colors.text, textAlign: 'right', marginBottom: 6 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: colors.textMuted },
  badgeContainer: { flexDirection: 'row-reverse' },
  categoryBadge: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  categoryBadgeText: { fontFamily: 'Vazir-Bold', fontSize: 10, marginRight: 4 },
  deleteBtn: { padding: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5, marginTop: 40 },
  emptyText: { fontFamily: 'Vazir-Bold', fontSize: 16, color: colors.textMuted },

  fab: { 
    position: 'absolute', 
    bottom: Platform.OS === 'ios' ? 115 : 105, 
    left: 28, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: colors.primaryDark, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5, 
    shadowColor: colors.primaryDark, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 4 } 
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 350 },
  modalDragHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.primaryDark, textAlign: 'right', marginBottom: 20 },
  input: { backgroundColor: colors.background, borderRadius: 14, padding: 16, fontFamily: 'Vazir-Bold', fontSize: 15, textAlign: 'right', color: colors.text, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.text, textAlign: 'right', marginBottom: 12 },
  horizontalListContainer: { marginBottom: 24 },
  horizontalScrollContent: { alignItems: 'center', paddingHorizontal: 4 },
  categoryChip: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginHorizontal: 5, borderWidth: 1, borderColor: colors.border },
  categoryChipText: { fontFamily: 'Vazir-Bold', fontSize: 13, marginRight: 6 },
  
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { backgroundColor: colors.background, marginRight: 10, borderWidth: 1, borderColor: colors.border },
  btnCancelText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.textMuted },
  btnSave: { backgroundColor: colors.primaryDark },
  btnSaveText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.surface },
});