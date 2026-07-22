// app/_layout.tsx
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { db } from '../db/index';
import migrations from '../drizzle/migrations';
import { ThemeProvider } from '../context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);

  // ✅ فقط دو فونت اصلی
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