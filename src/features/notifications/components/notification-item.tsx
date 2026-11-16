import { CircleAlert, Star, TrendingUp, Users, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import type { AppNotification, NotificationCategory } from '../types/notification.types';
import { formatRelativeTime } from '../utils/relative-time';

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  request: TrendingUp,
  payment: Star,
  vehicle: CircleAlert,
  system: Users,
};

type NotificationItemProps = {
  notification: AppNotification;
  /** Unread notifications show a dot; the list clears it when everything is marked as read. */
  unread: boolean;
  onPress: () => void;
};

/** One row of the notifications list: icon tile, title, message, how long ago, and an unread dot. */
export function NotificationItem({ notification, unread, onPress }: NotificationItemProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';
  const align = isArabic ? 'items-end' : 'items-start';
  const Icon = CATEGORY_ICON[notification.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      onPress={onPress}
      className={cn(row, 'items-start gap-3 py-3.5 active:opacity-70')}>
      <View className="size-9 items-center justify-center rounded-md bg-muted/60">
        <Icon size={18} color={colors.foreground} />
      </View>

      <View className={cn('flex-1', align)}>
        <View className={cn(row, 'w-full items-start justify-between gap-2')}>
          <Text className="flex-1 font-sans-semibold text-xs">{notification.title}</Text>
          {unread ? (
            <View testID="unread-dot" className="mt-1 size-2 rounded-full bg-info" />
          ) : null}
        </View>
        <Text variant="muted" className={cn('mt-0.5 text-xs', isArabic && 'text-right')}>
          {notification.body}
        </Text>
        <Text className="mt-1 text-2xs text-placeholder">
          {formatRelativeTime(notification.createdAt, t)}
        </Text>
      </View>
    </Pressable>
  );
}
