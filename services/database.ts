import AsyncStorage from '@react-native-async-storage/async-storage';

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

const CATEGORIES_KEY = '@pastel_todo_categories';
const TASKS_KEY = '@pastel_todo_tasks';

export const defaultCategories: Category[] = [
  { id: '1', name: 'کارهای شخصی', color: '#F3E5F5', textColor: '#6A1B9A', icon: 'user' },
  { id: '2', name: 'کار و پروژه', color: '#E3F2FD', textColor: '#1565C0', icon: 'briefcase' },
  { id: '3', name: 'سلامتی و ورزش', color: '#E8F5E9', textColor: '#2E7D32', icon: 'activity' },
  { id: '4', name: 'خرید', color: '#FFF3E0', textColor: '#E65100', icon: 'shopping-bag' },
];

export const db = {
  // مقداردهی اولیه
  async init(): Promise<void> {
    const categories = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (!categories) {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    }
  },

  // ---------------- دسته بندی ها ----------------
  async getCategories(): Promise<Category[]> {
    const data = await AsyncStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    categories.push(newCategory);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return newCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    // اضافه کردن تایپ صریح c: Category
    const filtered = categories.filter((c: Category) => c.id !== id);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
    
    // پاک کردن تسک‌های متعلق به این دسته
    const tasks = await this.getTasks();
    // اضافه کردن تایپ صریح t: Task
    const remainingTasks = tasks.filter((t: Task) => t.categoryId !== id);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(remainingTasks));
  },

  // ---------------- تسک ها ----------------
  async getTasks(): Promise<Task[]> {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addTask(task: Omit<Task, 'id' | 'completed'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    };
    tasks.push(newTask);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return newTask;
  },

  async toggleTask(id: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    // اضافه کردن تایپ صریح t: Task
    const updated = tasks.map((t: Task) => t.id === id ? { ...t, completed: !t.completed } : t);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  },

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    // اضافه کردن تایپ صریح t: Task
    const filtered = tasks.filter((t: Task) => t.id !== id);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  }
};