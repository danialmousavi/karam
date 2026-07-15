import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>این صفحه به زودی ساخته می‌شود 🚧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  text: { fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.textMuted },
});