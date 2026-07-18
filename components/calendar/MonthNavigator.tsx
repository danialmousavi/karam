import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import moment from 'moment-jalaali';

interface MonthNavigatorProps {
  currentMonth: moment.Moment;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthNavigator({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: MonthNavigatorProps) {
  return (
    <View style={styles.monthNav}>
      <TouchableOpacity style={styles.navButton} onPress={onNextMonth}>
        <Feather name="chevron-right" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.monthTitle}>
        {currentMonth.format('jMMMM jYYYY')}
      </Text>
      <TouchableOpacity style={styles.navButton} onPress={onPrevMonth}>
        <Feather name="chevron-left" size={22} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  monthTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    color: colors.text,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});