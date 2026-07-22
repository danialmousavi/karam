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
import { useTheme } from '../../context/ThemeContext';
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
  const { colors } = useTheme();
  const [selectedDates, setSelectedDates] = useState<string[]>([selectedDate]);

  useEffect(() => {
    setSelectedDates([selectedDate]);
  }, [selectedDate]);

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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalDragHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.primaryDark }]}>ثبت کار برای {selectedDate} ✨</Text>

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
            autoFocus={true}
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
              renderItem={({ item: cat }) => (
                <CategoryChip
                  category={cat}
                  isSelected={selectedCategoryId === cat.id}
                  onSelect={setSelectedCategoryId}
                />
              )}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.text }]}>برای چه روزهایی؟</Text>
          <View style={styles.horizontalListContainer}>
            <FlatList
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              data={futureDays}
              keyExtractor={(item) => item.fullDate}
              contentContainerStyle={styles.horizontalScrollContent}
              renderItem={({ item: day }) => (
                <DateChip
                  day={day}
                  isSelected={selectedDates.includes(day.fullDate)}
                  onSelect={toggleDate}
                />
              )}
            />
          </View>

          <View style={[
            styles.reminderContainer,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}>
            <View style={styles.reminderHeader}>
              <Switch
                value={isReminderEnabled}
                onValueChange={setIsReminderEnabled}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={colors.surface}
              />
              <Text style={[styles.sectionLabel, { color: colors.text }]}>یادآوری با آلارم 🔔</Text>
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
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnCancel,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 480,
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 20,
  },
  input: {
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Vazir-Bold',
    fontSize: 15,
    textAlign: 'right',
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionLabel: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 12,
  },
  horizontalListContainer: { marginBottom: 24 },
  horizontalScrollContent: { alignItems: 'center', paddingHorizontal: 4 },
  reminderContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    marginRight: 10,
  },
  btnCancelText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
  },
  btnSave: {},
  btnSaveText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
  },
});