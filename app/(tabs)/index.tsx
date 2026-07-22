// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import moment from 'moment-jalaali';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { db, Category, Task } from '../../services/database';
import { scheduleTaskNotification, requestNotificationPermissions } from '../../services/notifications';
import CustomAlert from '../../components/CustomAlert';
import HomeHeader from '../../components/home/HomeHeader';
import CalendarStrip from '../../components/home/CalendarStrip';
import TaskList from '../../components/home/TaskList';
import AddTaskModal from '../../components/home/AddTaskModal';
import FloatingActionButton from '../../components/home/FloatingActionButton';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function HomeScreen() {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('jYYYY/jMM/jDD'));
  const [modalVisible, setModalVisible] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedNewTaskDates, setSelectedNewTaskDates] = useState<string[]>([
    moment().format('jYYYY/jMM/jDD'),
  ]);
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
    const loadedTasks = await db.getTasks();
    const loadedCategories = await db.getCategories();
    setTasks(loadedTasks);
    setCategories(loadedCategories);
    if (loadedCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(loadedCategories[0].id);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
      requestNotificationPermissions();
    }
  }, [isFocused]);

  const currentDayTasks = tasks.filter((t) => t.date === selectedDate).reverse();

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
    if (selectedNewTaskDates.length === 0) {
      showAlert('روز انتخاب نشده! 📅', 'لطفاً حداقل یک روز رو برای انجام این کار انتخاب کن.', 'warning');
      return;
    }

    let notifId: string | null = null;
    let timeString: string | null = null;

    if (isReminderEnabled) {
      timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute
        .toString()
        .padStart(2, '0')}`;
      notifId =
        (await scheduleTaskNotification(newTaskTitle.trim(), selectedNewTaskDates[0], timeString)) ||
        null;
    }

    await db.addTask({
      title: newTaskTitle.trim(),
      categoryId: selectedCategoryId,
      dates: selectedNewTaskDates,
      time: timeString,
      notifId: notifId,
    });

    setNewTaskTitle('');
    setSelectedNewTaskDates([moment().format('jYYYY/jMM/jDD')]);
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

  const handleDeleteRequest = (id: string) => {
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

  const selectUntilEndOfWeek = () => {
    const daysToSelect: string[] = [];
    let started = false;
    const calendarDays = [];
    for (let i = -7; i <= 30; i++) {
      const date = moment().add(i, 'days');
      calendarDays.push(date.format('jYYYY/jMM/jDD'));
    }
    for (const day of calendarDays) {
      if (day === selectedDate) started = true;
      if (started) {
        daysToSelect.push(day);
        if (moment(day, 'jYYYY/jMM/jDD').format('dddd').includes('جمعه')) break;
      }
    }
    setSelectedNewTaskDates(daysToSelect);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader />
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        tasks={tasks}
      />
      <TaskList
        tasks={currentDayTasks}
        categories={categories}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteRequest}
        getCategoryDetails={getCategoryDetails}
      />
      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddTask}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        categories={categories}
        selectedDate={selectedDate}
        selectedNewTaskDates={selectedNewTaskDates}
        setSelectedNewTaskDates={setSelectedNewTaskDates}
        isReminderEnabled={isReminderEnabled}
        setIsReminderEnabled={setIsReminderEnabled}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onHourChange={setSelectedHour}
        onMinuteChange={setSelectedMinute}
        onSelectAllWeek={selectUntilEndOfWeek}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
});