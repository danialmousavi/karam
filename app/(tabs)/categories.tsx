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
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { db, Category, Task } from '../../services/database';
import { useIsFocused } from '@react-navigation/native';
import CustomAlert from '../../components/CustomAlert';

// پالت رنگی جدید: پاستیلی اما پررنگ و جون‌دارتر 🎨
const PASTEL_PALETTE = [
  { color: '#CE93D8', textColor: '#4A148C' }, // بنفش
  { color: '#90CAF9', textColor: '#0D47A1' }, // آبی
  { color: '#A5D6A7', textColor: '#1B5E20' }, // سبز پررنگ
  { color: '#FFCC80', textColor: '#E65100' }, // نارنجی
  { color: '#F48FB1', textColor: '#880E4F' }, // صورتی
  { color: '#80DEEA', textColor: '#006064' }, // فیروزه‌ای
];

const AVAILABLE_ICONS = ['user', 'briefcase', 'activity', 'shopping-bag', 'book', 'heart', 'coffee', 'gift', 'star'];

export default function CategoriesScreen() {
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [name, setName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('user');

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

  const loadData = async () => {
    await db.init();
    const loadedCategories = await db.getCategories();
    const loadedTasks = await db.getTasks();
    setCategories(loadedCategories);
    setTasks(loadedTasks);
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

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

    setName('');
    setSelectedColorIndex(0);
    setSelectedIcon('user');
    setModalVisible(false);
    
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

  const getTaskCount = (categoryId: string) => {
    return tasks.filter(t => t.categoryId === categoryId && !t.completed).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>دسته‌بندی‌ها 📂</Text>
        <Text style={styles.headerSubtitle}>برنامه‌هات رو تفکیک و منظم کن</Text>
      </View>

      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.color }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                <Feather name={item.icon as any} size={20} color={item.textColor} />
              </View>
              <TouchableOpacity onPress={() => handleDeleteRequest(item.id, item.name)} style={styles.deleteButton}>
                <Feather name="trash-2" size={16} color={item.textColor} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardTitle, { color: item.textColor }]}>{item.name}</Text>
            <Text style={[styles.cardCount, { color: item.textColor }]}>
              {getTaskCount(item.id)} کار باقی‌مانده
            </Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ایجاد دسته‌بندی جدید ✨</Text>

            <TextInput
              style={styles.input}
              placeholder="نام دسته را بنویسید (مثلاً یادگیری)..."
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.sectionLabel}>انتخاب آیکون:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent} // 👈 حل مشکل اسکرول
            >
              {AVAILABLE_ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconSelect,
                    selectedIcon === iconName && { borderColor: colors.primaryDark, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedIcon(iconName)}
                >
                  <Feather name={iconName as any} size={20} color={colors.primaryDark} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>انتخاب تم رنگی:</Text>
            <View style={styles.colorPalette}>
              {PASTEL_PALETTE.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: item.color },
                    selectedColorIndex === index && { borderColor: item.textColor, borderWidth: 3 }
                  ]}
                  onPress={() => setSelectedColorIndex(index)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleCreateCategory}>
                <Text style={styles.btnSaveText}>ثبت دسته</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { fontFamily: 'Vazir-Bold', fontSize: 24, color: colors.primaryDark, textAlign: 'right' },
  headerSubtitle: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 120 },
  row: { justifyContent: 'space-between' },
  card: { flex: 1, height: 120, margin: 8, borderRadius: 20, padding: 14, justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  deleteButton: { padding: 4 },
  cardTitle: { fontFamily: 'Vazir-Bold', fontSize: 16, textAlign: 'right', marginTop: 8 },
  cardCount: { fontFamily: 'Vazir-Bold', fontSize: 11, textAlign: 'right', opacity: 0.8 },
  fab: { position: 'absolute', bottom: Platform.OS === 'ios' ? 115 : 105, left: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryDark, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: colors.primaryDark, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 450 },
  modalTitle: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.primaryDark, textAlign: 'right', marginBottom: 20 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, fontFamily: 'Vazir-Bold', fontSize: 14, textAlign: 'right', color: colors.primaryDark, marginBottom: 16 },
  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.primaryDark, textAlign: 'right', marginBottom: 10 },
  horizontalScroll: { marginBottom: 20 },
  horizontalScrollContent: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 4 },
  iconSelect: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  colorPalette: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 30 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { backgroundColor: '#F5F5F5', marginRight: 10 },
  btnCancelText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: colors.textMuted },
  btnSave: { backgroundColor: colors.primaryDark },
  btnSaveText: { fontFamily: 'Vazir-Bold', fontSize: 14, color: '#FFF' },
});