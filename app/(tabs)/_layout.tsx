// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
    initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 28 : 20,
          left: 20,
          right: 20,
          height: 72,
          borderRadius: 24,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 12,
          elevation: 8,
          shadowColor: colors.primaryDark,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontFamily: 'Vazir-Bold',
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      {/* تنظیمات (چپ‌ترین) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'تنظیمات',
          tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
        }}
      />

      {/* تقویم */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'تقویم',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={22} color={color} />,
        }}
      />

      {/* دسته‌ها */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'دسته‌ها',
          tabBarIcon: ({ color }) => <Feather name="grid" size={22} color={color} />,
        }}
      />

      {/* خانه (راست‌ترین) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'خانه',
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}