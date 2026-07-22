import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Category } from '../../services/database';

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function CategoryChip({ category, isSelected, onSelect }: CategoryChipProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        {
          backgroundColor: isSelected ? category.color : colors.background,
          borderColor: colors.border,
        },
        isSelected && { borderColor: category.textColor, borderWidth: 1 },
      ]}
      onPress={() => onSelect(category.id)}
    >
      <Feather
        name={category.icon as any}
        size={16}
        color={isSelected ? category.textColor : colors.textMuted}
      />
      <Text
        style={[
          styles.categoryChipText,
          { color: isSelected ? category.textColor : colors.textMuted },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  categoryChipText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    marginRight: 6,
  },
});