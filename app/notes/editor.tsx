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
import CustomAlert from '../../components/CustomAlert'; 

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
  
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const hasUnsavedChanges = title !== (initialTitle || '') || content !== (initialContent || '');

  const saveNoteToDb = async () => {
    if (!title.trim() && !content.trim()) {
      return false; 
    }

    if (noteId) {
      await db.updateNote(noteId, { title: title.trim(), content: content.trim() });
    } else if (folderId) {
      const finalTitle = title.trim() || (content.trim().split(' ').slice(0, 3).join(' ') + '...');
      await db.addNote(folderId, finalTitle, content.trim());
    }
    return true;
  };

  const handlePressCheck = async () => {
    await saveNoteToDb();
    router.back();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault(); 
      setPendingAction(e.data.action); 
      setShowExitAlert(true); 
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, title, content]);

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}>
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

        {/* 🌟 محتوای ادیتور: بدون اسکرول‌ویو تا خود اینپوت هندلش کنه */}
        <View style={styles.inputsContainer}>
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
            multiline={true}
            textAlignVertical="top" 
          />
        </View>

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
              navigation.dispatch(pendingAction);
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
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 8 },
  inputsContainer: {
    flex: 1, 
    paddingHorizontal: 20,
  },
  titleInput: {
    fontFamily: 'Vazir-Bold',
    fontSize: 28,
    paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'right',
  },
  contentInput: {
    flex: 1, 
    fontFamily: 'Vazir',
    fontSize: 16,
    lineHeight: 28,
    paddingTop: 10,
    paddingBottom: 20,
    textAlign: 'right',
  },
});