import { CircleAlert, Star, TrendingUp, Users, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { NOTIFICATION_AVATARS } from '../data/avatars';
import type { AppNotification, NotificationCategory } from '../types/notification.types';
import { formatShortTime } from '../utils/relative-time';

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  request: TrendingUp,
  payment: Star,
  vehicle: CircleAlert,
  system: Users,
};

type NotificationItemProps = {
  notification: AppNotification;
  onPress: () => void;
};

/** One white card of the notifications list: round icon, message, how long ago, and "Pay now" for payments. */
export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';
  const avatar = notification.avatarKey ? NOTIFICATION_AVATARS[notification.avatarKey] : undefined;
  const Icon = CATEGORY_ICON[notification.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      onPress={onPress}
      className={cn(row, 'items-start gap-3 rounded-lg bg-card p-4 active:opacity-70')}>
      {avatar ? (
        <Image
          accessibilityIgnoresInvertColors
          source={avatar}
          className="size-10 rounded-full bg-muted"
        />
      ) : (
        <View className="size-10 items-center justify-center rounded-full bg-muted">
          <Icon size={18} color={colors.foreground} />
        </View>
      )}

      <View className="flex-1 gap-3">
        <Text className={cn(isArabic && 'text-right')}>{notification.body}</Text>
        <View className={cn(row, 'items-center justify-between py-1')}>
          <Text className="text-xs text-muted-foreground">
            {formatShortTime(notification.createdAt, t)}
          </Text>
          {notification.category === 'payment' ? (
            <Text className="font-sans-medium text-compact underline">
              {t('notifications.payNow')}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
