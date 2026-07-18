import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Category } from '../../services/database';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: Category[];
  tasks: any[];
  onDeleteCategory: (id: string, name: string) => void;
  getTaskCount: (categoryId: string) => number;
}

export default function CategoryGrid({ 
  categories, 
  onDeleteCategory, 
  getTaskCount 
}: CategoryGridProps) {
  return (
    <FlatList
      data={categories}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <CategoryCard
          category={item}
          taskCount={getTaskCount(item.id)}
          onDelete={onDeleteCategory}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: 16, paddingBottom: 120 },
  row: { justifyContent: 'space-between' },
});