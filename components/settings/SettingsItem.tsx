import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  type?: 'link' | 'switch';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}

export default function SettingsItem({
  icon,
  title,
  subtitle,
  type = 'link',
  value,
  onValueChange,
  onPress,
  danger = false,
  last = false,
}: SettingsItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      disabled={type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.itemRight}>
        <View style={[
          styles.iconWrapper,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
          danger && { backgroundColor: '#FFE5E5', borderColor: '#FFCDD2' },
        ]}>
          <Feather 
            name={icon} 
            size={20} 
            color={danger ? '#FF4444' : colors.primaryDark} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.itemTitle,
            { color: colors.text },
            danger && { color: '#FF4444' },
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.itemLeft}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor={colors.surface}
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        ) : (
          <Feather name="chevron-left" size={20} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 15,
    textAlign: 'right',
  },
  itemSubtitle: {
    fontFamily: 'Vazir',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  itemLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});