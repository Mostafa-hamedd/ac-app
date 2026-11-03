import { useLocalSearchParams } from 'expo-router';

import { VerifyingFailedScreen } from '@/features/auth';

export default function VerifyingFailedRoute() {
  const { registrationId } = useLocalSearchParams<{ registrationId: string }>();
  return <VerifyingFailedScreen registrationId={registrationId} />;
}
