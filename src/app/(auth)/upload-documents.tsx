import { useLocalSearchParams } from 'expo-router';

import { UploadDocumentsScreen } from '@/features/auth';

export default function UploadDocumentsRoute() {
  const { registrationId } = useLocalSearchParams<{ registrationId: string }>();
  return <UploadDocumentsScreen registrationId={registrationId} />;
}
