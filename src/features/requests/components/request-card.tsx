import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card } from '@/shared/ui/card';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Text } from '@/shared/ui/text';
import { formatDate } from '@/shared/utils/format';

import type { ServiceRequestSummary } from '../types/request.types';
import { getRequestStatusDisplay } from '../utils/request-status';

export function RequestCard({ request }: { request: ServiceRequestSummary }) {
  const { t } = useTranslation();
  const status = getRequestStatusDisplay(request.status);
  return (
    <Link href={{ pathname: '/requests/[requestId]', params: { requestId: request.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${request.title}, ${status.label}`}
        className="active:opacity-80">
        <Card>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text variant="large" numberOfLines={1}>
                {request.title}
              </Text>
              <Text variant="muted" numberOfLines={1}>
                {request.vehicleLabel} · #{request.reference}
              </Text>
            </View>
            <StatusBadge label={status.label} tone={status.tone} />
          </View>
          <Text variant="muted">
            {t('requests.updated', { date: formatDate(request.updatedAt) })}
          </Text>
        </Card>
      </Pressable>
    </Link>
  );
}
