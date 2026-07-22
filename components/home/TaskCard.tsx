import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface CategoryDisplay {
  id?: string;
  name: string;
  color: string;
  textColor: string;
  icon: string;
}

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    categoryId: string;
    time?: string | null;
  };
  category: CategoryDisplay;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, category, onToggle, onDelete }: TaskCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.taskCard,
      { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
      task.completed && { backgroundColor: colors.background, opacity: 0.7 }
    ]}>
      <View style={styles.taskLeft}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: colors.border },
            task.completed && { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark }
          ]}
          onPress={() => onToggle(task.id)}
        >
          {task.completed && <Feather name="check" size={16} color={colors.surface} />}
        </TouchableOpacity>
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle,
            { color: colors.text },
            task.completed && { textDecorationLine: 'line-through', color: colors.textMuted }
          ]}>
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
                <Feather name="clock" size={10} color={colors.primaryDark} />
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
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
  },
  taskLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 15,
    textAlign: 'right',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row-reverse',
  },
  categoryBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 10,
    marginRight: 4,
  },
  deleteBtn: {
    padding: 8,
  },
});