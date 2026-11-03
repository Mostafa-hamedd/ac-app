import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { parseAppLink } from '@/lib/linking/linking-config';
import { Button } from '@/shared/ui/button';
import { Card, CardTitle } from '@/shared/ui/card';
import { QueryView } from '@/shared/ui/query-view';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { formatDate } from '@/shared/utils/format';

import { useNotification } from '../hooks/use-notifications';

export function NotificationDetailScreen({ notificationId }: { notificationId: string }) {
  const { t } = useTranslation();
  const query = useNotification(notificationId);

  return (
    <QueryView query={query}>
      {(notification) => {
        const related = parseAppLink(notification.relatedHref);
        return (
          <Screen preset="scroll" contentClassName="gap-4">
            <View className="gap-2">
              <Text variant="h2">{notification.title}</Text>
              <Text variant="muted">{formatDate(notification.createdAt)}</Text>
            </View>

            <Card>
              <CardTitle>{t('common.details')}</CardTitle>
              <Text>{notification.body}</Text>
            </Card>

            {related ? (
              <Link href={related.href} asChild>
                <Button variant="outline">{t('common.viewDetails')}</Button>
              </Link>
            ) : null}
          </Screen>
        );
      }}
    </QueryView>
  );
}
