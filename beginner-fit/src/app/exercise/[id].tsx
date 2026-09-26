import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Body, Screen, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

/** How to do one move: start/end photos and numbered steps from the exercise library. */
export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = useProfile().exercises[id];
  const [frame, setFrame] = useState(0);
  if (!ex) return null;

  return (
    <Screen>
      <Title>{ex.name}</Title>
      <Text style={s.meta}>
        {ex.equipment && ex.equipment !== 'body only' ? `Uses ${ex.equipment}` : 'No equipment'} · Works your {ex.primaryMuscles.join(', ')}
      </Text>
      {ex.images.length ? (
        <Pressable
          accessibilityRole="imagebutton"
          accessibilityLabel={`Photo ${frame + 1} of ${ex.images.length}, ${frame === 0 ? 'start' : 'end'} position. Tap for the next photo.`}
          onPress={() => setFrame((f) => (f + 1) % ex.images.length)}
        >
          <Image source={{ uri: ex.images[frame] }} resizeMode="contain" style={[s.card, { width: '100%', aspectRatio: 4 / 3 }]} />
          <Text style={[s.hint, { textAlign: 'center', marginTop: 6 }]}>{frame === 0 ? 'Start' : 'End'} position · tap to switch</Text>
        </Pressable>
      ) : null}
      <View style={[s.card, { padding: 16, gap: 14 }]}>
        {ex.instructions.map((step, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.accent, width: 20 }}>{i + 1}</Text>
            <Body style={{ flex: 1 }}>{step}</Body>
          </View>
        ))}
      </View>
      <Body style={s.hint}>If anything hurts, stop. You can tell Capy when you log the workout.</Body>
    </Screen>
  );
}
