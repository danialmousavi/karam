import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import * as crypto from "expo-crypto";
import { db } from "../../db";
import { tasks } from "../../db/schema";
import { desc, eq } from "drizzle-orm";
import TaskItem from "../../components/TaskItem";
import { colors } from "../../theme/colors";

type Task = typeof tasks.$inferSelect;

export default function Dashboard() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchTasks = async () => {
    try {
      const allTasks = await db
        .select()
        .from(tasks)
        .orderBy(desc(tasks.createdAt));
      setTaskList(allTasks);
    } catch (error) {
      console.error("خطا:", error);
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
        priority: "medium",
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setNewTaskTitle("");
      fetchTasks();
    } catch (error) {
      console.error("خطا:", error);
    }
  };

  const deleteTask = async (id: string) => {
    await db.delete(tasks).where(eq(tasks.id, id));
    fetchTasks();
  };

  const toggleTaskStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await db
      .update(tasks)
      .set({ status: newStatus, updatedAt: Date.now() })
      .where(eq(tasks.id, id));
    fetchTasks();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>کارهای امروز 🌿</Text>
        <Text style={styles.headerSubtitle}>
          شما {taskList.filter((t) => t.status === "pending").length} کار انجام
          نشده دارید
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="امروز می‌خوای چیکار کنی؟"
          placeholderTextColor={colors.textMuted}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            !newTaskTitle.trim() && styles.addButtonDisabled,
          ]}
          onPress={addTask}
          disabled={!newTaskTitle.trim()}
        >
          <Text style={styles.addButtonText}>ثبت</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={taskList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onDelete={deleteTask}
            onToggleStatus={toggleTaskStatus}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            روزت رو با یک هدف جدید شروع کن! ✨
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 110 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: "Vazir-Bold",
    fontSize: 28,
    color: colors.text,
    textAlign: "right",
  },
  headerSubtitle: {
    fontFamily: "Vazir",
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    fontFamily: "Vazir",
    fontSize: 15,
    color: colors.text,
    textAlign: "right",
    elevation: 2,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginLeft: 12,
    justifyContent: "center",
    elevation: 2,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  addButtonText: {
    fontFamily: "Vazir-Bold",
    color: colors.text,
    fontSize: 16,
  },
  emptyText: {
    fontFamily: "Vazir",
    textAlign: "center",
    marginTop: 40,
    color: colors.textMuted,
    fontSize: 16,
  },
});
