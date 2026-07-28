import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
// ۱. ایمپورت کردن هوک محاسبه‌گر فواصل امن
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const { colors } = useTheme();
  // ۲. گرفتن اطلاعات فواصل گوشی
  const insets = useSafeAreaInsets();
  
  // ۳. محاسبه داینامیک فاصله از پایین دقیقاً مثل تب‌بار
  const bottomMargin = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 28 : 20);

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: colors.primaryDark,
          shadowColor: colors.primaryDark,
          // ۴. اعمال فاصله داینامیک: 
          // bottomMargin (فواصل سیستم) + 72 (ارتفاع تب‌بار) + 30 (فاصله خالی برای زیبایی)
          bottom: bottomMargin + 102, 
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name="plus" size={24} color={colors.surface} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    // bottom: Platform.OS === 'ios' ? 115 : 105, // این خط کلاً حذف شد
    left: 28, // اگر می‌خوای دکمه سمت چپ باشه همین 28 خوبه، وگرنه برای راست باید بنویسی right: 28
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});