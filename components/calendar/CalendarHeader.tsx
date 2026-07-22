import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface CalendarHeaderProps {
  onGoToToday: () => void;
}

export default function CalendarHeader({ onGoToToday }: CalendarHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={[styles.pageTitle, { color: colors.primaryDark }]}>تقویم من 📅</Text>
        <TouchableOpacity 
          style={[
            styles.todayButton, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]} 
          onPress={onGoToToday}
        >
          <Text style={[styles.todayButtonText, { color: colors.primaryDark }]}>امروز</Text>
          <Feather name="calendar" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>با تقویم برنامت رو بچین</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 24,
  },
  headerSubtitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 2,
  },
  todayButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  todayButtonText: {
    fontFamily: 'Vazir',
    fontSize: 13,
    marginRight: 6,
  },
});