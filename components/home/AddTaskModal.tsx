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
import { colors } from '../../theme/colors';
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
      .filter((d) =>
        moment(d.fullDate, 'jYYYY/jMM/jDD').isSameOrAfter(
          moment(selectedDate, 'jYYYY/jMM/jDD')
        )
      )
      .slice(0, 31);
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
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalDragHandle} />
          <Text style={styles.modalTitle}>ثبت کار جدید ✨</Text>

          <TextInput
            style={styles.input}
            placeholder="می‌خوای چیکار کنی؟..."
            placeholderTextColor={colors.textMuted}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
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
            <Text style={styles.sectionLabel}>برای چه روزهایی؟</Text>
            <TouchableOpacity onPress={onSelectAllWeek}>
              <Text style={styles.selectAllText}>+ تا آخر هفته (جمعه)</Text>
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
              renderItem={({ item: day }) => (
                <DateChip
                  day={day}
                  isSelected={selectedNewTaskDates.includes(day.fullDate)}
                  onSelect={toggleNewTaskDate}
                />
              )}
            />
          </View>

          <ReminderSection
            isEnabled={isReminderEnabled}
            onToggle={setIsReminderEnabled}
            selectedHour={selectedHour}
            selectedMinute={selectedMinute}
            onHourChange={onHourChange}
            onMinuteChange={onMinuteChange}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
              <Text style={styles.btnCancelText}>انصراف</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={onSave}>
              <Text style={styles.btnSaveText}>ثبت کار</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 480,
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    color: colors.primaryDark,
    textAlign: 'right',
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Vazir-Bold',
    fontSize: 15,
    textAlign: 'right',
    color: colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateSelectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectAllText: { fontFamily: 'Vazir-Bold', fontSize: 12, color: colors.primaryDark },
  horizontalListContainer: { marginBottom: 24 },
  horizontalScrollContent: { alignItems: 'center', paddingHorizontal: 4 },
  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.text, textAlign: 'right' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnCancel: {
    backgroundColor: colors.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnCancelText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.textMuted },
  btnSave: { backgroundColor: colors.primaryDark },
  btnSaveText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.surface },
});