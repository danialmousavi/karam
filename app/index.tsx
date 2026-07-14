import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as crypto from 'expo-crypto';
import { db } from '../db/index';
import { tasks } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import TaskItem from '../components/TaskItem'; // کامپوننت جدید

type Task = typeof tasks.$inferSelect;

export default function Dashboard() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchTasks = async () => {
    try {
      const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
      setTaskList(allTasks);
    } catch (error) {
      console.error("خطا در دریافت تسک‌ها:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await db.insert(tasks).values({
        id: crypto.randomUUID(),
        title: newTaskTitle,
        priority: 'medium',
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setNewTaskTitle('');
      fetchTasks();
    } catch (error) {
      console.error("خطا در ثبت تسک:", error);
    }
  };

  // تابع حذف تسک از دیتابیس
  const deleteTask = async (id: string) => {
    try {
      await db.delete(tasks).where(eq(tasks.id, id));
      fetchTasks(); // بروزرسانی لیست
    } catch (error) {
      console.error("خطا در حذف تسک:", error);
    }
  };

  // تابع تغییر وضعیت (انجام شده/نشده)
  const toggleTaskStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await db.update(tasks)
        .set({ status: newStatus, updatedAt: Date.now() })
        .where(eq(tasks.id, id));
      fetchTasks();
    } catch (error) {
      console.error("خطا در بروزرسانی وضعیت:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>لیست کارهای من</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="تسک جدید..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>افزودن</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={taskList}
        keyExtractor={(item) => item.id}
        // استفاده از کامپوننت دارای Swipe
        renderItem={({ item }) => (
          <TaskItem 
            task={item} 
            onDelete={deleteTask} 
            onToggleStatus={toggleTaskStatus} 
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>تسک جدیدی برای انجام نیست!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  inputContainer: { flexDirection: 'row-reverse', paddingHorizontal: 20, marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', textAlign: 'right' },
  addButton: { backgroundColor: '#2196F3', paddingHorizontal: 20, borderRadius: 8, marginLeft: 10, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#888' }
});