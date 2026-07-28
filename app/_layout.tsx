// app/_layout.tsx
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar'; 
import { db } from '../db/index';
import migrations from '../drizzle/migrations';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { I18nManager } from 'react-native';
SplashScreen.preventAutoHideAsync();
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);
// کامپوننت داخلی برای مدیریت StatusBar (روش دوم)
function StatusBarManager() {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <StatusBar
      style={isDarkMode ? 'light' : 'dark'} 
      backgroundColor={colors.background}
      translucent={true} 
    />
  );
}

export default function RootLayout() {
  const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);

  const [fontsLoaded, fontError] = useFonts({
    'Vazir': require('../assets/fonts/Vazirmatn-Regular.ttf'),
    'Vazir-Bold': require('../assets/fonts/Vazirmatn-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (dbError || fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>خطا در لود اطلاعات!</Text>
      </View>
    );
  }

  if (!dbSuccess || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A8E6CF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBarManager />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="category-detail/[id]"
            options={{
              headerShown: true,
              headerTitle: 'جزئیات دسته‌بندی',
              headerTitleAlign: 'center',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerShadowVisible: false,
              headerBackTitle: 'بازگشت',
            }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}