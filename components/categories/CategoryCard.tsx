// components/categories/CategoryCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Category } from '../../services/database';

interface CategoryCardProps {
  category: Category;
  taskCount: number;
  onDelete: (id: string, name: string) => void;
  onPress: (id: string) => void;
}

export default function CategoryCard({ 
  category, 
  taskCount, 
  onDelete, 
  onPress 
}: CategoryCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: category.color,
          shadowColor: '#000',
        }
      ]} 
      onPress={() => onPress(category.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
          <Feather name={category.icon as any} size={20} color={category.textColor} />
        </View>
        <TouchableOpacity 
          onPress={() => onDelete(category.id, category.name)} 
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={16} color={category.textColor} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.cardTitle, { color: category.textColor }]}>{category.name}</Text>
      <Text style={[styles.cardCount, { color: category.textColor }]}>
        {taskCount} کار باقی‌مانده
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    flex: 1, 
    height: 120, 
    margin: 8, 
    borderRadius: 20, 
    padding: 14, 
    justifyContent: 'space-between', 
    elevation: 2, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 3 } 
  },
  cardHeader: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  iconWrapper: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  deleteButton: { padding: 4 },
  cardTitle: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 16, 
    textAlign: 'right', 
    marginTop: 8 
  },
  cardCount: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 11, 
    textAlign: 'right', 
    opacity: 0.8 
  },
});