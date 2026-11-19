import { router } from 'expo-router';
import { Text } from 'react-native';
import { Enter } from '@/components/motion';
import { Badge, SessionRow, dayInfo, groupSessions, pastSession } from '@/components/session';
import { CoachLine, Group, Screen, Tag, Title } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { useWorkout } from '@/state/workout';
import { space, type } from '@/theme';
import { AREA_LABEL } from '@/utils/types';
import { nextDay } from '@/utils/progress';

/** This week's sessions, then every past workout. */
export default function Plan() {
  const { draft, plan, logs, exercises } = useProfile();
  const { history } = useWorkout();
  const done = new Set(logs.filter((l) => l.planId === plan?.id).map((l) => l.day));
  const next = plan ? nextDay(plan.days.length, plan.id, logs) : null;
  const past = groupSessions(logs).map((moves) => pastSession(moves, exercises, history.seconds[`${moves[0].planId}:${moves[0].day}`]));

  return (
    <Screen tab>
      <Enter index={0} style={{ gap: 2, marginTop: space.s }}>
        <Tag>
          Week {plan?.week ?? 1} · {plan?.days.length ?? draft.daysPerWeek} sessions
        </Tag>
        <Title>This week</Title>
      </Enter>

      {plan ? (
        <Enter index={1}>
          <Group>
            {plan.days.map((items, d) => {
              const info = dayInfo(items, exercises);
              return (
                <SessionRow
                  key={d}
                  photo={info.photo}
                  title={`${d + 1}. ${info.title}`}
                  caption={`${items.length} moves · ~${draft.minutesPerSession} min`}
                  badge={done.has(d) ? <Badge label="Done" tone="ink" /> : d === next ? <Badge label="Up next" /> : null}
                  onPress={() => router.push({ pathname: '/session/[day]', params: { day: String(d) } })}
                />
              );
            })}
          </Group>
        </Enter>
      ) : (
        <CoachLine>Your {draft.daysPerWeek} workout days will be listed here once your plan is ready.</CoachLine>
      )}

      {past.length ? (
        <Enter index={2} style={{ gap: space.m, marginTop: space.l }}>
          <Tag>Past sessions</Tag>
          <Group>
            {past.map((s) => (
              <SessionRow
                  key={s.key}
                  photo={s.photo}
                  title={s.title}
                  caption={[s.date, s.minutes ? `${s.minutes} min` : null, `${s.done} of ${s.total} moves`, s.feel ? `felt ${s.feel}` : 'skipped', s.pain.length ? `pain: ${s.pain.map((a) => AREA_LABEL[a].toLowerCase()).join(', ')}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                  badge={s.pain.length ? <Badge tone="pain" label="Pain" /> : null}
                />
            ))}
          </Group>
        </Enter>
      ) : plan ? (
        <Text style={type.caption}>Finished workouts show up here, with how each one felt.</Text>
      ) : null}
    </Screen>
  );
}
