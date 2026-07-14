import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as crypto from 'expo-crypto';
import { db } from '../db/index';
import { tasks } from '../db/schema';
import { desc } from 'drizzle-orm';

type Task = typeof tasks.$inferSelect;

export default function Dashboard() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // خواندن تسک‌ها از دیتابیس
  const fetchTasks = async () => {
    try {
      const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
      setTaskList(allTasks);
    } catch (error) {
      console.error("خطا در دریافت تسک‌ها:", error);
    }
  };

  // اجرای تابع خواندن در زمان لود صفحه
  useEffect(() => {
    fetchTasks();
  }, []);

  // ثبت تسک جدید در دیتابیس
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
      
      setNewTaskTitle(''); // خالی کردن کادر متن
      fetchTasks(); // به‌روزرسانی لیست برای نمایش تسک جدید
    } catch (error) {
      console.error("خطا در ثبت تسک:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>داشبورد من 🚀</Text>

      {/* بخش افزودن تسک */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="چه کاری باید انجام دهی؟"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>افزودن</Text>
        </TouchableOpacity>
      </View>

      {/* لیست تسک‌ها */}
      <FlatList
        data={taskList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>هیچ تسکی ثبت نشده است!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', marginTop: 40 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'right', color: '#333' },
  inputContainer: { flexDirection: 'row-reverse', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', textAlign: 'right', fontSize: 16 },
  addButton: { backgroundColor: '#007bff', paddingHorizontal: 20, borderRadius: 8, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  taskItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  taskTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 16 }
});