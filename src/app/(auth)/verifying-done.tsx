import { useLocalSearchParams } from 'expo-router';

import { VerifyingDoneScreen } from '@/features/auth';

export default function VerifyingDoneRoute() {
  const { registrationId } = useLocalSearchParams<{ registrationId: string }>();
  return <VerifyingDoneScreen registrationId={registrationId} />;
}
