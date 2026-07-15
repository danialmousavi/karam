// مسیر فایل: services/database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-jalaali';

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
  completed: boolean;
  categoryId: string;
  date: string;
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

  addTask: async (task: Omit<Task, 'id' | 'completed'>): Promise<Task> => {
    try {
      const tasks = await db.getTasks();
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        completed: false,
        date: task.date || moment().format('jYYYY/jMM/jDD'),
      };
      const updatedTasks = [newTask, ...tasks];
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      return newTask;
    } catch (e) {
      console.error('خطا در ذخیره تسک:', e);
      throw e;
    }
  },

  toggleTask: async (id: string): Promise<Task[]> => {
    try {
      const tasks = await db.getTasks();
      const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
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

  // ایجاد دسته‌بندی جدید (اضافه شد 🌟)
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

  // حذف دسته‌بندی و تسک‌های متصل به آن (اضافه شد 🌟)
  deleteCategory: async (id: string): Promise<Category[]> => {
    try {
      const categories = await db.getCategories();
      const updatedCategories = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));

      // حذف خودکار تسک‌های این دسته‌بندی برای تمیز ماندن دیتابیس
      const tasks = await db.getTasks();
      const updatedTasks = tasks.filter(t => t.categoryId !== id);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));

      return updatedCategories;
    } catch (e) {
      console.error('خطا در حذف دسته‌بندی:', e);
      return [];
    }
  }
};