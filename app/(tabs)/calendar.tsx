// app/(tabs)/calendar.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, SafeAreaView, StatusBar } from 'react-native';
import moment from 'moment-jalaali';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { db, Task, Category } from '../../services/database';
import { scheduleTaskNotification, requestNotificationPermissions } from '../../services/notifications';
import CustomAlert from '../../components/CustomAlert';
import FloatingActionButton from '../../components/home/FloatingActionButton';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import MonthNavigator from '../../components/calendar/MonthNavigator';
import WeekDaysHeader from '../../components/calendar/WeekDaysHeader';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import CalendarTaskList from '../../components/calendar/CalendarTaskList';
import AddTaskModal from '../../components/calendar/AddTaskModal';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function CalendarScreen() {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  
  const [selectedDate, setSelectedDate] = useState(moment().format('jYYYY/jMM/jDD'));
  const [monthView, setMonthView] = useState(moment());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [selectedHour, setSelectedHour] = useState(moment().hour());
  const [selectedMinute, setSelectedMinute] = useState(moment().minute());

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'danger' as 'success' | 'danger' | 'warning',
    title: '',
    message: '',
    showCancel: false,
    onConfirm: () => {},
  });

  const loadData = async () => {
    const loadedCategories = await db.getCategories();
    setCategories(loadedCategories);
    
    if (loadedCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(loadedCategories[0].id);
    }

    const allTasksData = await db.getTasks();
    setAllTasks(allTasksData);
    setTasks(allTasksData.filter((t) => t.date === selectedDate).reverse());
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
      requestNotificationPermissions();
    }
  }, [isFocused, selectedDate]);

  const showAlert = (title: string, message: string, type: 'warning' | 'danger' | 'success') => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      showCancel: false,
      onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      showAlert('عنوان تسک خالیه! ⚠️', 'لطفاً بنویس که دقیقاً چه کاری می‌خوای انجام بدی.', 'warning');
      return;
    }
    if (!selectedCategoryId) {
      showAlert('دسته‌بندی انتخاب نشده! 📂', 'لطفاً مشخص کن این کار مربوط به کدوم دسته‌بندیه.', 'warning');
      return;
    }

    const dates = [selectedDate];

    let notifId: string | null = null;
    let timeString: string | null = null;

    if (isReminderEnabled) {
      timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute
        .toString()
        .padStart(2, '0')}`;
      notifId =
        (await scheduleTaskNotification(newTaskTitle.trim(), dates[0], timeString)) || null;
    }

    await db.addTask({
      title: newTaskTitle.trim(),
      categoryId: selectedCategoryId,
      dates: dates,
      time: timeString,
      notifId: notifId,
    });

    setNewTaskTitle('');
    setIsReminderEnabled(false);
    setSelectedHour(moment().hour());
    setSelectedMinute(moment().minute());
    setModalVisible(false);
    loadData();
  };

  const handleToggleTask = async (id: string) => {
    await db.toggleTask(id);
    loadData();
  };

  const handleDeleteTask = (id: string) => {
    setAlertConfig({
      visible: true,
      type: 'danger',
      title: 'حذف تسک؟ 🗑️',
      message: 'آیا مطمئن هستی که می‌خوای این کار رو پاک کنی؟',
      showCancel: true,
      onConfirm: async () => {
        await db.deleteTask(id);
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        loadData();
      },
    });
  };

  const getCategoryDetails = (categoryId: string): Category => {
    const found = categories.find((c) => c.id === categoryId);
    if (found) return found;
    return {
      id: 'unknown',
      name: 'نامشخص',
      color: '#EEEEEE',
      textColor: '#9e9e9e',
      icon: 'box',
    };
  };

  const goToToday = () => {
    setMonthView(moment());
    setSelectedDate(moment().format('jYYYY/jMM/jDD'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWrapper}>
        <CalendarHeader onGoToToday={goToToday} />

        <View style={[
          styles.calendarCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
          }
        ]}>
          <MonthNavigator
            currentMonth={monthView}
            onPrevMonth={() => setMonthView(monthView.clone().subtract(1, 'jMonth'))}
            onNextMonth={() => setMonthView(monthView.clone().add(1, 'jMonth'))}
          />
          <WeekDaysHeader />
          <CalendarGrid
            currentMonth={monthView}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            allTasks={allTasks}
          />
        </View>

        <CalendarTaskList
          tasks={tasks}
          categories={categories}
          selectedDate={selectedDate}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          getCategoryDetails={getCategoryDetails}
        />

        <FloatingActionButton onPress={() => setModalVisible(true)} />

        <AddTaskModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleAddTask}
          selectedDate={selectedDate}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          categories={categories}
          isReminderEnabled={isReminderEnabled}
          setIsReminderEnabled={setIsReminderEnabled}
          selectedHour={selectedHour}
          selectedMinute={selectedMinute}
          onHourChange={setSelectedHour}
          onMinuteChange={setSelectedMinute}
        />

        <CustomAlert
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          showCancel={alertConfig.showCancel}
          onConfirm={alertConfig.onConfirm}
          onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
  },
  contentWrapper: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 5,
  },
  calendarCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 24,
    paddingVertical: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
  },
});