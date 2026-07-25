import * as Notifications from 'expo-notifications';
import moment from 'moment-jalaali';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = 'task_reminders_channel';

export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'یادآوری کارها',
      importance: Notifications.AndroidImportance.MAX, // حالا این به درستی اعمال می‌شود
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      // 🌟 ۲. فیلد sound حذف شد تا اندروید به طور خودکار از صدای دیفالت سیستم استفاده کند
    });
  }
};

export const requestNotificationPermissions = async () => {
  await setupNotificationChannel();
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    // 🌟 ۳. درخواست صریح پرمیشن‌های صدا و آلرت برای iOS
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
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
          sound: true, 
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: taskDateTime,
          channelId: CHANNEL_ID, // 🌟 ۴. اختصاص نوتیفیکیشن به کانال صداداری که بالاتر ساختیم
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