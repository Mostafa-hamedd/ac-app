import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { parseAppLink } from '@/lib/linking/linking-config';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { formatDate } from '@/shared/utils/format';

import type { AppNotification } from '../types/notification.types';

export function NotificationCard({ notification }: { notification: AppNotification }) {
  const content = (
    <Card>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="large" numberOfLines={1}>
            {notification.title}
          </Text>
          <Text variant="muted" numberOfLines={2}>
            {notification.body}
          </Text>
        </View>
        {notification.read ? null : <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" />}
      </View>
      <Text variant="muted">{formatDate(notification.createdAt)}</Text>
    </Card>
  );

  const related = parseAppLink(notification.relatedHref);
  if (!related) return content;

  return (
    <Link href={related.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={notification.title}
        className="active:opacity-80">
        {content}
      </Pressable>
    </Link>
  );
}
