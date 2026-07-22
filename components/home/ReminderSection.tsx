import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import TimePicker from '../TimePicker';

interface ReminderSectionProps {
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
  selectedHour: number;
  selectedMinute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

export default function ReminderSection({
  isEnabled,
  onToggle,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
}: ReminderSectionProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.reminderContainer,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.reminderHeader}>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primaryDark }}
          thumbColor={colors.surface}
        />
        <Text style={[styles.sectionLabel, { color: colors.text }]}>یادآوری با آلارم 🔔</Text>
      </View>

      {isEnabled && (
        <TimePicker
          selectedHour={selectedHour}
          selectedMinute={selectedMinute}
          onHourChange={onHourChange}
          onMinuteChange={onMinuteChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reminderContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    textAlign: 'right',
  },
});