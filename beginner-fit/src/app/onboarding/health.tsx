import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Body, Screen, StepHeader, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { SCREENING_QUESTIONS, needsInjuryAreas } from '@/utils/screening';

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
    <Screen>
      <StepHeader step={4} total={4} onBack={() => (i > 0 ? setI(i - 1) : router.back())} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title>Health check</Title>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }} accessibilityLabel={`Question ${i + 1} of ${SCREENING_QUESTIONS.length}`}>
          {i + 1}
          <Text style={{ color: colors.muted }}>/{SCREENING_QUESTIONS.length}</Text>
        </Text>
      </View>
      <View style={[s.card, { padding: 20, gap: 20 }]}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, color: colors.ink }}>{q.text}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            ['Yes', true],
            ['No', false],
          ].map(([label, value]) => (
            <Pressable
              key={String(label)}
              accessibilityRole="button"
              onPress={() => answer(value as boolean)}
              style={({ pressed }) => [s.option, { flex: 1, justifyContent: 'center', minHeight: 60 }, (pressed || draft.answers[q.id] === value) && s.optionOn]}
            >
              <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.ink }}>{label as string}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 3 }}>
          <Rect x="5" y="11" width="14" height="9" rx="2" />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </Svg>
        <Body style={{ flex: 1, fontSize: 14, color: colors.muted }}>Capy asks everyone these so your plan is safe. Your answers stay private.</Body>
      </View>
    </Screen>
  );
}
