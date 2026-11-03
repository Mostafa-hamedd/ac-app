import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, CardTitle } from '@/shared/ui/card';
import { QueryView } from '@/shared/ui/query-view';
import { Screen } from '@/shared/ui/screen';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Text } from '@/shared/ui/text';
import { formatDate } from '@/shared/utils/format';

import { useRequest } from '../hooks/use-requests';
import { getRequestStatusDisplay } from '../utils/request-status';

export function RequestDetailScreen({ requestId }: { requestId: string }) {
  const { t } = useTranslation();
  const query = useRequest(requestId);

  return (
    <QueryView query={query}>
      {(request) => {
        const status = getRequestStatusDisplay(request.status);
        return (
          <Screen preset="scroll" contentClassName="gap-4">
            <Stack.Screen options={{ title: `#${request.reference}` }} />
            <View className="gap-2">
              <Text variant="h2">{request.title}</Text>
              <StatusBadge label={status.label} tone={status.tone} />
            </View>

            <Card>
              <CardTitle>{t('common.details')}</CardTitle>
              <Text>{request.vehicleLabel}</Text>
              <Text variant="muted">{request.dealershipName}</Text>
              {request.scheduledFor ? (
                <Text variant="muted">
                  {t('requests.scheduledFor', { date: formatDate(request.scheduledFor) })}
                </Text>
              ) : null}
              {request.description ? <Text>{request.description}</Text> : null}
            </Card>

            <Card>
              <CardTitle>{t('requests.history')}</CardTitle>
              {request.history.map((event, index) => (
                <View key={`${event.status}-${event.at}-${index}`} className="gap-0.5">
                  <Text variant="small">{getRequestStatusDisplay(event.status).label}</Text>
                  <Text variant="muted">{formatDate(event.at)}</Text>
                  {event.note ? <Text variant="muted">{event.note}</Text> : null}
                </View>
              ))}
            </Card>
          </Screen>
        );
      }}
    </QueryView>
  );
}
