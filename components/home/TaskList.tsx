import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { Task, Category } from '../../services/database';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

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
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
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
  listContainer: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 10 },
});