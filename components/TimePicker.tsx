import React, { useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEM_HEIGHT = 50; 
const VISIBLE_ITEMS = 3; 

const CYCLES = 5; 
const MIDDLE_CYCLE = Math.floor(CYCLES / 2);

const baseHours = Array.from({ length: 24 }, (_, i) => i);
const baseMinutes = Array.from({ length: 60 }, (_, i) => i);

const hours = [-1, ...Array(CYCLES).fill(baseHours).flat(), -1];
const minutes = [-1, ...Array(CYCLES).fill(baseMinutes).flat(), -1];

const snapOffsetsHours = hours.map((_, i) => i * ITEM_HEIGHT);
const snapOffsetsMinutes = minutes.map((_, i) => i * ITEM_HEIGHT);

interface TimePickerProps {
  selectedHour: number;
  selectedMinute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

function TimePicker({ 
  selectedHour, 
  selectedMinute, 
  onHourChange, 
  onMinuteChange 
}: TimePickerProps) {
  const { colors } = useTheme();
  
  const hourListRef = useRef<any>(null);
  const minuteListRef = useRef<any>(null);

  const scrollYHour = useRef(new Animated.Value(0)).current;
  const scrollYMinute = useRef(new Animated.Value(0)).current;

  // محاسبه دقیق ایندکس برای لود اولیه
  const initialHourIndex = (MIDDLE_CYCLE * 24) + selectedHour;
  const initialMinuteIndex = (MIDDLE_CYCLE * 60) + selectedMinute;

  // پیدا کردن عدد وسط موقعی که اسکرول متوقف میشه
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>, type: 'hour' | 'minute') => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT) + 1;
    
    if (type === 'hour') {
      const value = hours[index];
      if (value !== -1 && value !== undefined) onHourChange(value);
    } else {
      const value = minutes[index];
      if (value !== -1 && value !== undefined) onMinuteChange(value);
    }
  };

  // کلیک روی اعداد برای اسکرول به اون عدد
  const handleItemPress = (index: number, value: number, type: 'hour' | 'minute') => {
    if (value === -1) return;
    const targetOffset = (index - 1) * ITEM_HEIGHT;
    
    if (type === 'hour') {
      onHourChange(value);
      hourListRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
    } else {
      onMinuteChange(value);
      minuteListRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
    }
  };

  const renderItem = ({ item, index }: { item: number, index: number }, type: 'hour' | 'minute') => {
    // رندر آیتم‌های خالی به عنوان پرکننده برای تراز شدن
    if (item === -1) return <View style={styles.item} />;
    
    const scrollY = type === 'hour' ? scrollYHour : scrollYMinute;
    const inputRange = [(index - 2) * ITEM_HEIGHT, (index - 1) * ITEM_HEIGHT, index * ITEM_HEIGHT];

    const scale = scrollY.interpolate({ inputRange, outputRange: [0.75, 1.15, 0.75], extrapolate: 'clamp' });
    const opacity = scrollY.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });

    return (
      <TouchableOpacity 
        style={styles.item}
        activeOpacity={0.8}
        onPress={() => handleItemPress(index, item, type)}
      >
        <Animated.Text style={[
          styles.itemText, 
          { color: colors.primaryDark, opacity, transform: [{ scale }] }
        ]}>
          {item.toString().padStart(2, '0')}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.highlightBand, { backgroundColor: colors.background }]} pointerEvents="none" />
      
      <View style={styles.pickerWrapper}>
        {/* لیست ساعت‌ها */}
        <View style={styles.listContainer}>
          <Animated.FlatList
            ref={hourListRef}
            data={hours}
            keyExtractor={(_, index) => `h-${index}`}
            renderItem={(props) => renderItem(props, 'hour')}
            showsVerticalScrollIndicator={false}
            snapToOffsets={snapOffsetsHours} // قفل شدن دقیق پیکسل به پیکسل
            decelerationRate="fast"
            initialScrollIndex={initialHourIndex}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            // پروپ‌های بهینه‌سازی پرفورمنس برای رفع کامل لگ
            windowSize={3}
            maxToRenderPerBatch={5}
            initialNumToRender={5}
            removeClippedSubviews={true}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollYHour } } }], { useNativeDriver: true })}
            onMomentumScrollEnd={(e) => handleScrollEnd(e, 'hour')}
          />
        </View>

        <Animated.Text style={[styles.colon, { color: colors.primaryDark }]}>:</Animated.Text>

        {/* لیست دقیقه‌ها */}
        <View style={styles.listContainer}>
          <Animated.FlatList
            ref={minuteListRef}
            data={minutes}
            keyExtractor={(_, index) => `m-${index}`}
            renderItem={(props) => renderItem(props, 'minute')}
            showsVerticalScrollIndicator={false}
            snapToOffsets={snapOffsetsMinutes}
            decelerationRate="fast"
            initialScrollIndex={initialMinuteIndex}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            // پروپ‌های بهینه‌سازی پرفورمنس برای رفع کامل لگ
            windowSize={3}
            maxToRenderPerBatch={5}
            initialNumToRender={5}
            removeClippedSubviews={true}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollYMinute } } }], { useNativeDriver: true })}
            onMomentumScrollEnd={(e) => handleScrollEnd(e, 'minute')}
          />
        </View>
      </View>
    </View>
  );
}

export default React.memo(TimePicker);

const styles = StyleSheet.create({
  container: { height: ITEM_HEIGHT * VISIBLE_ITEMS, borderRadius: 16, borderWidth: 1, overflow: 'hidden', justifyContent: 'center', marginTop: 16 },
  highlightBand: { position: 'absolute', top: ITEM_HEIGHT, left: 12, right: 12, height: ITEM_HEIGHT, borderRadius: 12 },
  pickerWrapper: { flexDirection: 'row', direction: 'ltr', justifyContent: 'center', alignItems: 'center' },
  listContainer: { height: ITEM_HEIGHT * VISIBLE_ITEMS, width: 70 },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: '100%' },
  itemText: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 26, 
    textAlignVertical: 'center', 
    includeFontPadding: false 
  },
  colon: { 
    fontFamily: 'Vazir-Bold', 
    fontSize: 32, 
    marginHorizontal: 15, 
    marginBottom: 4, 
    textAlignVertical: 'center', 
    includeFontPadding: false 
  },
});