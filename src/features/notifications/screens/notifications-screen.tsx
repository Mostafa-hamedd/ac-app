import { router } from 'expo-router';
import { BellOff } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingState } from '@/shared/ui/loading-state';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { NotificationItem } from '../components/notification-item';
import { useNotifications } from '../hooks/use-notifications';

/** The Notifications tab: newest first, unread ones marked; opening one shows its details. */
export function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const query = useNotifications();
  // Local only for now: there is no endpoint to mark notifications as read.
  const [allRead, setAllRead] = useState(false);

  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    );
  }

  const notifications = query.data;
  const hasUnread = !allRead && notifications.some((n) => !n.read);

  return (
    <Screen edges={[]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerClassName="grow px-5 pt-4 pb-8"
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        ListHeaderComponent={
          notifications.length > 0 ? (
            <View
              className={cn(
                'h-7 justify-start border-b border-border',
                isArabic ? 'items-start' : 'items-end',
              )}>
              {hasUnread ? (
                <Pressable accessibilityRole="button" onPress={() => setAllRead(true)} hitSlop={8}>
                  <Text className="font-sans-semibold text-2xs text-muted-foreground">
                    {t('notifications.markAllRead')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : undefined
        }
        ItemSeparatorComponent={() => <View className="h-line bg-border" />}
        ListEmptyComponent={
          <EmptyState
            icon={BellOff}
            title={t('notifications.emptyTitle')}
            description={t('notifications.emptyDescription')}
          />
        }
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            unread={!allRead && !item.read}
            onPress={() =>
              router.push({
                pathname: '/notifications/[notificationId]',
                params: { notificationId: item.id },
              })
            }
          />
        )}
      />
    </Screen>
  );
}
