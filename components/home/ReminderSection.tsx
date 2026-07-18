// components/home/ReminderSection.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
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
  return (
    <View style={styles.reminderContainer}>
      <View style={styles.reminderHeader}>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primaryDark }}
          thumbColor={colors.surface}
        />
        <Text style={styles.sectionLabel}>یادآوری با آلارم 🔔</Text>
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
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontFamily: 'Vazir-Bold', fontSize: 13, color: colors.text, textAlign: 'right' },
});