import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { Step } from '@/components/onboarding';
import { Chip, Tag } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, motion, radius, space, type } from '@/theme';
import { SCREENING_QUESTIONS, needsInjuryAreas } from '@/utils/screening';

/** Seven PAR-Q+ questions, dealt one card at a time. Deliberately calm: no reactions to any answer. */
export default function Health() {
  const { draft, update } = useProfile();
  const [i, setI] = useState(0);
  const q = SCREENING_QUESTIONS[i];

  const answer = (yes: boolean) => {
    const answers = { ...draft.answers, [q.id]: yes };
    if (yes && q.blocks) {
      update({ answers, blockedQuestionId: q.id });
      router.push('/onboarding/blocked');
      return;
    }
    update({ answers });
    if (i < SCREENING_QUESTIONS.length - 1) setI(i + 1);
    else router.push(needsInjuryAreas(answers) ? '/onboarding/areas' : '/onboarding/disclaimer');
  };

  return (
    <Step
      step={4}
      title="A quick health check"
      subtitle="Capy asks everyone these, so your plan is safe."
      onBack={() => (i > 0 ? setI(i - 1) : router.back())}
      footer={
        <View style={{ flexDirection: 'row', gap: space.s, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="lock" size={14} color={colors.muted} />
          <Text style={type.caption}>Your answers stay private.</Text>
        </View>
      }
    >
      <Animated.View key={q.id} entering={SlideInRight.duration(motion.base)} exiting={SlideOutLeft.duration(160)} style={styles.card}>
        <Tag>
          Question {i + 1} of {SCREENING_QUESTIONS.length}
        </Tag>
        <Text accessibilityRole="header" style={[type.heading, { lineHeight: 30 }]}>
          {q.text}
        </Text>
        <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.s }}>
          <Chip label="Yes" selected={draft.answers[q.id] === true} onPress={() => answer(true)} style={styles.answer} />
          <Chip label="No" selected={draft.answers[q.id] === false} onPress={() => answer(false)} style={styles.answer} />
        </View>
      </Animated.View>
    </Step>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: radius.photo, borderCurve: 'continuous', padding: space.xl, gap: space.m, marginTop: space.l },
  answer: { flex: 1, minHeight: 64 },
});
