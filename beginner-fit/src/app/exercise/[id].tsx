import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExerciseLoop } from '@/components/exercise-loop';
import { Enter } from '@/components/motion';
import { Card } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, radius, space, type } from '@/theme';

/** How to do one move, as a native sheet: the demo playing on a loop, what it works, and numbered steps. */
export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = useProfile().exercises[id];
  if (!ex) return null;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ExerciseLoop images={ex.images} name={ex.name} style={styles.demo} />
      <View style={{ gap: space.s }}>
        <Text accessibilityRole="header" style={type.title}>
          {ex.name}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
          {[...ex.primaryMuscles, ex.equipment && ex.equipment !== 'body only' ? ex.equipment : 'no equipment'].map((t) => (
            <Text key={t} style={styles.chip}>
              {t}
            </Text>
          ))}
        </View>
      </View>
      <Card style={{ padding: space.l, gap: space.l }}>
        {ex.instructions.map((step, i) => (
          <Enter key={i} index={i} style={{ flexDirection: 'row', gap: space.m }}>
            <View style={styles.num}>
              <Text style={[type.label, { fontSize: 14 }]}>{i + 1}</Text>
            </View>
            <Text style={[type.body, { flex: 1 }]}>{step}</Text>
          </Enter>
        ))}
      </Card>
      <Text style={type.caption}>If anything hurts, stop. You can tell Capy when you log the move.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.gutter, paddingTop: space.xl, gap: space.l },
  demo: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.photo, borderCurve: 'continuous' },
  chip: { ...type.caption, color: colors.ink, textTransform: 'capitalize', backgroundColor: colors.paper, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, overflow: 'hidden' },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.yuzu, alignItems: 'center', justifyContent: 'center' },
});
