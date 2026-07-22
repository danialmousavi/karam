// components/TimePicker.tsx
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEM_HEIGHT = 50; 
const VISIBLE_ITEMS = 3; 

// 🌟 تکرار لیست برای ایجاد افکت چرخشی بی‌نهایت
const REPEATS = 200;
const MIDDLE_CYCLE = Math.floor(REPEATS / 2);

// آرایه پایه
const baseHours = Array.from({ length: 24 }, (_, i) => i);
const baseMinutes = Array.from({ length: 60 }, (_, i) => i);

// ساخت آرایه بی‌نهایت به همراه فضاهای خالی در ابتدا و انتها
const hours = ['', ...Array(REPEATS).fill(baseHours).flat(), ''];
const minutes = ['', ...Array(REPEATS).fill(baseMinutes).flat(), ''];

interface TimePickerProps {
  selectedHour: number;
  selectedMinute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

export default function TimePicker({ 
  selectedHour, 
  selectedMinute, 
  onHourChange, 
  onMinuteChange 
}: TimePickerProps) {
  const { colors } = useTheme();
  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);

  // اسکرول کردن به زمان انتخاب شده در "وسط" لیست بزرگ
  useEffect(() => {
    setTimeout(() => {
      const initialHourOffset = (MIDDLE_CYCLE * 24 + selectedHour) * ITEM_HEIGHT;
      const initialMinuteOffset = (MIDDLE_CYCLE * 60 + selectedMinute) * ITEM_HEIGHT;
      
      hourListRef.current?.scrollToOffset({ offset: initialHourOffset, animated: false });
      minuteListRef.current?.scrollToOffset({ offset: initialMinuteOffset, animated: false });
    }, 100);
  }, []);

  // هندل کردن زمان توقف اسکرول و آپدیت استیت
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>, type: 'hour' | 'minute') => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const topIndex = Math.round(offsetY / ITEM_HEIGHT);
    const centerIndex = topIndex + 1;
    
    if (type === 'hour') {
      const value = hours[centerIndex];
      if (typeof value === 'number') onHourChange(value);
    } else {
      const value = minutes[centerIndex];
      if (typeof value === 'number') onMinuteChange(value);
    }
  };

  // هندل کردن لمس (Tap) روی اعداد
  const handleItemPress = (absoluteIndex: number, value: number | string, type: 'hour' | 'minute') => {
    if (typeof value !== 'number') return;

    const targetOffset = (absoluteIndex - 1) * ITEM_HEIGHT;

    if (type === 'hour') {
      onHourChange(value);
      hourListRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
    } else {
      onMinuteChange(value);
      minuteListRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
    }
  };

  // رندر کردن هر آیتم
  const renderItem = ({ item, index }: { item: number | string, index: number }, currentValue: number, type: 'hour' | 'minute') => {
    const isSelected = item === currentValue;
    const isEmpty = item === '';

    return (
      <TouchableOpacity 
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => handleItemPress(index, item, type)}
        disabled={isEmpty} 
      >
        {!isEmpty && (
          <Text style={[
            styles.itemText, 
            { color: colors.textMuted },
            isSelected && { color: colors.primaryDark, fontFamily: 'Vazir-Bold', fontSize: 28 }
          ]}>
            {item.toString().padStart(2, '0')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }
    ]}>
      <View style={[styles.highlightBand, { backgroundColor: colors.background }]} pointerEvents="none" />
      
      <View style={styles.pickerWrapper}>
        {/* لیست ساعت‌ها */}
        <View style={styles.listContainer}>
          <FlatList
            ref={hourListRef}
            data={hours}
            keyExtractor={(_, index) => `h-${index}`}
            renderItem={(props) => renderItem(props, selectedHour, 'hour')}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => handleScroll(e, 'hour')}
            onScrollEndDrag={(e) => {
              if (e.nativeEvent.velocity && Math.abs(e.nativeEvent.velocity.y) < 0.1) handleScroll(e, 'hour');
            }}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          />
        </View>

        <Text style={[styles.colon, { color: colors.primaryDark }]}>:</Text>

        {/* لیست دقیقه‌ها */}
        <View style={styles.listContainer}>
          <FlatList
            ref={minuteListRef}
            data={minutes}
            keyExtractor={(_, index) => `m-${index}`}
            renderItem={(props) => renderItem(props, selectedMinute, 'minute')}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => handleScroll(e, 'minute')}
            onScrollEndDrag={(e) => {
              if (e.nativeEvent.velocity && Math.abs(e.nativeEvent.velocity.y) < 0.1) handleScroll(e, 'minute');
            }}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    marginTop: 16,
  },
  highlightBand: {
    position: 'absolute',
    top: ITEM_HEIGHT, 
    left: 12,
    right: 12,
    height: ITEM_HEIGHT,
    borderRadius: 12,
  },
  pickerWrapper: {
    flexDirection: 'row', 
    direction: 'ltr', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 70,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemText: {
    fontFamily: 'Vazir',
    fontSize: 22,
  },
  colon: {
    fontFamily: 'Vazir-Bold',
    fontSize: 28,
    marginHorizontal: 15,
    marginBottom: 5,
  },
});