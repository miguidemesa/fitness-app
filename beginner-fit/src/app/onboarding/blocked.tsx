import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CapyFigure } from '@/components/capy';
import { Body, Button, Card, Screen, Tag } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, space, type } from '@/theme';
import { SCREENING_QUESTIONS } from '@/utils/screening';

const DOCTOR_QUESTIONS = [
  'Is it safe for me to start simple strength exercise?',
  'Are there movements I should avoid?',
  "How will I know if I'm pushing too hard?",
];

/** Deliberately calm: neutral colours, caring Capy, fades only. */
export default function Blocked() {
  const { draft, update } = useProfile();
  const [showQuestions, setShowQuestions] = useState(false);
  const q = SCREENING_QUESTIONS.find((x) => x.id === draft.blockedQuestionId) ?? SCREENING_QUESTIONS.find((x) => x.blocks && draft.answers[x.id] !== false)!;

  // ponytail: "cleared by a doctor" is self-reported; the PRD still has this as an open question.
  const cleared = () => {
    update({ answers: { ...draft.answers, [q.id]: false }, clearedQuestions: [...draft.clearedQuestions, q.id], blockedQuestionId: undefined });
    router.back();
  };

  return (
    <Screen
      footer={
        <>
          <Button label={showQuestions ? 'Hide the questions' : 'What should I ask my doctor?'} onPress={() => setShowQuestions(!showQuestions)} />
          <Button variant="secondary" label="I picked the wrong answer" onPress={() => router.back()} />
          <Button variant="secondary" label="My doctor has cleared me" onPress={cleared} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: space.m, marginTop: space.xl }}>
        <CapyFigure size={120} mood="caring" />
        <Text accessibilityRole="header" style={[type.title, { textAlign: 'center' }]}>
          Let's check with a doctor first
        </Text>
      </View>
      <Card style={{ padding: space.l, gap: space.m }}>
        <Tag>You said yes to</Tag>
        <Text style={type.label}>{q.text}</Text>
      </Card>
      <Body>That doesn't mean you can't exercise. A doctor should say it's OK before Capy builds your plan. Any good trainer would tell you the same.</Body>
      {showQuestions ? (
        <Animated.View entering={FadeIn}>
          <Card style={{ padding: space.l, gap: space.s }}>
            <Text style={type.label}>Questions to take with you</Text>
            {DOCTOR_QUESTIONS.map((t, n) => (
              <Body key={t} style={{ fontSize: 15, color: colors.body }}>
                {n + 1}. {t}
              </Body>
            ))}
          </Card>
        </Animated.View>
      ) : null}
    </Screen>
  );
}
