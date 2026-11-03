import { useLocalSearchParams } from 'expo-router';

import { VerifyingScreen } from '@/features/auth';

export default function VerifyingRoute() {
  const { registrationId } = useLocalSearchParams<{ registrationId: string }>();
  return <VerifyingScreen registrationId={registrationId} />;
}
