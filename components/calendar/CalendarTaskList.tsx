import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Task, Category } from '../../services/database';
import EmptyState from '../home/EmptyState';
import TaskCard from '../home/TaskCard';

interface CalendarTaskListProps {
  tasks: Task[];
  categories: Category[];
  selectedDate: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  getCategoryDetails: (categoryId: string) => Category;
}

export default function CalendarTaskList({
  tasks,
  categories,
  selectedDate,
  onToggleTask,
  onDeleteTask,
  getCategoryDetails,
}: CalendarTaskListProps) {
  const todayStr = new Date().toISOString().split('T')[0]; // placeholder

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <View style={styles.tasksSection}>
      <View style={styles.taskListHeader}>
        <Text style={styles.taskLabel}>
          برنامه {selectedDate === todayStr ? 'امروز' : selectedDate}
        </Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    </View>
  );
}

const styles = StyleSheet.create({
  tasksSection: { flex: 1, marginTop: 10 },
  taskListHeader: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 10 },
  taskLabel: {
    fontFamily: 'Vazir-Bold',
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  listContainer: { paddingHorizontal: 20, paddingBottom: 130 },
});