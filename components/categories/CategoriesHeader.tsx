import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

export default function CategoriesHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>دسته‌بندی‌ها 📂</Text>
      <Text style={styles.headerSubtitle}>برنامه‌هات رو تفکیک و منظم کن</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 24, 
    color: colors.primaryDark, 
    textAlign: 'right' 
  },
  headerSubtitle: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 13, 
    color: colors.textMuted, 
    textAlign: 'right', 
    marginTop: 4 
  },
});