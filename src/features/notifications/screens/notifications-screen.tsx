import { router } from 'expo-router';
import { BellOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, View } from 'react-native';

import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingState } from '@/shared/ui/loading-state';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { NotificationItem } from '../components/notification-item';
import { useNotifications } from '../hooks/use-notifications';
import type { AppNotification } from '../types/notification.types';

type Section = { key: 'new' | 'older'; data: AppNotification[] };

/** The Notifications tab: unread ones under "New", the rest under "Older"; opening one shows its details. */
export function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const query = useNotifications();
  // Local only for now: there is no endpoint to mark notifications as read.
  const [allRead, setAllRead] = useState(false);
  const notifications = query.data;

  const sections = useMemo<Section[]>(() => {
    const list = notifications ?? [];
    const isNew = (n: AppNotification) => !allRead && !n.read;
    return [
      { key: 'new' as const, data: list.filter(isNew) },
      { key: 'older' as const, data: list.filter((n) => !isNew(n)) },
    ].filter((section) => section.data.length > 0);
  }, [notifications, allRead]);

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

  return (
    <Screen edges={[]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerClassName="grow px-6 pt-4 pb-8"
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        SectionSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <EmptyState
            icon={BellOff}
            title={t('notifications.emptyTitle')}
            description={t('notifications.emptyDescription')}
          />
        }
        renderSectionHeader={({ section }) => (
          <View
            className={cn(
              'items-center justify-between',
              isArabic ? 'flex-row-reverse' : 'flex-row',
            )}>
            <View>
              <Text className="font-sans-medium">
                {section.key === 'new'
                  ? t('notifications.sectionNew')
                  : t('notifications.sectionOlder')}
              </Text>
            </View>
            {section.key === 'new' ? (
              <Pressable accessibilityRole="button" onPress={() => setAllRead(true)} hitSlop={8}>
                <Text className="font-sans-medium text-xs text-muted-foreground">
                  {t('notifications.markAllRead')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
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
