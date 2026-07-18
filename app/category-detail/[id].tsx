import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'; 
import { Feather } from '@expo/vector-icons';
import moment from 'moment-jalaali';
import { colors } from '../../theme/colors';
import { db, Task, Category } from '../../services/database';
import CustomAlert from '../../components/CustomAlert';
import TaskCard from '../../components/home/TaskCard';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'danger' as 'success' | 'danger' | 'warning',
    title: '',
    message: '',
    showCancel: false,
    onConfirm: () => {},
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const loadedCategories = await db.getCategories();
      const loadedTasks = await db.getTasks();
      
      setCategories(loadedCategories);
      setAllTasks(loadedTasks);
      
      const foundCategory = loadedCategories.find(c => c.id === id);
      setCategory(foundCategory || null);
      
      const categoryTasks = loadedTasks.filter(
        t => t.categoryId === id && !t.completed
      );
      
      categoryTasks.sort((a, b) => {
        const dateA = moment(a.date, 'jYYYY/jMM/jDD');
        const dateB = moment(b.date, 'jYYYY/jMM/jDD');
        return dateB.diff(dateA);
      });
      
      setTasks(categoryTasks);
    } catch (error) {
      console.error('خطا در بارگذاری داده:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const getCategoryDetails = (categoryId: string): Category => {
    const found = categories.find((c) => c.id === categoryId);
    if (found) return found;
    return {
      id: 'unknown',
      name: 'نامشخص',
      color: '#EEEEEE',
      textColor: '#9e9e9e',
      icon: 'box',
    };
  };

  const handleToggleTask = async (taskId: string) => {
    await db.toggleTask(taskId);
    loadData();
  };

  const handleDeleteTask = (taskId: string) => {
    setAlertConfig({
      visible: true,
      type: 'danger',
      title: 'حذف تسک؟ 🗑️',
      message: 'آیا مطمئن هستی که می‌خوای این کار رو پاک کنی؟',
      showCancel: true,
      onConfirm: async () => {
        await db.deleteTask(taskId);
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        loadData();
      },
    });
  };

  const groupTasksByDate = () => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });
    return grouped;
  };

  const groupedTasks = groupTasksByDate();
  const dateKeys = Object.keys(groupedTasks).sort((a, b) => {
    const dateA = moment(a, 'jYYYY/jMM/jDD');
    const dateB = moment(b, 'jYYYY/jMM/jDD');
    return dateB.diff(dateA);
  });

  const formatDate = (dateStr: string) => {
    const m = moment(dateStr, 'jYYYY/jMM/jDD');
    const today = moment().format('jYYYY/jMM/jDD');
    const yesterday = moment().subtract(1, 'day').format('jYYYY/jMM/jDD');
    
    if (dateStr === today) return 'امروز';
    if (dateStr === yesterday) return 'دیروز';
    return m.format('dddd jD jMMMM');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>دسته‌بندی یافت نشد!</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>بازگشت</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ تنظیمات هدر با Stack.Screen */}
      <Stack.Screen
        options={{
          headerTitle: category.name,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Vazir-Bold',
            fontSize: 18,
            color: colors.text,
          },
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerBackTitle: 'بازگشت',
          headerBackTitleStyle: {
            fontFamily: 'Vazir-Medium',
            fontSize: 14,
          },
          headerTintColor: colors.primaryDark,
        }}
      />

      {/* هدر با اطلاعات دسته‌بندی */}
      <View style={[styles.categoryHeader, { backgroundColor: category.color }]}>
        <View style={styles.categoryHeaderContent}>
          <View style={[styles.categoryIconWrapper, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Feather name={category.icon as any} size={32} color={category.textColor} />
          </View>
          <Text style={[styles.categoryName, { color: category.textColor }]}>
            {category.name}
          </Text>
          <Text style={[styles.taskCountText, { color: category.textColor }]}>
            {tasks.length} کار انجام نشده
          </Text>
        </View>
      </View>

      {/* لیست تسک‌ها */}
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="check-circle" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>همه کارها انجام شدن! 🎉</Text>
          <Text style={styles.emptySubtitle}>
            هیچ کار انجام نشده‌ای در این دسته‌بندی نیست.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dateKeys}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item: date }) => (
            <View style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <View style={styles.dateLine} />
                <Text style={styles.dateTitle}>{formatDate(date)}</Text>
                <View style={styles.dateLine} />
              </View>
              {groupedTasks[date].map((task) => {
                const categoryDetails = getCategoryDetails(task.categoryId);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categoryDetails}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                );
              })}
            </View>
          )}
        />
      )}

      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 16,
    color: colors.textMuted,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
  },
  backButtonText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    color: colors.surface,
  },
  categoryHeader: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryHeaderContent: {
    alignItems: 'center',
  },
  categoryIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontFamily: 'Vazir-Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  taskCountText: {
    fontFamily: 'Vazir-Medium',
    fontSize: 14,
    opacity: 0.8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Vazir-Medium',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});