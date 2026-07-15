import React, { useEffect, useRef } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CustomAlertProps {
  visible: boolean;
  type: 'success' | 'danger' | 'warning';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const { width } = Dimensions.get('window');

export default function CustomAlert({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  showCancel = false,
  confirmText = 'تایید',
  cancelText = 'انصراف'
}: CustomAlertProps) {
  
  // تعریف انیمیشن برای بزرگ‌نمایی ملایم (Scale) و شفافیت (Opacity)
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // اجرای همزمان دو انیمیشن با حالت فنری (Spring) برای حس زنده بودن آلرت
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 6, // میزان مقاومت فنر
          tension: 45, // سرعت جهش فنر
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  // تم‌های رنگی پاستیلی بر اساس نوع آلرت
  const theme = {
    success: {
      bg: '#E8F5E9',
      iconBg: '#C8E6C9',
      iconColor: '#2E7D32',
      icon: 'check-circle' as const,
      btnBg: '#2E7D32'
    },
    danger: {
      bg: '#FFEBEE',
      iconBg: '#FFCDD2',
      iconColor: '#C62828',
      icon: 'trash-2' as const,
      btnBg: '#C62828'
    },
    warning: {
      bg: '#FFF3E0',
      iconBg: '#FFE0B2',
      iconColor: '#E65100',
      icon: 'alert-triangle' as const,
      btnBg: '#E65100'
    }
  }[type];

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View 
          style={[
            styles.alertBox, 
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          {/* بخش آیکون بالای آلرت با پس‌زمینه دایره‌ای پاستیلی */}
          <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
            <Feather name={theme.icon} size={28} color={theme.iconColor} />
          </View>

          {/* متن‌ها */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* دکمه‌ها */}
          <View style={[styles.buttonContainer, { flexDirection: showCancel ? 'row' : 'column' }]}>
            {showCancel && (
              <TouchableOpacity 
                style={[styles.button, styles.btnCancel]} 
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.btnBg, flex: showCancel ? 1.3 : 0 }]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: width * 0.82,
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Vazir-Bold',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  btnCancelText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    color: '#666',
  },
  btnConfirmText: {
    fontFamily: 'Vazir-Bold',
    fontSize: 14,
    color: '#FFF',
  },
});