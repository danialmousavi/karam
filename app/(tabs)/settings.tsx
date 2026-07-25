// app/(tabs)/settings.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Share,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import CustomAlert from '../../components/CustomAlert';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';
import SettingsItem from '../../components/settings/SettingsItem';
import ThemeSelector from '../../components/settings/ThemeSelector';
import TimePickerModal from '../../components/settings/TimePickerModal';

export default function SettingsScreen() {
  const { 
    colors, 
    themeName, 
    isDarkMode, 
    toggleDarkMode,
    useSystemTheme,
    toggleSystemTheme,
  } = useTheme();
  
  // استیت‌های تنظیمات
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [reminderTime, setReminderTime] = useState('09:00');
  
  // استیت CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success' as 'success' | 'danger' | 'warning',
    title: '',
    message: '',
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  // ============================================
  // توابع بارگذاری و ذخیره تنظیمات
  // ============================================
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedReminderTime = await AsyncStorage.getItem('@reminder_time');
      if (savedReminderTime !== null) {
        setReminderTime(savedReminderTime);
        const [hour, minute] = savedReminderTime.split(':').map(Number);
        setSelectedHour(hour);
        setSelectedMinute(minute);
      }
    } catch (error) {
      console.error('خطا در بارگذاری تنظیمات:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('خطا در ذخیره تنظیمات:', error);
    }
  };

  // ============================================
  // نمایش CustomAlert
  // ============================================
  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'danger' | 'warning' = 'success',
    showCancel: boolean = false,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      showCancel,
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        if (onCancel) onCancel();
      },
    });
  };

  // ============================================
  // ۱. تنظیم ساعت یادآوری
  // ============================================
  const handleSetReminderTime = () => {
    setTimePickerVisible(true);
  };

  const saveReminderTime = async () => {
    const time = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    setReminderTime(time);
    await saveSetting('@reminder_time', time);
    setTimePickerVisible(false);
    
    showAlert(
      '✅',
      `ساعت یادآوری به ${time} تنظیم شد.`,
      'success'
    );
  };

  // ============================================
  // ۲. تغییر حالت تاریک
  // ============================================
  const handleToggleDarkMode = async () => {
    await toggleDarkMode();
    showAlert(
      '✅',
      isDarkMode ? 'حالت روشن فعال شد.' : 'حالت تاریک فعال شد.',
      'success'
    );
  };

  // ============================================
  // ۳. تغییر همگام‌سازی با سیستم
  // ============================================
  const handleToggleSystemTheme = async (value: boolean) => {
    await toggleSystemTheme(value);
    if (value) {
      showAlert('✅', 'حالت تاریک با سیستم همگام شد.', 'success');
    } else {
      showAlert('✅', 'همگام‌سازی با سیستم غیرفعال شد.', 'success');
    }
  };

  // ============================================
  // ۴. گرفتن نام تم برای نمایش
  // ============================================
  const getThemeLabel = () => {
    const baseNames = {
      light: 'روشن',
      dark: 'تاریک',
      ocean: 'اقیانوسی',
      oceanDark: 'اقیانوسی (دارک)',
      lavender: 'اسطوخودوس',
      lavenderDark: 'اسطوخودوس (دارک)',
      sunset: 'غروب',
      sunsetDark: 'غروب (دارک)',
      forest: 'جنگلی',
      forestDark: 'جنگلی (دارک)',
    };
    return baseNames[themeName as keyof typeof baseNames] || 'روشن';
  };

  // ============================================
  // ۵. حذف داده‌ها
  // ============================================
  const handleClearData = () => {
    showAlert(
      '🗑️ حذف تمام داده‌ها',
      'آیا مطمئن هستید؟ این کار تمام تسک‌ها، دسته‌بندی‌ها و تنظیمات شما را حذف خواهد کرد.',
      'danger',
      true,
      async () => {
        try {
          await AsyncStorage.clear();
          showAlert(
            '✅',
            'تمام داده‌ها با موفقیت حذف شدند.',
            'success'
          );
        } catch (error) {
          showAlert(
            '❌',
            'خطا در حذف داده‌ها',
            'danger'
          );
        }
      }
    );
  };

  // ============================================
  // ۶. اشتراک‌گذاری
  // ============================================
  const handleShare = async () => {
    try {
      await Share.share({
        message: '📱 اپلیکیشن کارام - بهترین ابزار مدیریت کارها!\n\nبا کارام، کارهات رو مرتب کن و بهره‌وریت رو افزایش بده.',
        title: 'اشتراک‌گذاری کارام',
      });
    } catch (error) {
      console.error('خطا در اشتراک‌گذاری:', error);
    }
  };

  // ============================================
  // ۷. ارسال بازخورد به ایمیل
  // ============================================
  const handleFeedback = () => {
    Linking.openURL('mailto:danialmoosavi69@gmail.com?subject=بازخورد کاربران کارام');
  };

  // ============================================
  // ۸. امتیاز دادن
  // ============================================
  const handleRate = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id[YOUR_APP_ID]',
      android: 'https://play.google.com/store/apps/details?id=com.your.app',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  // ============================================
  // ۹. حریم خصوصی
  // ============================================
  const handlePrivacy = () => {
    showAlert(
      '🔒 حریم خصوصی',
      'کارام به حریم خصوصی شما احترام می‌گذارد.\n\n• تمام داده‌ها فقط در دستگاه شما ذخیره می‌شوند\n• هیچ داده‌ای به سرور ارسال نمی‌شود\n• شما مالک کامل داده‌های خود هستید\n\nبرای اطلاعات بیشتر با ما تماس بگیرید.',
      'success'
    );
  };

  // ============================================
  // ۱۰. درباره برنامه
  // ============================================
  const handleAbout = () => {
    showAlert(
      'ℹ️ درباره برنامه',
      'کارام - بهترین ابزار مدیریت کارها\n\nنسخه ۱.۰.۰\nساخته شده با ❤️ توسط دانیال موسوی',
      'success'
    );
  };

  // ============================================
  // رندر اصلی
  // ============================================
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
      }}
    >
      <SettingsHeader />

      {/* ===== بخش ظاهر ===== */}
<SettingsSection title="🎨 ظاهر">
  <SettingsItem
    icon="moon"
    title="حالت تاریک"
    subtitle={isDarkMode ? '🌙 فعال' : '☀️ غیرفعال'}
    type="switch"
    value={isDarkMode}
    onValueChange={handleToggleDarkMode}
  />
  <SettingsItem
    icon="monitor"
    title="همگام‌سازی با سیستم"
    subtitle={useSystemTheme ? '✅ فعال' : '❌ غیرفعال'}
    type="switch"
    value={useSystemTheme}
    onValueChange={handleToggleSystemTheme}
  />
  <SettingsItem
    icon="droplet" // ✅ تغییر از 'palette' به 'droplet'
    title="انتخاب تم رنگی"
    subtitle={getThemeLabel()}
    onPress={() => setThemeModalVisible(true)}
    last={true}
  />
</SettingsSection>

      {/* ===== بخش مدیریت داده ===== */}
      <SettingsSection title="💾 مدیریت داده">
        <SettingsItem
          icon="trash-2"
          title="حذف تمام داده‌ها"
          danger={true}
          onPress={handleClearData}
          last={true}
        />
      </SettingsSection>

      {/* ===== بخش بیشتر ===== */}
      <SettingsSection title="💡 بیشتر">
        <SettingsItem
          icon="share-2"
          title="اشتراک‌گذاری اپ"
          subtitle="با دوستانت به اشتراک بگذار"
          onPress={handleShare}
        />
        <SettingsItem
          icon="mail"
          title="ارسال بازخورد"
          subtitle="نظرات و پیشنهادات"
          onPress={handleFeedback}
        />
        <SettingsItem
          icon="star"
          title="امتیاز دادن به اپ"
          subtitle="به ما کمک کن بهتر بشیم"
          onPress={handleRate}
          last={true}
        />
      </SettingsSection>

      {/* ===== بخش درباره ===== */}
      <SettingsSection title="ℹ️ درباره">
        <SettingsItem
          icon="info"
          title="درباره برنامه"
          subtitle="نسخه ۱.۰.۰"
          onPress={handleAbout}
        />
        <SettingsItem
          icon="shield"
          title="حریم خصوصی"
          subtitle="چگونه از داده‌ها محافظت می‌کنیم"
          onPress={handlePrivacy}
          last={true}
        />
      </SettingsSection>

      {/* ===== مودال‌ها ===== */}
      <ThemeSelector
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />

      <TimePickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onSave={saveReminderTime}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onHourChange={setSelectedHour}
        onMinuteChange={setSelectedMinute}
      />

      {/* ===== CustomAlert ===== */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={alertConfig.showCancel}
        confirmText="تایید"
        cancelText="انصراف"
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});