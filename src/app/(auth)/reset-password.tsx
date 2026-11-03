import { useLocalSearchParams } from 'expo-router';

import { ResetPasswordScreen } from '@/features/auth';

export default function ResetPasswordRoute() {
  const { resetToken } = useLocalSearchParams<{ resetToken?: string }>();
  return (
    <ResetPasswordScreen resetToken={typeof resetToken === 'string' ? resetToken : undefined} />
  );
}
