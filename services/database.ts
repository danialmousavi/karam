// مسیر فایل: services/database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-jalaali';
import { cancelNotification } from './notifications'; // 🌟 اضافه شد برای لغو نوتیفیکیشن‌ها

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export interface Category {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  date: string;       
  time?: string | null;      // آپدیت شد برای پذیرش null
  notifId?: string | null;   // آپدیت شد برای پذیرش null
  completed: boolean;
}

const TASKS_KEY = '@tasks_store';
const CATEGORIES_KEY = '@categories_store';

export const defaultCategories: Category[] = [
  { id: '1', name: 'کارهای شخصی', color: '#E1BEE7', textColor: '#4A148C', icon: 'user' },
  { id: '2', name: 'کار و پروژه', color: '#BBDEFB', textColor: '#0D47A1', icon: 'briefcase' },
  { id: '3', name: 'سلامتی و ورزش', color: '#C8E6C9', textColor: '#1B5E20', icon: 'activity' },
  { id: '4', name: 'خرید', color: '#FFE0B2', textColor: '#BF360C', icon: 'shopping-bag' },
];

export const db = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('خطا در دریافت تسک‌ها:', e);
      return [];
    }
  },

  addTask: async (task: Omit<Task, 'id' | 'completed' | 'date'> & { dates: string[] }): Promise<Task[]> => {
    try {
      const tasks = await db.getTasks();
      
      // برای هر روزی که کاربر انتخاب کرده، یک تسک مجزا می‌سازیم
      const newTasks: Task[] = task.dates.map((dateString, index) => ({
        title: task.title,
        categoryId: task.categoryId,
        completed: false,
        date: dateString,
        time: task.time || null,       
        notifId: task.notifId || null, 
        id: Date.now().toString() + index.toString(), 
      }));

      const updatedTasks = [...newTasks, ...tasks];
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      return newTasks;
    } catch (e) {
      console.error('خطا در ذخیره تسک:', e);
      throw e;
    }
  },

  toggleTask: async (id: string): Promise<Task[]> => {
    try {
      const tasks = await db.getTasks();
      const updatedTasks = tasks.map(t => {
        if (t.id === id) {
          // 🌟 اگر تسک در حال تیک خوردن است و نوتیفیکیشن دارد، نوتیفیکیشن را لغو می‌کنیم
          if (!t.completed && t.notifId) {
            cancelNotification(t.notifId);
          }
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    } catch (e) {
      console.error('خطا در ویرایش تسک:', e);
      return [];
    }
  },

  deleteTask: async (id: string): Promise<Task[]> => {
    try {
      const tasks = await db.getTasks();
      
      // 🌟 پیدا کردن تسک برای لغو نوتیفیکیشنِ آن (قبل از حذف)
      const taskToDelete = tasks.find(t => t.id === id);
      if (taskToDelete && taskToDelete.notifId) {
        cancelNotification(taskToDelete.notifId);
      }

      const updatedTasks = tasks.filter(t => t.id !== id);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    } catch (e) {
      console.error('خطا در حذف تسک:', e);
      return [];
    }
  },

  // دریافت دسته‌بندی‌ها
  getCategories: async (): Promise<Category[]> => {
    try {
      const data = await AsyncStorage.getItem(CATEGORIES_KEY);
      if (!data) {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
        return defaultCategories;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', e);
      return defaultCategories;
    }
  },

  // ایجاد دسته‌بندی جدید
  addCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    try {
      const categories = await db.getCategories();
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
      };
      const updatedCategories = [...categories, newCategory];
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      return newCategory;
    } catch (e) {
      console.error('خطا در ذخیره دسته‌بندی جدید:', e);
      throw e;
    }
  },

  // حذف دسته‌بندی و تسک‌های متصل به آن
  deleteCategory: async (id: string): Promise<Category[]> => {
    try {
      const categories = await db.getCategories();
      const updatedCategories = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));

      const tasks = await db.getTasks();
      
      // 🌟 پیدا کردن تسک‌هایی که قرار است حذف شوند و لغو نوتیفیکیشن آن‌ها
      const tasksToDelete = tasks.filter(t => t.categoryId === id);
      tasksToDelete.forEach(t => {
        if (t.notifId) {
          cancelNotification(t.notifId);
        }
      });

      // حذف خودکار تسک‌های این دسته‌بندی
      const updatedTasks = tasks.filter(t => t.categoryId !== id);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));

      return updatedCategories;
    } catch (e) {
      console.error('خطا در حذف دسته‌بندی:', e);
      return [];
    }
  }
};  