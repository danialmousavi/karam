// components/home/TaskCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Category } from '../../services/database';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    categoryId: string;
    time?: string | null;
  };
  category: Category;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, category, onToggle, onDelete }: TaskCardProps) {
  return (
    <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
      <View style={styles.taskLeft}>
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkboxChecked]}
          onPress={() => onToggle(task.id)}
        >
          {task.completed && <Feather name="check" size={16} color={colors.surface} />}
        </TouchableOpacity>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
            {task.title}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
              <Feather name={category.icon as any} size={10} color={category.textColor} />
              <Text style={[styles.categoryBadgeText, { color: category.textColor }]}>
                {category.name}
              </Text>
            </View>
            {task.time && (
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: colors.background,
                    marginLeft: 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="bell" size={10} color={colors.primaryDark} />
                <Text style={[styles.categoryBadgeText, { color: colors.primaryDark }]}>
                  {task.time}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteBtn}>
        <Feather name="trash-2" size={20} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  taskCardCompleted: { backgroundColor: colors.background, opacity: 0.7 },
  taskLeft: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxChecked: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  taskInfo: { flex: 1 },
  taskTitle: { fontFamily: 'Vazir-Bold', fontSize: 15, color: colors.text, textAlign: 'right', marginBottom: 6 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: colors.textMuted },
  badgeContainer: { flexDirection: 'row-reverse' },
  categoryBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: { fontFamily: 'Vazir-Bold', fontSize: 10, marginRight: 4 },
  deleteBtn: { padding: 8 },
});