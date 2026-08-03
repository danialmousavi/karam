import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db, Note } from '../../services/database';
import { useTheme } from '../../context/ThemeContext';
import NoteCard from '../../components/notes/NoteCard';
import CustomAlert from '../../components/CustomAlert';

export default function FolderNotesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const [notes, setNotes] = useState<Note[]>([]);
  
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    noteIdToDelete: '',
  });

  const loadData = async () => {
    if (!id) return;
    const notesData = await db.getNotes(id);
    setNotes(notesData);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const confirmDelete = async () => {
    await db.deleteNote(alertConfig.noteIdToDelete);
    setAlertConfig({ visible: false, noteIdToDelete: '' });
    loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{name || 'یادداشت‌ها'}</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="file-text" size={48} color={colors.border} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>هنوز یادداشتی اینجا ننوشتی!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <NoteCard 
            note={item} 
            onPress={() => {
              router.push({ 
                pathname: '/notes/editor', 
                params: { 
                  folderId: item.folderId, 
                  noteId: item.id,
                  initialTitle: item.title,
                  initialContent: item.content
                } 
              });
            }} 
            onDelete={() => setAlertConfig({ visible: true, noteIdToDelete: item.id })}
          />
        )}
      />

      {/* 🌟 دکمه اکشن‌باتن اختصاصی برای همین پوشه */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primaryDark,
            shadowColor: colors.primaryDark,
            bottom: insets.bottom > 0 ? insets.bottom + 20 : 30, 
          },
        ]}
        onPress={() => router.push({ pathname: '/notes/editor', params: { folderId: id } })}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color={colors.surface} />
      </TouchableOpacity>

      <CustomAlert
        visible={alertConfig.visible}
        type="danger"
        title="حذف یادداشت"
        message="مطمئنی می‌خوای این یادداشت رو برای همیشه پاک کنی؟"
        showCancel
        onConfirm={confirmDelete}
        onCancel={() => setAlertConfig({ visible: false, noteIdToDelete: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 15,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backBtn: { padding: 4 },
  headerTitle: { 
    flex: 1, 
    fontFamily: 'Vazir-Bold', 
    fontSize: 20, 
    textAlign: 'right', 
    marginRight: 15 
  },
  listContainer: { padding: 20, paddingBottom: 100 },
  emptyState: { alignItems: 'center', marginTop: 120 },
  emptyText: { fontFamily: 'Vazir-Bold', fontSize: 16 },
  fab: {
    position: 'absolute',
    left: 28, 
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});