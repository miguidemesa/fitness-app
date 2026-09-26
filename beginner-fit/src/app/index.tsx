import { Redirect } from 'expo-router';
import { useProfile } from '@/state/profile';

export default function Index() {
  const { draft } = useProfile();
  return <Redirect href={draft.disclaimerAcceptedAt ? '/today' : '/onboarding'} />;
}
