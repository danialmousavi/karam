// components/notes/NotesFAB.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotesFABProps {
  onPress: () => void;
}

export default function NotesFAB({ onPress }: NotesFABProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const bottomMargin = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 28 : 20);

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: colors.primaryDark,
          shadowColor: colors.primaryDark,
          bottom: bottomMargin + 102, 
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name="plus" size={24} color={colors.surface} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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