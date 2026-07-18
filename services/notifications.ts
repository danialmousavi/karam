import * as Notifications from 'expo-notifications';
import moment from 'moment-jalaali';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // 🌟 اجازه پخش صدا
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 🌟 تنظیمات کانال اندروید برای اطمینان از پخش صدا و ویبره
export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'یادآوری کارها',
      importance: Notifications.AndroidImportance.MAX, // بالاترین اهمیت برای پخش صدا
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default', // استفاده از صدای پیش‌فرض زنگ گوشی
    });
  }
};

export const requestNotificationPermissions = async () => {
  await setupNotificationChannel(); // اجرای تنظیمات کانال
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const scheduleTaskNotification = async (title: string, dateJalaali: string, time: string) => {
  try {
    const taskDateTime = moment(`${dateJalaali} ${time}`, 'jYYYY/jMM/jDD HH:mm').toDate();
    
    if (taskDateTime.getTime() > Date.now()) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'یادآوری کار 🔔',
          body: title,
          sound: true, // 🌟 دستور پخش صدا
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: taskDateTime,
        },
      });
      return notificationId;
    }
    return null;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string | null | undefined) => {
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {}
  }
};