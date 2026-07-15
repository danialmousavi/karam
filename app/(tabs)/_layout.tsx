import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons'; // آیکون‌های مینیمال و پیش‌فرض اکسپو
import { colors } from '../../theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // هدر بالای صفحات را مخفی می‌کنیم
        tabBarActiveTintColor: colors.primaryDark, // رنگ آیکون وقتی تب فعال است
        tabBarInactiveTintColor: colors.textMuted, // رنگ آیکون وقتی تب غیرفعال است
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 80, // ارتفاع نوار پایین
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 10, // سایه در اندروید
          shadowColor: colors.primaryDark, // سایه در iOS
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Vazir-Bold',
          fontSize: 12,
        },
      }}
    >
      {/* تب اول: خانه (داشبورد) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'خانه',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />

      {/* تب دوم: تقویم */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'تقویم',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
        }}
      />

      {/* تب سوم: دسته‌ها */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'دسته‌ها',
          tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} />,
        }}
      />

      {/* تب چهارم: تنظیمات */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'تنظیمات',
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}