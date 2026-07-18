import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
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
  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={true} 
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>ایجاد دسته‌بندی جدید ✨</Text>

          <TextInput
            style={styles.input}
            placeholder="نام دسته را بنویسید (مثلاً یادگیری)..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.sectionLabel}>انتخاب آیکون:</Text>
          <IconSelector 
            selectedIcon={selectedIcon} 
            onSelect={setSelectedIcon} 
          />

          <Text style={styles.sectionLabel}>انتخاب تم رنگی:</Text>
          <ColorPalette 
            selectedIndex={selectedColorIndex} 
            onSelect={setSelectedColorIndex} 
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnCancel]} 
              onPress={onClose}
            >
              <Text style={styles.btnCancelText}>انصراف</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnSave]} 
              onPress={onSave}
            >
              <Text style={styles.btnSaveText}>ثبت دسته</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: colors.surface, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 24, 
    minHeight: 450 
  },
  modalTitle: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 18, 
    color: colors.primaryDark, 
    textAlign: 'right', 
    marginBottom: 20 
  },
  input: { 
    backgroundColor: colors.background, 
    borderRadius: 14, 
    padding: 14, 
    fontFamily: 'Vazir-Bold', 
    fontSize: 14, 
    textAlign: 'right', 
    color: colors.text, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  sectionLabel: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 13, 
    color: colors.primaryDark, 
    textAlign: 'right', 
    marginBottom: 10 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  btn: { 
    flex: 1, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  btnCancel: { 
    backgroundColor: colors.background, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  btnCancelText: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 14, 
    color: colors.textMuted 
  },
  btnSave: { 
    backgroundColor: colors.primaryDark 
  },
  btnSaveText: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 14, 
    color: colors.surface 
  },
});