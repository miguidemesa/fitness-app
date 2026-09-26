import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, CoachBubble } from '@/components/ui';
import { colors, fonts } from '@/theme';

export default function Welcome() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <SafeAreaView edges={['top']} style={styles.hero}>
        <Text accessibilityRole="header" style={styles.title}>
          Start where you are.
        </Text>
        <Text style={styles.lede}>A coach for people who've never set foot in a gym. No jargon, no pressure, just your first week, planned for you.</Text>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        <CoachBubble>Hi! I'm Capy. I'll ask a few easy questions. There are no wrong answers.</CoachBubble>
        <View style={{ flex: 1 }} />
        <Button label="Get started" onPress={() => router.push('/onboarding/goal')} />
        <Text style={styles.small}>About 3 minutes · No sign-up to try</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.ink, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 40, gap: 16 },
  title: { fontFamily: fonts.display, fontSize: 64, lineHeight: 60, textTransform: 'uppercase', color: '#FFFFFF', marginTop: 40 },
  lede: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26, color: '#D4D3CE', maxWidth: 320 },
  bottom: { flex: 1, padding: 20, gap: 14 },
  small: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, textAlign: 'center' },
});
