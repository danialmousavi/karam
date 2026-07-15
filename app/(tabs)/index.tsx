import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment-jalaali'; // 👈 اضافه شد برای حل باگ تاریخ شمسی
import { colors } from '../../theme/colors';
import { db, Category, Task } from '../../services/database';
import { useIsFocused } from '@react-navigation/native';
import CustomAlert from '../../components/CustomAlert';

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'danger' as 'success' | 'danger' | 'warning',
    title: '',
    message: '',
    showCancel: false,
    onConfirm: () => {},
  });

  const loadData = async () => {
    // 👈 متد db.init() برای جلوگیری از خطا حذف شد (چون در دیتابیس جدید نیازی به آن نیست)
    const loadedTasks = await db.getTasks();
    const loadedCategories = await db.getCategories();
    
    setTasks(loadedTasks.reverse());
    setCategories(loadedCategories);
    
    if (loadedCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(loadedCategories[0].id);
    }
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      setAlertConfig({
        visible: true, 
        type: 'warning', 
        title: 'عنوان تسک خالیه! ⚠️', 
        message: 'لطفاً بنویس که دقیقاً چه کاری می‌خوای انجام بدی.', 
        showCancel: false, 
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
      }); 
      return;
    }

    if (!selectedCategoryId) {
      setAlertConfig({
        visible: true, 
        type: 'warning', 
        title: 'دسته‌بندی انتخاب نشده! 📂', 
        message: 'لطفاً مشخص کن این کار مربوط به کدوم دسته‌بندیه.', 
        showCancel: false, 
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
      }); 
      return;
    }

    // 👈 حل باگ تاریخ: حالا تاریخ به صورت شمسی و هماهنگ با تقویم ذخیره می‌شود
    const todayShamsi = moment().format('jYYYY/jMM/jDD');

    await db.addTask({
      title: newTaskTitle.trim(),
      categoryId: selectedCategoryId,
      date: todayShamsi,
    });

    setNewTaskTitle('');
    setModalVisible(false);
    loadData();
  };

  const handleToggleTask = async (id: string) => {
    await db.toggleTask(id);
    loadData();
  };

  const handleDeleteRequest = (id: string) => {
    setAlertConfig({
      visible: true, 
      type: 'danger', 
      title: 'حذف تسک؟ 🗑️', 
      message: 'آیا مطمئن هستی که می‌خوای این کار رو پاک کنی؟', 
      showCancel: true,
      onConfirm: async () => {
        await db.deleteTask(id);
        setAlertConfig(prev => ({ ...prev, visible: false }));
        loadData();
      }
    });
  };

  const getCategoryDetails = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { color: '#EEEEEE', textColor: '#9e9e9e', icon: 'box', name: 'نامشخص' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>کارهای امروز 🚀</Text>
        <Text style={styles.headerSubtitle}>بیا یه روز عالی بسازیم!</Text>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>هیچ کاری برای امروز ثبت نکردی!</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const cat = getCategoryDetails(item.categoryId);
            return (
              <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
                <View style={styles.taskLeft}>
                  <TouchableOpacity 
                    style={[styles.checkbox, item.completed && styles.checkboxChecked]} 
                    onPress={() => handleToggleTask(item.id)}
                  >
                    {item.completed && <Feather name="check" size={16} color={colors.surface} />}
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                      {item.title}
                    </Text>
                    <View style={styles.badgeContainer}>
                      <View style={[styles.categoryBadge, { backgroundColor: cat.color }]}>
                        <Feather name={cat.icon as any} size={10} color={cat.textColor} />
                        <Text style={[styles.categoryBadgeText, { color: cat.textColor }]}>{cat.name}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteRequest(item.id)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Feather name="plus" size={24} color={colors.surface} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>ثبت کار جدید ✨</Text>

            <TextInput
              style={styles.input}
              placeholder="می‌خوای چیکار کنی؟..."
              placeholderTextColor={colors.textMuted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <Text style={styles.sectionLabel}>دسته‌بندی رو انتخاب کن (به راست بکش):</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: isSelected ? cat.color : colors.background },
                      isSelected && { borderColor: cat.textColor, borderWidth: 1 }
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Feather name={cat.icon as any} size={16} color={isSelected ? cat.textColor : colors.textMuted} />
                    <Text style={[styles.categoryChipText, { color: isSelected ? cat.textColor : colors.textMuted }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleAddTask}>
                <Text style={styles.btnSaveText}>ثبت کار</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { fontFamily: 'Vazir-Bold', fontSize: 24, color: colors.primaryDark, textAlign: 'right' },
  headerSubtitle: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { fontFamily: 'Vazir-Bold', fontSize: 16, color: colors.textMuted },
  listContainer: { paddingHorizontal: 16, paddingBottom: 120 },
  taskCard: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border, elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  taskCardCompleted: { backgroundColor: colors.background, opacity: 0.7 },
  taskLeft: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  checkboxChecked: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  taskInfo: { flex: 1 },
  taskTitle: { fontFamily: 'Vazir-Bold', fontSize: 15, color: colors.text, textAlign: 'right', marginBottom: 6 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: colors.textMuted },
  badgeContainer: { flexDirection: 'row-reverse' },
  categoryBadge: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  categoryBadgeText: { fontFamily: 'Vazir-Bold', fontSize: 10, marginRight: 4 },
  deleteBtn: { padding: 8 },
  fab: { position: 'absolute', bottom: Platform.OS === 'ios' ? 115 : 105, left: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryDark, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: colors.primaryDark, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 350 },
  modalDragHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.primaryDark, textAlign: 'right', marginBottom: 20 },
  input: { backgroundColor: colors.background, borderRadius: 14, padding: 16, fontFamily: 'Vazir-Bold', fontSize: 15, textAlign: 'right', color: colors.text, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.text, textAlign: 'right', marginBottom: 12 },
  horizontalScroll: { marginBottom: 24 },
  horizontalScrollContent: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 4 },
  categoryChip: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginLeft: 10, borderWidth: 1, borderColor: colors.border },
  categoryChipText: { fontFamily: 'Vazir-Bold', fontSize: 13, marginRight: 6 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { backgroundColor: colors.background, marginRight: 10, borderWidth: 1, borderColor: colors.border },
  btnCancelText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.textMuted },
  btnSave: { backgroundColor: colors.primaryDark },
  btnSaveText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.surface },
});