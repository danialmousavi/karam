// components/categories/ColorPalette.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const PASTEL_PALETTE = [
  { color: '#CE93D8', textColor: '#4A148C' }, // بنفش
  { color: '#90CAF9', textColor: '#0D47A1' }, // آبی
  { color: '#A5D6A7', textColor: '#1B5E20' }, // سبز پررنگ
  { color: '#FFCC80', textColor: '#E65100' }, // نارنجی
  { color: '#F48FB1', textColor: '#880E4F' }, // صورتی
  { color: '#80DEEA', textColor: '#006064' }, // فیروزه‌ای
];

interface ColorPaletteProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ColorPalette({ selectedIndex, onSelect }: ColorPaletteProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.colorPalette}>
      {PASTEL_PALETTE.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.colorCircle,
            { backgroundColor: item.color },
            selectedIndex === index && { 
              borderColor: item.textColor, 
              borderWidth: 3 
            }
          ]}
          onPress={() => onSelect(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  colorPalette: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    marginBottom: 30 
  },
  colorCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 18 
  },
});