import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Screen, s } from '@/components/ui';
import { CapyAvatar } from '@/components/capy';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { SCREENING_QUESTIONS } from '@/utils/screening';

const DOCTOR_QUESTIONS = [
  'Is it safe for me to start simple strength exercise?',
  'Are there movements I should avoid?',
  "How will I know if I'm pushing too hard?",
];

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
          <Button variant="ghost" label="I picked the wrong answer" onPress={() => router.back()} />
          <Button variant="ghost" label="My doctor has cleared me" onPress={cleared} />
        </>
      }
    >
      <View style={{ backgroundColor: colors.ink, borderRadius: 22, padding: 22, gap: 14, marginTop: 8 }}>
        <CapyAvatar size={48} mood="caring" />
        <Text accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 40, lineHeight: 40, textTransform: 'uppercase', color: '#FFFFFF' }}>
          Let's check with a doctor first
        </Text>
      </View>
      <View style={[s.card, { padding: 18, gap: 12 }]}>
        <Text style={s.meta}>You said yes to</Text>
        <Body style={{ backgroundColor: colors.ground, borderRadius: 12, padding: 12 }}>{q.text}</Body>
        <Body>That doesn't mean you can't exercise. A doctor should say it's OK before Capy builds your plan. Any good trainer would tell you the same.</Body>
        {showQuestions ? (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, gap: 6 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.ink }}>Questions to take with you</Text>
            {DOCTOR_QUESTIONS.map((t, n) => (
              <Body key={t} style={{ fontSize: 15 }}>
                {n + 1}. {t}
              </Body>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
