import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  Modal, TextInput, Platform, KeyboardAvoidingView, Switch 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment-jalaali';
import { colors } from '../../theme/colors';
import { db, Category, Task } from '../../services/database';
import { useIsFocused } from '@react-navigation/native';
import CustomAlert from '../../components/CustomAlert';
import { scheduleTaskNotification, requestNotificationPermissions } from '../../services/notifications';
import TimePicker from '../../components/TimePicker';
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const todayString = moment().format('jYYYY/jMM/jDD');
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedNewTaskDates, setSelectedNewTaskDates] = useState<string[]>([todayString]);

  // 🌟 استیت‌های جدید برای ساعت کاستوم
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [selectedHour, setSelectedHour] = useState(moment().hour());
  const [selectedMinute, setSelectedMinute] = useState(moment().minute());

  const [alertConfig, setAlertConfig] = useState({
    visible: false, type: 'danger' as 'success' | 'danger' | 'warning', title: '', message: '', showCancel: false, onConfirm: () => {},
  });

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

  const modalDays = useMemo(() => {
    return calendarDays
      .filter(d => moment(d.fullDate, 'jYYYY/jMM/jDD').isSameOrAfter(moment(selectedDate, 'jYYYY/jMM/jDD')))
      .slice(0, 31);
  }, [calendarDays, selectedDate]);

  const loadData = async () => {
    const loadedTasks = await db.getTasks();
    const loadedCategories = await db.getCategories();
    setTasks(loadedTasks);
    setCategories(loadedCategories);
    if (loadedCategories.length > 0 && !selectedCategoryId) setSelectedCategoryId(loadedCategories[0].id);
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
      requestNotificationPermissions();
    }
  }, [isFocused]);

  const currentDayTasks = tasks.filter(t => t.date === selectedDate).reverse();

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      showAlert('عنوان تسک خالیه! ⚠️', 'لطفاً بنویس که دقیقاً چه کاری می‌خوای انجام بدی.', 'warning');
      return;
    }
    if (!selectedCategoryId) {
      showAlert('دسته‌بندی انتخاب نشده! 📂', 'لطفاً مشخص کن این کار مربوط به کدوم دسته‌بندیه.', 'warning');
      return;
    }
    if (selectedNewTaskDates.length === 0) {
      showAlert('روز انتخاب نشده! 📅', 'لطفاً حداقل یک روز رو برای انجام این کار انتخاب کن.', 'warning');
      return;
    }

    let notifId: string | null = null;
    let timeString: string | null = null;

    if (isReminderEnabled) {
      // فرمت کردن ساعت به صورت 09:05
      timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      notifId = await scheduleTaskNotification(newTaskTitle.trim(), selectedNewTaskDates[0], timeString) || null;
    }

    await db.addTask({
      title: newTaskTitle.trim(),
      categoryId: selectedCategoryId,
      dates: selectedNewTaskDates,
      time: timeString,
      notifId: notifId,
    });

    setNewTaskTitle('');
    setSelectedNewTaskDates([selectedDate]);
    setIsReminderEnabled(false);
    setSelectedHour(moment().hour());
    setSelectedMinute(moment().minute());
    setModalVisible(false);
    loadData();
  };

  const toggleNewTaskDate = (date: string) => {
    if (selectedNewTaskDates.includes(date)) {
      setSelectedNewTaskDates(prev => prev.filter(d => d !== date));
    } else {
      setSelectedNewTaskDates(prev => [...prev, date]);
    }
  };

  const selectUntilEndOfWeek = () => {
    const daysToSelect: string[] = [];
    let started = false;
    for (const day of calendarDays) {
      if (day.fullDate === selectedDate) started = true;
      if (started) {
        daysToSelect.push(day.fullDate);
        if (moment(day.fullDate, 'jYYYY/jMM/jDD').format('dddd').includes('جمعه')) break;
      }
    }
    setSelectedNewTaskDates(daysToSelect);
  };

  const handleToggleTask = async (id: string) => {
    await db.toggleTask(id);
    loadData();
  };

  const handleDeleteRequest = (id: string) => {
    setAlertConfig({
      visible: true, type: 'danger', title: 'حذف تسک؟ 🗑️', message: 'آیا مطمئن هستی که می‌خوای این کار رو پاک کنی؟', showCancel: true,
      onConfirm: async () => {
        await db.deleteTask(id);
        setAlertConfig(prev => ({ ...prev, visible: false }));
        loadData();
      }
    });
  };

  const showAlert = (title: string, message: string, type: 'warning'|'danger'|'success') => {
    setAlertConfig({ visible: true, type, title, message, showCancel: false, onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })) });
  };

  const getCategoryDetails = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { color: '#EEEEEE', textColor: '#9e9e9e', icon: 'box', name: 'نامشخص' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>کارام</Text>
        <Text style={styles.headerSubtitle}>چه خبر از امروز؟</Text>
      </View>

      <View style={styles.calendarStripContainer}>
        <FlatList
          horizontal inverted showsHorizontalScrollIndicator={false}
          data={calendarDays} keyExtractor={(item) => item.fullDate}
          contentContainerStyle={styles.calendarList} initialScrollIndex={7}
          getItemLayout={(data, index) => ({ length: 68, offset: 68 * index, index })}
          renderItem={({ item: day }) => {
            const isSelected = selectedDate === day.fullDate;
            const isToday = day.fullDate === todayString;
            return (
              <TouchableOpacity
                style={[styles.dateFlag, isSelected && styles.dateFlagSelected, isToday && !isSelected && styles.dateFlagToday]}
                onPress={() => setSelectedDate(day.fullDate)}
              >
                <Text style={[styles.dateFlagName, isSelected && styles.dateFlagTextSelected]}>{day.dayName}</Text>
                <Text style={[styles.dateFlagNum, isSelected && styles.dateFlagTextSelected]}>{day.dayNum}</Text>
                <Text style={[styles.dateFlagMonth, isSelected && styles.dateFlagTextSelected]}>{day.monthName}</Text>
                {tasks.some(t => t.date === day.fullDate && !t.completed) && (
                  <View style={[styles.taskIndicator, isSelected && {backgroundColor: colors.surface}]} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {currentDayTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>هیچ کاری برای این روز ثبت نکردی!</Text>
        </View>
      ) : (
        <FlatList
          data={currentDayTasks} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer}
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
                      {item.time && (
                        <View style={[styles.categoryBadge, { backgroundColor: colors.background, marginLeft: 6, borderWidth: 1, borderColor: colors.border }]}>
                          <Feather name="bell" size={10} color={colors.primaryDark} />
                          <Text style={[styles.categoryBadgeText, { color: colors.primaryDark }]}>{item.time}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteRequest(item.id)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          setSelectedNewTaskDates([selectedDate]); 
          setModalVisible(true);
        }} 
      >
        <Feather name="plus" size={24} color={colors.surface} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>ثبت کار جدید ✨</Text>

            <TextInput
              style={styles.input} placeholder="می‌خوای چیکار کنی؟..." placeholderTextColor={colors.textMuted}
              value={newTaskTitle} onChangeText={setNewTaskTitle}
            />

            <Text style={styles.sectionLabel}>دسته‌بندی رو انتخاب کن:</Text>
            <View style={styles.horizontalListContainer}>
              <FlatList
                horizontal inverted showsHorizontalScrollIndicator={false}
                data={categories} keyExtractor={(item) => item.id}
                contentContainerStyle={styles.horizontalScrollContent}
                renderItem={({ item: cat }) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      style={[styles.categoryChip, { backgroundColor: isSelected ? cat.color : colors.background }, isSelected && { borderColor: cat.textColor, borderWidth: 1 }]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <Feather name={cat.icon as any} size={16} color={isSelected ? cat.textColor : colors.textMuted} />
                      <Text style={[styles.categoryChipText, { color: isSelected ? cat.textColor : colors.textMuted }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <View style={styles.dateSelectionHeader}>
              <Text style={styles.sectionLabel}>برای چه روزهایی؟</Text>
              <TouchableOpacity onPress={selectUntilEndOfWeek}>
                <Text style={styles.selectAllText}>+ تا آخر هفته (جمعه)</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.horizontalListContainer}>
              <FlatList
                horizontal inverted showsHorizontalScrollIndicator={false}
                data={modalDays} keyExtractor={(item) => item.fullDate}
                contentContainerStyle={styles.horizontalScrollContent}
                renderItem={({ item: day }) => {
                  const isSelected = selectedNewTaskDates.includes(day.fullDate);
                  return (
                    <TouchableOpacity style={[styles.dateChip, isSelected && styles.dateChipSelected]} onPress={() => toggleNewTaskDate(day.fullDate)}>
                      <Text style={[styles.dateChipDayName, isSelected && styles.dateChipTextSelected]}>{day.dayName}</Text>
                      <Text style={[styles.dateChipDate, isSelected && styles.dateChipTextSelected]}>{day.dayNum}</Text>
                      <Text style={[styles.dateChipMonth, isSelected && styles.dateChipTextSelected]}>{day.monthName}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* 🌟 بخش جدید: انتخابگر زمان کاستوم (بسیار زیباتر) */}
            <View style={styles.reminderContainer}>
              <View style={styles.reminderHeader}>
                <Switch
                  value={isReminderEnabled}
                  onValueChange={setIsReminderEnabled}
                  trackColor={{ false: colors.border, true: colors.primaryDark }}
                  thumbColor={colors.surface}
                />
                <Text style={styles.sectionLabel}>یادآوری با آلارم 🔔</Text>
              </View>

              {isReminderEnabled && (
                <TimePicker
                  selectedHour={selectedHour}
                  selectedMinute={selectedMinute}
                  onHourChange={setSelectedHour}
                  onMinuteChange={setSelectedMinute}
                />
              )}
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

      <CustomAlert visible={alertConfig.visible} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} showCancel={alertConfig.showCancel} onConfirm={alertConfig.onConfirm} onCancel={() => setAlertConfig(prev => ({ ...prev, visible: false }))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { paddingHorizontal: 24, marginBottom: 16 },
  headerTitle: { fontFamily: 'Vazir-Bold', fontSize: 24, color: colors.primaryDark, textAlign: 'right' },
  headerSubtitle: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  
  calendarStripContainer: { height: 105, marginBottom: 10 },
  calendarList: { paddingHorizontal: 16, alignItems: 'center' },
  dateFlag: { width: 56, height: 90, backgroundColor: colors.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginHorizontal: 6, borderWidth: 1, borderColor: colors.border, elevation: 1 },
  dateFlagSelected: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark, transform: [{ scale: 1.05 }] },
  dateFlagToday: { borderColor: colors.primaryDark, borderWidth: 2 },
  dateFlagName: { fontFamily: 'Vazir-Bold', fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  dateFlagNum: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.text },
  dateFlagMonth: { fontFamily: 'Vazir-Medium', fontSize: 12, color: colors.textMuted, marginTop: 2 },
  dateFlagTextSelected: { color: colors.surface },
  taskIndicator: { position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primaryDark },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { fontFamily: 'Vazir-Bold', fontSize: 16, color: colors.textMuted },
  listContainer: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 10 },
  taskCard: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border, elevation: 1 },
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
  fab: { position: 'absolute', bottom: Platform.OS === 'ios' ? 115 : 105, left: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryDark, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 480 },
  modalDragHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.primaryDark, textAlign: 'right', marginBottom: 20 },
  input: { backgroundColor: colors.background, borderRadius: 14, padding: 16, fontFamily: 'Vazir-Bold', fontSize: 15, textAlign: 'right', color: colors.text, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  
  dateSelectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectAllText: { fontFamily: 'Vazir-Bold', fontSize: 12, color: colors.primaryDark },
  horizontalListContainer: { marginBottom: 24 },
  horizontalScrollContent: { alignItems: 'center', paddingHorizontal: 4 },
  
  categoryChip: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginHorizontal: 5, borderWidth: 1, borderColor: colors.border },
  categoryChipText: { fontFamily: 'Vazir-Bold', fontSize: 13, marginRight: 6 },

  dateChip: { width: 52, height: 82, borderRadius: 14, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: colors.border },
  dateChipSelected: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  dateChipDayName: { fontFamily: 'Vazir-Bold', fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  dateChipDate: { fontFamily: 'Vazir-Bold', fontSize: 15, color: colors.text },
  dateChipMonth: { fontFamily: 'Vazir-Medium', fontSize: 11, color: colors.textMuted, marginTop: 2 },
  dateChipTextSelected: { color: colors.surface },

  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.text, textAlign: 'right', marginBottom: 0 },
  
  // 🌟 استایل‌های ساعت کاستوم جدید
  reminderContainer: { marginBottom: 24, backgroundColor: colors.background, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  customTimePicker: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  timeColumn: { alignItems: 'center', marginHorizontal: 12 },
  timeArrow: { padding: 8, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  timeBox: { backgroundColor: colors.surface, width: 64, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginVertical: 8, borderWidth: 1, borderColor: colors.border, elevation: 1 },
  timeText: { fontFamily: 'Vazir-Bold', fontSize: 24, color: colors.primaryDark },
  timeColon: { fontFamily: 'Vazir-Bold', fontSize: 28, color: colors.textMuted, marginTop: 10 },

  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { backgroundColor: colors.background, marginRight: 10, borderWidth: 1, borderColor: colors.border },
  btnCancelText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.textMuted },
  btnSave: { backgroundColor: colors.primaryDark },
  btnSaveText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.surface },
});