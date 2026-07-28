import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { Task, Category } from '../../services/database';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';
// ۱. ایمپورت کردن هوک فواصل امن
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  getCategoryDetails: (categoryId: string) => Category;
}

export default function TaskList({
  tasks,
  categories,
  onToggleTask,
  onDeleteTask,
  getCategoryDetails,
}: TaskListProps) {
  // ۲. گرفتن اطلاعات فواصل گوشی
  const insets = useSafeAreaInsets();

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      // ۳. ترکیب کردن استایل‌های ثابت با فاصله داینامیک پایین
      contentContainerStyle={[
        styles.listContainer,
        { paddingBottom: insets.bottom + 120 } 
      ]}
      renderItem={({ item }) => {
        const category = getCategoryDetails(item.categoryId);
        return (
          <TaskCard
            task={item}
            category={category}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: 16, paddingTop: 10 },
});