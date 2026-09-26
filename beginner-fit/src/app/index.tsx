import { Redirect } from 'expo-router';
import { useProfile } from '@/state/profile';

export default function Index() {
  const { ready, draft } = useProfile();
  if (!ready) return null;
  return <Redirect href={draft.disclaimerAcceptedAt ? '/today' : '/onboarding'} />;
}
