import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font'; // اضافه شد
import * as SplashScreen from 'expo-splash-screen'; // اضافه شد
import { db } from '../db/index';
import migrations from '../drizzle/migrations';

// جلوگیری از مخفی شدن صفحه لودینگ تا زمانی که فونت‌ها لود شوند
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);
  
  // لود کردن فونت‌ها
  const [fontsLoaded, fontError] = useFonts({
    'Vazir': require('../assets/fonts/Vazirmatn-Regular.ttf'), // نام فایل خود را جایگزین کنید
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

  // صبر می‌کنیم تا هم دیتابیس و هم فونت‌ها آماده شوند
  if (!dbSuccess || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A8E6CF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'داشبورد', headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}