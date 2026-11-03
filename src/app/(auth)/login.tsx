import { useLocalSearchParams } from 'expo-router';

import { LoginScreen } from '@/features/auth';

export default function LoginRoute() {
  const { phone, country } = useLocalSearchParams<{ phone?: string; country?: string }>();
  return (
    <LoginScreen
      initialPhone={typeof phone === 'string' ? phone : undefined}
      initialCountry={typeof country === 'string' ? country : undefined}
    />
  );
}
