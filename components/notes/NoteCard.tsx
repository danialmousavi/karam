// مسیر: components/notes/NoteCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment-jalaali';
import { useTheme } from '../../context/ThemeContext';
import { Note } from '../../services/database';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

export default function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const { colors } = useTheme();
  // تبدیل timestamp به تاریخ و ساعت شمسی
  const formattedDate = moment(note.updatedAt).format('jYYYY/jMM/jDD - HH:mm');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="trash-2" size={18} color={colors.danger || '#d32f2f'} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.content, { color: colors.textMuted }]} numberOfLines={3}>
        {note.content}
      </Text>

      <View style={styles.footer}>
        <Feather name="clock" size={12} color={colors.textMuted} />
        <Text style={[styles.dateText, { color: colors.textMuted }]}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Vazir-Bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  content: {
    fontFamily: 'Vazir',
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontFamily: 'Vazir',
    fontSize: 11,
    marginRight: 6,
  },
});