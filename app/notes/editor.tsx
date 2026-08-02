// app/notes/editor.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/database';
import CustomAlert from '../../components/CustomAlert'; // 🌟 ایمپورت کاستوم الرت

export default function NoteEditorScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { folderId, noteId, initialTitle, initialContent } = useLocalSearchParams<{
    folderId: string;
    noteId?: string;
    initialTitle?: string;
    initialContent?: string;
  }>();

  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  
  // استیت‌های کنترل کاستوم الرت خروج
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const hasUnsavedChanges = title !== (initialTitle || '') || content !== (initialContent || '');

  // تابع اصلی ذخیره‌سازی
  const saveNoteToDb = async () => {
    if (!title.trim() && !content.trim()) {
      return false; // چیزی برای ذخیره نیست
    }

    if (noteId) {
      await db.updateNote(noteId, { title: title.trim(), content: content.trim() });
    } else if (folderId) {
      const finalTitle = title.trim() || (content.trim().split(' ').slice(0, 3).join(' ') + '...');
      await db.addNote(folderId, finalTitle, content.trim());
    }
    return true;
  };

  // وقتی کاربر دکمه تیک بالا رو می‌زنه
  const handlePressCheck = async () => {
    await saveNoteToDb();
    router.back();
  };

  // کنترل دکمه Back (فیزیکی یا هدر)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault(); // متوقف کردن خروج موقت
      setPendingAction(e.data.action); // ذخیره کردن اکشن خروج
      setShowExitAlert(true); // نمایش کاستوم الرت
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, title, content]);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={() => router.back()} 
        >
          <Feather name="arrow-right" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={handlePressCheck}
        >
          <Feather name="check" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.titleInput, { color: colors.text }]}
        placeholder="عنوان..."
        placeholderTextColor={colors.border}
        value={title}
        onChangeText={setTitle}
        autoFocus={!noteId} 
      />

      <TextInput
        style={[styles.contentInput, { color: colors.text }]}
        placeholder="شروع به نوشتن کنید..."
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top" 
      />

      {/* 🌟 کاستوم الرت هوشمند برای خروج بدون ذخیره یا با ذخیره */}
      <CustomAlert
        visible={showExitAlert}
        type="warning"
        title="ذخیره تغییرات؟"
        message="تغییراتی که دادی هنوز ذخیره نشدن. می‌خوای ذخیره‌شون کنی؟"
        showCancel={true}
        cancelText="خروج بدون ذخیره"
        confirmText="ذخیره و خروج"
        onCancel={() => {
          setShowExitAlert(false);
          if (pendingAction) {
            navigation.dispatch(pendingAction); // خروج بدون ذخیره
          }
        }}
        onConfirm={async () => {
          await saveNoteToDb();
          setShowExitAlert(false);
          if (pendingAction) {
            navigation.dispatch(pendingAction);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 8 },
  titleInput: {
    fontFamily: 'Vazir-Bold',
    fontSize: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'right',
  },
  contentInput: {
    flex: 1,
    fontFamily: 'Vazir',
    fontSize: 16,
    lineHeight: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    textAlign: 'right',
  },
});