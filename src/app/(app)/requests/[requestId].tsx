import { useLocalSearchParams } from 'expo-router';

import { RequestDetailScreen } from '@/features/requests';

export default function RequestDetailRoute() {
  // Route params are untrusted input: the API encodes them and the backend authorizes access.
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  return <RequestDetailScreen requestId={requestId} />;
}
