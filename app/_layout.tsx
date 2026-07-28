// app/_layout.tsx
import { useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StatusBar, 
  Platform, 
  I18nManager, 
  TextInput 
} from 'react-native';
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/index';
import migrations from '../drizzle/migrations';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

I18nManager.allowRTL(false);
I18nManager.forceRTL(false);


SplashScreen.preventAutoHideAsync();

// کامپوننت داخلی برای مدیریت StatusBar
function StatusBarManager() {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <StatusBar
      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? colors.background : colors.background}
      translucent={false}
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
      <SafeAreaProvider>
        <ThemeProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <StatusBarManager />
            <Stack screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}>
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
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}