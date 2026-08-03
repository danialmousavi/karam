import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import ColorPalette, { PASTEL_PALETTE } from './ColorPalette';
import IconSelector, { AVAILABLE_ICONS } from './IconSelector';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  setName: (text: string) => void;
  selectedColorIndex: number;
  setSelectedColorIndex: (index: number) => void;
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
}

export default function AddCategoryModal({
  visible,
  onClose,
  onSave,
  name,
  setName,
  selectedColorIndex,
  setSelectedColorIndex,
  selectedIcon,
  setSelectedIcon,
}: AddCategoryModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets(); // دریافت فواصل امن دستگاه

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={true} 
      onRequestClose={onClose}
    >
      {/* مدیریت هوشمند کیبورد */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.surface,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24, // فاصله امن پایین
                maxHeight: '90%', // جلوگیری از چسبیدن به سقف
              }
            ]}
          >
            {/* اضافه کردن اسکرول برای زمان باز بودن کیبورد */}
            <ScrollView
              style={{ flexShrink: 1 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" // کلیک روی دکمه‌ها بدون نیاز به بستن کیبورد
            >
              <View style={[styles.modalDragHandle, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.modalTitle, { color: colors.primaryDark }]}>ایجاد دسته‌بندی جدید ✨</Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="نام دسته را بنویسید (مثلاً یادگیری)..."
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.sectionLabel, { color: colors.primaryDark }]}>انتخاب آیکون:</Text>
              <IconSelector 
                selectedIcon={selectedIcon} 
                onSelect={setSelectedIcon} 
              />

              <Text style={[styles.sectionLabel, { color: colors.primaryDark }]}>انتخاب تم رنگی:</Text>
              <ColorPalette 
                selectedIndex={selectedColorIndex} 
                onSelect={setSelectedColorIndex} 
              />

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
                  <Text style={[styles.btnSaveText, { color: colors.surface }]}>ثبت دسته</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 10,
    // minHeight: 450, -> حذف شد تا استایل‌های کیبورد به هم نریزه
  },
  modalDragHandle: { 
    width: 40, 
    height: 5, 
    borderRadius: 3, 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  modalTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 20,
  },
  input: {
    borderRadius: 14,
    padding: 14,
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionLabel: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
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