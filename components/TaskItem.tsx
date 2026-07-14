import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

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
  
  // ایجاد یک رفرنس برای کنترل کردن انیمیشن بسته شدن
  const swipeableRef = useRef<Swipeable>(null);

  // تابع کمکی برای انجام کار و بستن منو
  const handleToggle = () => {
    onToggleStatus(task.id, task.status);
    swipeableRef.current?.close(); // دستور بستن خودکار منو با انیمیشن
  };

  const handleDelete = () => {
    swipeableRef.current?.close(); // اول بسته شود بعد حذف شود تا انیمیشن نرم‌تر باشد
    setTimeout(() => onDelete(task.id), 200); 
  };

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={handleDelete}
      >
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          حذف
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={[styles.doneButton, isCompleted && styles.undoButton]} 
        onPress={handleToggle}
      >
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          {isCompleted ? 'بازگردانی' : 'انجام شد'}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef} // متصل کردن رفرنس به کامپوننت
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      friction={2}
    >
      <View style={[styles.taskContainer, isCompleted && styles.taskCompleted]}>
        <Text style={[styles.taskTitle, isCompleted && styles.textCompleted]}>
          {task.title}
        </Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  taskCompleted: {
    backgroundColor: '#f9f9f9',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  doneButton: {
    backgroundColor: '#00C851',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  undoButton: {
    backgroundColor: '#ffbb33',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});