import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { db, Category, Task } from '../../services/database';
import CustomAlert from '../../components/CustomAlert';
import FloatingActionButton from '../../components/home/FloatingActionButton';
import CategoriesHeader from '../../components/categories/CategoriesHeader';
import CategoryGrid from '../../components/categories/CategoryGrid';
import AddCategoryModal from '../../components/categories/AddCategoryModal';
import { PASTEL_PALETTE } from '../../components/categories/ColorPalette';
import { AVAILABLE_ICONS } from '../../components/categories/IconSelector';

export default function CategoriesScreen() {
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Stateهای فرم
  const [name, setName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('user');

  // استیت آلرت
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'danger' | 'warning';
    title: string;
    message: string;
    onConfirm: () => void;
    showCancel?: boolean;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // بارگذاری داده‌ها
  const loadData = async () => {
    const loadedCategories = await db.getCategories();
    const loadedTasks = await db.getTasks();
    setCategories(loadedCategories);
    setTasks(loadedTasks);
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  // محاسبه تعداد تسک‌های باقی‌مانده
  const getTaskCount = (categoryId: string) => {
    return tasks.filter(t => t.categoryId === categoryId && !t.completed).length;
  };

  // درخواست حذف دسته‌بندی
  const handleDeleteRequest = (id: string, categoryName: string) => {
    setAlertConfig({
      visible: true,
      type: 'danger',
      title: 'حذف دسته‌بندی؟ 🗑️',
      message: `آیا مطمئنید می‌خواهید "${categoryName}" را حذف کنید؟ تمام کارهای مربوط به این دسته نیز حذف خواهند شد.`,
      showCancel: true,
      onConfirm: async () => {
        await db.deleteCategory(id);
        setAlertConfig(prev => ({ ...prev, visible: false }));
        loadData();
      }
    });
  };

  // ایجاد دسته‌بندی جدید
  const handleCreateCategory = async () => {
    if (!name.trim()) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'نام دسته خالیه! ⚠️',
        message: 'برای ساختن دسته‌بندی، حتماً باید یک اسم براش انتخاب کنی.',
        showCancel: false,
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
      });
      return;
    }

    const theme = PASTEL_PALETTE[selectedColorIndex];
    await db.addCategory({
      name: name.trim(),
      color: theme.color,
      textColor: theme.textColor,
      icon: selectedIcon,
    });

    // ریست فرم
    setName('');
    setSelectedColorIndex(0);
    setSelectedIcon('user');
    setModalVisible(false);
    
    // نمایش پیام موفقیت
    setTimeout(() => {
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'با موفقیت ثبت شد! 🎉',
        message: `دسته‌بندی "${name.trim()}" ساخته شد.`,
        showCancel: false,
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          loadData();
        }
      });
    }, 400);
  };

  return (
    <View style={styles.container}>
      <CategoriesHeader />
      
      <CategoryGrid
        categories={categories}
        tasks={tasks}
        onDeleteCategory={handleDeleteRequest}
        getTaskCount={getTaskCount}
      />

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <AddCategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateCategory}
        name={name}
        setName={setName}
        selectedColorIndex={selectedColorIndex}
        setSelectedColorIndex={setSelectedColorIndex}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
      />

      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40 
  },
});