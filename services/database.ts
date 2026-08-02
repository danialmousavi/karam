// مسیر فایل: services/database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-jalaali';
import { cancelNotification } from './notifications';

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
  time?: string | null;      
  notifId?: string | null;   
  completed: boolean;
}

// 🌟 اینترفیس‌های جدید برای یادداشت‌ها و پوشه‌ها
export interface NoteFolder {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface Note {
  id: string;
  folderId: string;
  title: string;
  content: string;
  isPinned: boolean;
  updatedAt: number;
}

const TASKS_KEY = '@tasks_store';
const CATEGORIES_KEY = '@categories_store';
const NOTE_FOLDERS_KEY = '@note_folders_store'; 
const NOTES_KEY = '@notes_store';

export const defaultCategories: Category[] = [
  { id: '1', name: 'کارهای شخصی', color: '#E1BEE7', textColor: '#4A148C', icon: 'user' },
  { id: '2', name: 'کار و پروژه', color: '#BBDEFB', textColor: '#0D47A1', icon: 'briefcase' },
  { id: '3', name: 'سلامتی و ورزش', color: '#C8E6C9', textColor: '#1B5E20', icon: 'activity' },
  { id: '4', name: 'خرید', color: '#FFE0B2', textColor: '#BF360C', icon: 'shopping-bag' },
];

// پوشه پیش‌فرض اولیه
export const defaultNoteFolders: NoteFolder[] = [
  { id: 'default_folder_1', name: 'یادداشت‌های من', color: '#F8BBD0', createdAt: Date.now() },
];

export const db = {
  // =====================================
  // بخش مدیریت تسک‌ها (Tasks)
  // =====================================
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

  // =====================================
  // بخش مدیریت دسته‌بندی‌ها (Categories)
  // =====================================
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

  deleteCategory: async (id: string): Promise<Category[]> => {
    try {
      const categories = await db.getCategories();
      const updatedCategories = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));

      const tasks = await db.getTasks();
      
      const tasksToDelete = tasks.filter(t => t.categoryId === id);
      tasksToDelete.forEach(t => {
        if (t.notifId) {
          cancelNotification(t.notifId);
        }
      });

      const updatedTasks = tasks.filter(t => t.categoryId !== id);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));

      return updatedCategories;
    } catch (e) {
      console.error('خطا در حذف دسته‌بندی:', e);
      return [];
    }
  },

  // =====================================
  // 🌟 بخش جدید: پوشه‌های یادداشت (Note Folders)
  // =====================================
  getNoteFolders: async (): Promise<NoteFolder[]> => {
    try {
      const data = await AsyncStorage.getItem(NOTE_FOLDERS_KEY);
      if (!data) {
        await AsyncStorage.setItem(NOTE_FOLDERS_KEY, JSON.stringify(defaultNoteFolders));
        return defaultNoteFolders;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('خطا در دریافت پوشه‌ها:', e);
      return defaultNoteFolders;
    }
  },

  addNoteFolder: async (name: string, color?: string): Promise<NoteFolder> => {
    try {
      const folders = await db.getNoteFolders();
      const newFolder: NoteFolder = {
        id: Date.now().toString(),
        name,
        color,
        createdAt: Date.now(),
      };
      const updatedFolders = [...folders, newFolder];
      await AsyncStorage.setItem(NOTE_FOLDERS_KEY, JSON.stringify(updatedFolders));
      return newFolder;
    } catch (e) {
      console.error('خطا در ساخت پوشه جدید:', e);
      throw e;
    }
  },

  deleteNoteFolder: async (id: string): Promise<NoteFolder[]> => {
    try {
      const folders = await db.getNoteFolders();
      const updatedFolders = folders.filter(f => f.id !== id);
      await AsyncStorage.setItem(NOTE_FOLDERS_KEY, JSON.stringify(updatedFolders));

      const notes = await db.getNotes();
      const updatedNotes = notes.filter(n => n.folderId !== id);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));

      return updatedFolders;
    } catch (e) {
      console.error('خطا در حذف پوشه:', e);
      return [];
    }
  },

  // =====================================
  // 🌟 بخش جدید: یادداشت‌ها (Notes)
  // =====================================
  getNotes: async (folderId?: string): Promise<Note[]> => {
    try {
      const data = await AsyncStorage.getItem(NOTES_KEY);
      const allNotes: Note[] = data ? JSON.parse(data) : [];
      
      if (folderId) {
        return allNotes.filter(n => n.folderId === folderId);
      }
      return allNotes;
    } catch (e) {
      console.error('خطا در دریافت یادداشت‌ها:', e);
      return [];
    }
  },

  addNote: async (folderId: string, title: string, content: string): Promise<Note> => {
    try {
      const notes = await db.getNotes();
      const newNote: Note = {
        id: Date.now().toString(),
        folderId,
        title,
        content,
        isPinned: false,
        updatedAt: Date.now(),
      };
      
      const updatedNotes = [newNote, ...notes];
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
      return newNote;
    } catch (e) {
      console.error('خطا در ثبت یادداشت:', e);
      throw e;
    }
  },

  updateNote: async (id: string, updates: Partial<Omit<Note, 'id' | 'folderId'>>): Promise<Note[]> => {
    try {
      const notes = await db.getNotes();
      const updatedNotes = notes.map(n => 
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      );
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
      return updatedNotes;
    } catch (e) {
      console.error('خطا در ویرایش یادداشت:', e);
      return [];
    }
  },

  deleteNote: async (id: string): Promise<Note[]> => {
    try {
      const notes = await db.getNotes();
      const updatedNotes = notes.filter(n => n.id !== id);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
      return updatedNotes;
    } catch (e) {
      console.error('خطا در حذف یادداشت:', e);
      return [];
    }
  }
};