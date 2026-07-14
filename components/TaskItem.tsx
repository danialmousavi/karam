import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors } from '../theme/colors'; // وارد کردن تم

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    status: string;
  };
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export default function TaskItem({ task, onDelete, onToggleStatus }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const swipeableRef = useRef<Swipeable>(null);

  const handleToggle = () => {
    onToggleStatus(task.id, task.status);
    swipeableRef.current?.close();
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    setTimeout(() => onDelete(task.id), 200); 
  };

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({ inputRange: [-100, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>حذف</Animated.Text>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });
    return (
      <TouchableOpacity style={[styles.doneButton, isCompleted && styles.undoButton]} onPress={handleToggle}>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          {isCompleted ? 'بازگردانی' : 'انجام شد'}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      friction={2}
    >
      <View style={[styles.taskContainer, isCompleted && styles.taskCompleted]}>
        {/* یک نشانگر رنگی کنار هر تسک */}
        <View style={[styles.indicator, isCompleted && styles.indicatorCompleted]} />
        <View style={styles.textContainer}>
          <Text style={[styles.taskTitle, isCompleted && styles.textCompleted]}>
            {task.title}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    elevation: 2, // سایه در اندروید
    shadowColor: colors.primaryDark, // سایه ملایم پاستیلی در iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden', // برای گوشه‌های گرد
  },
  indicator: {
    width: 6,
    height: '100%',
    backgroundColor: colors.primary,
    position: 'absolute',
    right: 0,
  },
  indicatorCompleted: {
    backgroundColor: colors.textMuted,
  },
  textContainer: {
    padding: 18,
    paddingRight: 24,
    flex: 1,
  },
  taskCompleted: {
    backgroundColor: colors.background,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskTitle: {
    fontFamily: 'Vazir',
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 0,
    marginBottom: 12,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  doneButton: {
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    marginBottom: 12,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  undoButton: {
    backgroundColor: colors.border,
  },
  actionText: {
    fontFamily: 'Vazir-Bold',
    color: colors.text, // چون رنگ‌ها پاستیلی هستند، متن تیره خواناتر است
    fontSize: 14,
  },
});