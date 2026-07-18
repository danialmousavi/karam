import React, { useMemo, useState, useEffect } from 'react';
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
  Switch,
} from 'react-native';
import moment from 'moment-jalaali';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Category } from '../../services/database';
import TimePicker from '../TimePicker';
import CategoryChip from '../home/CategoryChip';
import DateChip from '../home/DateChip';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDate: string;
  newTaskTitle: string;
  setNewTaskTitle: (text: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  categories: Category[];
  isReminderEnabled: boolean;
  setIsReminderEnabled: (enabled: boolean) => void;
  selectedHour: number;
  selectedMinute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

export default function AddTaskModal({
  visible,
  onClose,
  onSave,
  selectedDate,
  newTaskTitle,
  setNewTaskTitle,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  isReminderEnabled,
  setIsReminderEnabled,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
}: AddTaskModalProps) {
  // برای انتخاب چند روز (مثل صفحه هوم)
  const [selectedDates, setSelectedDates] = useState<string[]>([selectedDate]);

  // وقتی تاریخ انتخاب شده تغییر میکنه، لیست رو آپدیت کن
  useEffect(() => {
    setSelectedDates([selectedDate]);
  }, [selectedDate]);

  // ساخت لیست روزهای آینده
  const futureDays = useMemo(() => {
    const days = [];
    const startDate = moment(selectedDate, 'jYYYY/jMM/jDD');
    for (let i = 0; i < 31; i++) {
      const date = startDate.clone().add(i, 'days');
      days.push({
        fullDate: date.format('jYYYY/jMM/jDD'),
        dayNum: date.format('jDD'),
        dayName: i === 0 ? 'امروز' : date.format('dddd').replace('شنبه', 'ش'),
        monthName: date.format('jMMMM'),
      });
    }
    return days;
  }, [selectedDate]);

  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSave = () => {
    // قبل از ذخیره، تاریخ‌های انتخاب شده رو ست کنیم
    onSave();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
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
              renderItem={({ item: cat }) => (
                <CategoryChip
                  category={cat}
                  isSelected={selectedCategoryId === cat.id}
                  onSelect={setSelectedCategoryId}
                />
              )}
            />
          </View>



          {/* بخش یادآوری با تایمر - دقیقاً مثل صفحه هوم */}
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
                onHourChange={onHourChange}
                onMinuteChange={onMinuteChange}
              />
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
              <Text style={styles.btnCancelText}>انصراف</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
              <Text style={styles.btnSaveText}>ثبت کار</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
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
  sectionLabel: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    color: colors.text,
    textAlign: 'right',
    marginBottom: 12,
  },
  horizontalListContainer: { marginBottom: 24 },
  horizontalScrollContent: { alignItems: 'center', paddingHorizontal: 4 },
  reminderContainer: {
    marginBottom: 24,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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