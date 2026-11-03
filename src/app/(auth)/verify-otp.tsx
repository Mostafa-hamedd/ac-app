import { useLocalSearchParams } from 'expo-router';

import { VerifyOtpScreen } from '@/features/auth';

export default function VerifyOtpRoute() {
  const { purpose, id, phone, country } = useLocalSearchParams<{
    purpose: 'register' | 'reset-password';
    id: string;
    phone: string;
    country?: string;
  }>();
  return <VerifyOtpScreen purpose={purpose} id={id} phone={phone} country={country} />;
}
