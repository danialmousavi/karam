import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import moment from 'moment-jalaali';
import { useTheme } from '../../context/ThemeContext';
import { Category } from '../../services/database';
import CategoryChip from './CategoryChip';
import DateChip from './DateChip';
import ReminderSection from './ReminderSection';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  newTaskTitle: string;
  setNewTaskTitle: (text: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  categories: Category[];
  selectedDate: string;
  selectedNewTaskDates: string[];
  setSelectedNewTaskDates: (dates: string[]) => void;
  isReminderEnabled: boolean;
  setIsReminderEnabled: (enabled: boolean) => void;
  selectedHour: number;
  selectedMinute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onSelectAllWeek: () => void;
}

export default function AddTaskModal({
  visible,
  onClose,
  onSave,
  newTaskTitle,
  setNewTaskTitle,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  selectedDate,
  selectedNewTaskDates,
  setSelectedNewTaskDates,
  isReminderEnabled,
  setIsReminderEnabled,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
  onSelectAllWeek,
}: AddTaskModalProps) {
  const { colors } = useTheme();

  const calendarDays = useMemo(() => {
    const days = [];
    const baseDate = moment(); 
    for (let i = -7; i <= 30; i++) {
      const date = baseDate.clone().add(i, 'days');
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
    return calendarDays.filter((d) =>
      moment(d.fullDate, 'jYYYY/jMM/jDD').isSameOrAfter(
        moment(selectedDate, 'jYYYY/jMM/jDD')
      )
    );
  }, [calendarDays, selectedDate]);

  const toggleNewTaskDate = (date: string) => {
    if (selectedNewTaskDates.includes(date)) {
      setSelectedNewTaskDates(selectedNewTaskDates.filter((d) => d !== date));
    } else {
      setSelectedNewTaskDates([...selectedNewTaskDates, date]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalDragHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.primaryDark }]}>ثبت کار جدید ✨</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="می‌خوای چیکار کنی؟..."
            placeholderTextColor={colors.textMuted}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />

          <Text style={[styles.sectionLabel, { color: colors.text }]}>دسته‌بندی رو انتخاب کن:</Text>
          <View style={styles.horizontalListContainer}>
            <FlatList
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalScrollContent}
              removeClippedSubviews={true} // بهینه‌سازی مموری
              initialNumToRender={5}
              renderItem={({ item: cat }) => (
                <CategoryChip
                  category={cat}
                  isSelected={selectedCategoryId === cat.id}
                  onSelect={setSelectedCategoryId}
                />
              )}
            />
          </View>

          <View style={styles.dateSelectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>برای چه روزهایی؟</Text>
            <TouchableOpacity onPress={onSelectAllWeek}>
              <Text style={[styles.selectAllText, { color: colors.primaryDark }]}>+ تا آخر هفته (جمعه)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalListContainer}>
            <FlatList
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              data={modalDays}
              keyExtractor={(item) => item.fullDate}
              contentContainerStyle={styles.horizontalScrollContent}
              removeClippedSubviews={true} // بهینه‌سازی مموری
              initialNumToRender={7}
              maxToRenderPerBatch={7}
              windowSize={5}
              renderItem={({ item: day }) => (
                <DateChip
                  day={day}
                  isSelected={selectedNewTaskDates.includes(day.fullDate)}
                  onSelect={toggleNewTaskDate}
                />
              )}
            />
          </View>

          {/* کامپوننت ریمایندر بهینه شده */}
          <ReminderSection
            isEnabled={isReminderEnabled}
            onToggle={setIsReminderEnabled}
            selectedHour={selectedHour}
            selectedMinute={selectedMinute}
            onHourChange={onHourChange}
            onMinuteChange={onMinuteChange}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnCancel,
                { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.btnCancelText, { color: colors.textMuted }]}>انصراف</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSave, { backgroundColor: colors.primaryDark }]}
              onPress={onSave}
            >
              <Text style={[styles.btnSaveText, { color: colors.surface }]}>ثبت کار</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 480 },
  modalDragHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Vazir-Bold', fontSize: 18, textAlign: 'right', marginBottom: 20 },
  input: { borderRadius: 14, padding: 16, fontFamily: 'Vazir-Bold', fontSize: 15, textAlign: 'right', marginBottom: 20, borderWidth: 1 },
  dateSelectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectAllText: { fontFamily: 'Vazir-Bold', fontSize: 12 },
  horizontalListContainer: { marginBottom: 24 },
  horizontalScrollContent: { alignItems: 'center', paddingHorizontal: 4 },
  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, textAlign: 'right' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { marginRight: 10 },
  btnCancelText: { fontFamily: 'Vazir-Bold', fontSize: 14 },
  btnSave: {},
  btnSaveText: { fontFamily: 'Vazir-Bold', fontSize: 14 },
});