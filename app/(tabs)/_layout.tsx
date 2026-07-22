import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index" // 🌟 با این خط، صفحه اول همیشه "خانه" خواهد بود
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark, 
        tabBarInactiveTintColor: colors.textMuted, 
        tabBarStyle: {
          // جادوی شناور کردن تب‌بار 👇
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
        }
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'تنظیمات',
          tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'تقویم',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'دسته‌ها',
          tabBarIcon: ({ color }) => <Feather name="grid" size={22} color={color} />,
        }}
      />

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