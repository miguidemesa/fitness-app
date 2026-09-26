import { Link } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import type { PlanItem } from '@/utils/types';

/** One day's moves as a card of tappable rows; each opens the how-to screen. */
export function DayCard({ items }: { items: PlanItem[] }) {
  const { exercises } = useProfile();
  return (
    <View style={s.card}>
      {items.map((item, i) => {
        const ex = exercises[item.exerciseId];
        const name = ex?.name ?? item.exerciseId.replaceAll('_', ' ');
        return (
          <Link key={`${item.exerciseId}-${i}`} href={{ pathname: '/exercise/[id]', params: { id: item.exerciseId } }} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${item.sets} sets of ${item.reps}. Show how to do it.`}
              style={({ pressed }) => [
                { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 72 },
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.line },
                pressed && { backgroundColor: colors.accentSoft },
              ]}
            >
              {ex?.images[0] ? (
                <Image source={{ uri: ex.images[0] }} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: colors.ground }} />
              ) : (
                <View style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: colors.ground }} />
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>{name}</Text>
                <Text style={s.meta}>
                  {item.sets} sets × {item.reps} reps
                </Text>
              </View>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M9 5l7 7-7 7" />
              </Svg>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
