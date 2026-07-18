import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export const AVAILABLE_ICONS = [
  'user', 'briefcase', 'activity', 'shopping-bag', 
  'book', 'heart', 'coffee', 'gift', 'star'
];

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

export default function IconSelector({ selectedIcon, onSelect }: IconSelectorProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.horizontalScroll}
      contentContainerStyle={styles.horizontalScrollContent}
    >
      {AVAILABLE_ICONS.map((iconName) => (
        <TouchableOpacity
          key={iconName}
          style={[
            styles.iconSelect,
            selectedIcon === iconName && { 
              borderColor: colors.primaryDark, 
              borderWidth: 2 
            }
          ]}
          onPress={() => onSelect(iconName)}
        >
          <Feather name={iconName as any} size={20} color={colors.primaryDark} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  horizontalScroll: { marginBottom: 20 },
  horizontalScrollContent: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    paddingHorizontal: 4 
  },
  iconSelect: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: colors.background, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 10, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
});