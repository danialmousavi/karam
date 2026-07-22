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
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { ThemeName } from '../../theme/colors';

export default function SettingsScreen() {
  const { colors, themeName, setTheme, allThemes } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // بارگذاری تنظیمات ذخیره شده
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('@notifications_enabled');
      const savedDarkMode = await AsyncStorage.getItem('@dark_mode_enabled');
      
      if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
      if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
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

  const getThemeLabel = (theme: ThemeName) => {
    const labels = {
      light: 'پیش‌فرض',
      ocean: 'اقیانوسی',
      lavender: 'اسطوخودوس',
      sunset: 'غروب',
      forest: 'جنگلی',
    };
    return labels[theme] || 'پیش‌فرض';
  };

  // ✅ کامپوننت SettingItem با استفاده از useTheme
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

  // ✅ کامپوننت ThemeSelector با استفاده از useTheme
  const ThemeSelector = () => {
    const { colors, themeName, setTheme, allThemes } = useTheme();
    
    const themeOptions: { key: ThemeName; label: string; icon: string }[] = [
      { key: 'light', label: 'پیش‌فرض', icon: 'sun' },
      { key: 'ocean', label: 'اقیانوسی', icon: 'droplet' },
      { key: 'lavender', label: 'اسطوخودوس', icon: 'flower' },
      { key: 'sunset', label: 'غروب', icon: 'sunset' },
      { key: 'forest', label: 'جنگلی', icon: 'tree' },
    ];

    const handleSelectTheme = (theme: ThemeName) => {
      setTheme(theme);
      setThemeModalVisible(false);
    };

    return (
      <Modal 
        visible={themeModalVisible} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>🎨 انتخاب تم</Text>

            <View style={styles.themeGrid}>
              {themeOptions.map((theme) => {
                const isSelected = themeName === theme.key;
                const themeColors = allThemes[theme.key];
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
                    onPress={() => handleSelectTheme(theme.key)}
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
              onPress={() => setThemeModalVisible(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>بستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
      }}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>تنظیمات</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          اپلیکیشن رو مطابق سلیقه‌ات تنظیم کن
        </Text>
      </View>

      {/* بخش ظاهر */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>🎨 ظاهر</Text>
        <View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            shadowColor: '#000',
          }
        ]}>
          <SettingItem
            icon="palette"
            title="انتخاب تم رنگی"
            subtitle={getThemeLabel(themeName)}
            onPress={() => setThemeModalVisible(true)}
          />
          <SettingItem
            icon="moon"
            title="حالت تاریک"
            type="switch"
            value={darkMode}
            last={true}
            onValueChange={(value: boolean) => {
              setDarkMode(value);
              saveSetting('@dark_mode_enabled', value);
            }}
          />
        </View>
      </View>

      {/* بخش اعلان‌ها */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>🔔 اعلان‌ها</Text>
        <View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            shadowColor: '#000',
          }
        ]}>
          <SettingItem
            icon="bell"
            title="یادآوری تسک‌ها"
            subtitle="دریافت نوتیفیکیشن برای تسک‌ها"
            type="switch"
            last={true}
            value={notifications}
            onValueChange={(value: boolean) => {
              setNotifications(value);
              saveSetting('@notifications_enabled', value);
            }}
          />
        </View>
      </View>

      {/* بخش پشتیبانی و اطلاعات */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>💡 پشتیبانی و اطلاعات</Text>
        <View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            shadowColor: '#000',
          }
        ]}>
          <SettingItem
            icon="shield"
            title="حریم خصوصی"
            onPress={() => Alert.alert('🔒 حریم خصوصی', 'تمام داده‌ها فقط در دستگاه شما ذخیره می‌شوند.')}
          />
          <SettingItem
            icon="help-circle"
            title="سوالات متداول"
            onPress={() => Alert.alert('📖 سوالات متداول', 'به زودی اضافه می‌شود.')}
          />
          <SettingItem
            icon="info"
            title="درباره برنامه"
            subtitle="نسخه ۱.۰.۰"
            onPress={() => Alert.alert('ℹ️ درباره برنامه', 'کارام - بهترین ابزار مدیریت کارها\n\nساخته شده با ❤️')}
          />
          <SettingItem
            icon="share-2"
            title="اشتراک‌گذاری"
            last={true}
            onPress={() => Alert.alert('📤 اشتراک‌گذاری', 'به زودی اضافه می‌شود.')}
          />
        </View>
      </View>

      {/* بخش خطرناک */}
      <View style={[styles.section, { marginTop: 10 }]}>
        <View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            shadowColor: '#000',
          }
        ]}>
          <SettingItem
            icon="trash-2"
            title="حذف تمام داده‌ها"
            danger={true}
            last={true}
            onPress={() => {
              Alert.alert(
                '⚠️ هشدار!',
                'آیا مطمئن هستید که می‌خواهید تمام داده‌ها را حذف کنید؟',
                [
                  { text: 'انصراف', style: 'cancel' },
                  {
                    text: 'حذف',
                    style: 'destructive',
                    onPress: () => Alert.alert('✅', 'تمام داده‌ها حذف شدند.')
                  }
                ]
              );
            }}
          />
        </View>
      </View>

      {/* مودال انتخاب تم */}
      <ThemeSelector />
    </ScrollView>
  );
}

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
    fontFamily: 'Vazir-Medium',
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
    fontFamily: 'Vazir-Medium',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  itemLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // استایل‌های مودال
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400,
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
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
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
  },
  modalCloseText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 16,
  },
});