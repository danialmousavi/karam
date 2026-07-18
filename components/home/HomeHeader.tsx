// components/home/HomeHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function HomeHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>کارام</Text>
      <Text style={styles.headerSubtitle}>چه خبر از امروز؟</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, marginBottom: 16 },
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