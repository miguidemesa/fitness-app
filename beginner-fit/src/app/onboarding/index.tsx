import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CapyFigure } from '@/components/capy';
import { Enter } from '@/components/motion';
import { Button } from '@/components/ui';
import { colors, fonts, space, type } from '@/theme';

/** First screen: yuzu, Capy waving, one line, one button. */
export default function Welcome() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Enter index={0} style={{ marginTop: space.xxl, gap: space.l }}>
        <Text style={styles.mark}>
          capy<Text style={{ color: colors.paper }}>.</Text>
        </Text>
        <Text accessibilityRole="header" style={styles.title}>
          start where{'\n'}
          <Text style={{ fontFamily: fonts.displayMedium }}>you are.</Text>
        </Text>
        <Text style={[type.body, { color: colors.ink, fontSize: 17, lineHeight: 26, maxWidth: 320 }]}>
          A coach for people who've never set foot in a gym. No jargon, no pressure. Just your first week, planned for you.
        </Text>
      </Enter>
      <Enter index={1} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <CapyFigure size={220} mood="hello" band={colors.ink} wave />
      </Enter>
      <Enter index={2} style={{ gap: space.s }}>
        <Button label="Get started" tall onPress={() => router.push('/onboarding/goal')} />
        <Button variant="text" label="I already have an account" onPress={() => router.push('/onboarding/signin')} />
        <Text style={[type.caption, { color: colors.ink, textAlign: 'center' }]}>About 3 minutes · No sign-up to try</Text>
      </Enter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.yuzu, paddingHorizontal: space.gutter, paddingBottom: space.s },
  mark: { fontFamily: fonts.displayHeavy, fontSize: 26, letterSpacing: -0.6, color: colors.ink },
  title: { fontFamily: fonts.displayHeavy, fontSize: 56, lineHeight: 56, letterSpacing: -1.6, color: colors.ink },
});
