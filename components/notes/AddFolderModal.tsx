import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ColorPalette from '../categories/ColorPalette'; 

interface AddFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  folderName: string;
  setFolderName: (text: string) => void;
  selectedColorIndex: number; 
  setSelectedColorIndex: (index: number) => void;
}

export default function AddFolderModal({
  visible,
  onClose,
  onSave,
  folderName,
  setFolderName,
  selectedColorIndex,
  setSelectedColorIndex,
}: AddFolderModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* 🌟 تغییر behavior برای حل مشکل رفتن زیر کیبورد در اندروید */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.surface,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
                maxHeight: '90%', 
              }
            ]}
          >
            <ScrollView
              style={{ flexShrink: 1 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" 
            >
              <View style={[styles.modalDragHandle, { backgroundColor: colors.border }]} />

              <Text style={[styles.modalTitle, { color: colors.primaryDark }]}>ساخت پوشه جدید 📁</Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="نام پوشه (مثلاً: ایده‌ها، شخصی...)"
                placeholderTextColor={colors.textMuted}
                value={folderName}
                onChangeText={setFolderName}
                autoFocus={true} // 🌟 این رو true گذاشتیم که به محض باز شدن مودال، کیبورد بیاد بالا
              />

              <Text style={[styles.sectionLabel, { color: colors.primaryDark }]}>انتخاب رنگ پوشه:</Text>
              <ColorPalette 
                selectedIndex={selectedColorIndex} 
                onSelect={setSelectedColorIndex} 
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
                  <Text style={[styles.btnSaveText, { color: colors.surface }]}>ساخت پوشه</Text>
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 10 },
  modalDragHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Vazir-Bold', fontSize: 18, textAlign: 'right', marginBottom: 20 },
  input: { borderRadius: 14, padding: 14, fontFamily: 'Vazir-Bold', fontSize: 14, textAlign: 'right', marginBottom: 16, borderWidth: 1 },
  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, textAlign: 'right', marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { marginRight: 10 },
  btnCancelText: { fontFamily: 'Vazir-Bold', fontSize: 14 },
  btnSave: {},
  btnSaveText: { fontFamily: 'Vazir-Bold', fontSize: 14 },
});