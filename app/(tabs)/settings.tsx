// app/(tabs)/settings.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
  Share,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { ThemeName } from '../../theme/colors';
import CustomAlert from '../../components/CustomAlert';
import TimePicker from '../../components/TimePicker';
import * as Notifications from 'expo-notifications';

// ============================================
// کامپوننت SettingsItem
// ============================================
const SettingItem = ({
  icon,
  title,
  subtitle,
  type = 'link',
  value,
  onValueChange,
  onPress,
  danger = false,
  last = false,
}: any) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      disabled={type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.itemRight}>
        <View style={[
          styles.iconWrapper,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
          danger && { backgroundColor: '#FFE5E5', borderColor: '#FFCDD2' },
        ]}>
          <Feather 
            name={icon} 
            size={20} 
            color={danger ? '#FF4444' : colors.primaryDark} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.itemTitle,
            { color: colors.text },
            danger && { color: '#FF4444' },
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.itemLeft}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor={colors.surface}
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        ) : (
          <Feather name="chevron-left" size={20} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// کامپوننت SettingsSection
// ============================================
const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          shadowColor: '#000',
        }
      ]}>
        {children}
      </View>
    </View>
  );
};

// ============================================
// کامپوننت ThemeSelector (مودال انتخاب تم)
// ============================================
const ThemeSelector = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { colors, themeName, setTheme, allThemes, isDarkMode } = useTheme();
  
  const themeOptions: { key: ThemeName; label: string; icon: string }[] = [
    { key: 'light', label: 'روشن', icon: 'sun' },
    { key: 'ocean', label: 'اقیانوسی', icon: 'droplet' },
    { key: 'lavender', label: 'اسطوخودوس', icon: 'flower' },
    { key: 'sunset', label: 'غروب', icon: 'sunset' },
    { key: 'forest', label: 'جنگلی', icon: 'tree' },
  ];

  const handleSelectTheme = (theme: ThemeName) => {
    setTheme(theme);
    onClose();
  };

  const getBaseTheme = (): ThemeName => {
    const baseNames = ['light', 'ocean', 'lavender', 'sunset', 'forest'];
    for (const name of baseNames) {
      if (themeName === name || themeName === `${name}Dark`) {
        return name as ThemeName;
      }
    }
    return 'light';
  };

  const baseTheme = getBaseTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.text }]}>🎨 انتخاب تم</Text>
          
          <View style={[styles.darkModeStatus, { backgroundColor: colors.background }]}>
            <Text style={[styles.darkModeStatusText, { color: colors.text }]}>
              {isDarkMode ? '🌙 حالت دارک فعال است' : '☀️ حالت روشن فعال است'}
            </Text>
            <Text style={[styles.darkModeStatusSub, { color: colors.textMuted }]}>
              {isDarkMode ? 'نسخه دارک تم‌ها نمایش داده می‌شوند' : 'نسخه روشن تم‌ها نمایش داده می‌شوند'}
            </Text>
          </View>

          <View style={styles.themeGrid}>
            {themeOptions.map((theme) => {
              const isSelected = baseTheme === theme.key;
              const previewThemeName = isDarkMode ? `${theme.key}Dark` as ThemeName : theme.key as ThemeName;
              const themeColors = allThemes[previewThemeName] || allThemes[theme.key as ThemeName];
              
              return (
                <TouchableOpacity
                  key={theme.key}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: themeColors.surface,
                      borderColor: isSelected ? colors.primaryDark : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleSelectTheme(theme.key as ThemeName)}
                >
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: themeColors.primary },
                    ]}
                  >
                    <Feather name={theme.icon as any} size={24} color={themeColors.surface} />
                  </View>
                  <Text style={[styles.themeLabel, { color: themeColors.text }]}>
                    {theme.label}
                  </Text>
                  <View
                    style={[
                      styles.themeColorStrip,
                      {
                        backgroundColor: themeColors.border,
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: themeColors.primary }]} />
                    <View style={[styles.colorDot, { backgroundColor: themeColors.primaryDark }]} />
                    <View style={[styles.colorDot, { backgroundColor: themeColors.textMuted }]} />
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Feather name="check-circle" size={20} color={colors.primaryDark} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.modalCloseButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>بستن</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// کامپوننت اصلی SettingsScreen
// ============================================
export default function SettingsScreen() {
  const { 
    colors, 
    themeName, 
    setTheme, 
    allThemes, 
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
      'کارام - بهترین ابزار مدیریت کارها\n\nنسخه ۱.۰.۰\nساخته شده با ❤️ توسط دانیال موسوی ',
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
      {/* هدر */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>تنظیمات</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          اپلیکیشن رو مطابق سلیقه‌ات تنظیم کن
        </Text>
      </View>

      {/* ===== بخش ظاهر ===== */}
      <SettingsSection title="🎨 ظاهر">
        <SettingItem
          icon="moon"
          title="حالت تاریک"
          subtitle={isDarkMode ? '🌙 فعال' : '☀️ غیرفعال'}
          type="switch"
          value={isDarkMode}
          onValueChange={handleToggleDarkMode}
        />
        <SettingItem
          icon="monitor"
          title="همگام‌سازی با سیستم"
          subtitle={useSystemTheme ? '✅ فعال' : '❌ غیرفعال'}
          type="switch"
          value={useSystemTheme}
          onValueChange={handleToggleSystemTheme}
        />
        <SettingItem
          icon="palette"
          title="انتخاب تم رنگی"
          subtitle={getThemeLabel()}
          onPress={() => setThemeModalVisible(true)}
          last={true}
        />
      </SettingsSection>

      {/* ===== بخش مدیریت داده ===== */}
      <SettingsSection title="💾 مدیریت داده">
        <SettingItem
          icon="trash-2"
          title="حذف تمام داده‌ها"
          danger={true}
          onPress={handleClearData}
          last={true}
        />
      </SettingsSection>

      {/* ===== بخش بیشتر ===== */}
      <SettingsSection title="💡 بیشتر">
        <SettingItem
          icon="share-2"
          title="اشتراک‌گذاری اپ"
          subtitle="با دوستانت به اشتراک بگذار"
          onPress={handleShare}
        />
        <SettingItem
          icon="mail"
          title="ارسال بازخورد"
          subtitle="نظرات و پیشنهادات"
          onPress={handleFeedback}
        />
        <SettingItem
          icon="star"
          title="امتیاز دادن به اپ"
          subtitle="به ما کمک کن بهتر بشیم"
          onPress={handleRate}
          last={true}
        />
      </SettingsSection>

      {/* ===== بخش درباره ===== */}
      <SettingsSection title="ℹ️ درباره">
        <SettingItem
          icon="info"
          title="درباره برنامه"
          subtitle="نسخه ۱.۰.۰"
          onPress={handleAbout}
        />
        <SettingItem
          icon="shield"
          title="حریم خصوصی"
          subtitle="چگونه از داده‌ها محافظت می‌کنیم"
          onPress={handlePrivacy}
          last={true}
        />
      </SettingsSection>

      {/* ===== مودال انتخاب تم ===== */}
      <ThemeSelector
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />

      {/* ===== مودال انتخاب ساعت ===== */}
      <Modal
        visible={timePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>⏰ انتخاب ساعت یادآوری</Text>
            
            <TimePicker
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              onHourChange={setSelectedHour}
              onMinuteChange={setSelectedMinute}
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
                onPress={() => setTimePickerVisible(false)}
              >
                <Text style={[styles.btnCancelText, { color: colors.textMuted }]}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave, { backgroundColor: colors.primaryDark }]}
                onPress={saveReminderTime}
              >
                <Text style={[styles.btnSaveText, { color: colors.surface }]}>تایید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

// ============================================
// استایل‌ها
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 28,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontFamily: 'Vazir',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'right',
    marginRight: 8,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 15,
    textAlign: 'right',
  },
  itemSubtitle: {
    fontFamily: 'Vazir',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  itemLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // استایل‌های مودال انتخاب ساعت
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 350,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
    borderWidth: 1,
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
  
  // استایل‌های ThemeSelector
  darkModeStatus: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  darkModeStatusText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
  },
  darkModeStatusSub: {
    fontFamily: 'Vazir',
    fontSize: 12,
    marginTop: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  themeOption: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  themePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeLabel: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    marginBottom: 6,
  },
  themeColorStrip: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCloseText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 16,
  },
});