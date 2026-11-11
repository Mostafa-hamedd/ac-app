import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui';
import type { ButtonVariant } from '@/shared/ui';
import { Card } from '@/shared/ui/card';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

type ServiceCardProps = {
  title: string;
  /** Second line under the title (the service center, or the completion date). */
  subtitle: string;
  /** Status shown in the outlined pill at the top end. */
  statusLabel: string;
  /** Text at the bottom start (the appointment, or the amount paid). */
  footer: string;
  actionLabel: string;
  /** `default` is the filled black button, `outline` the white bordered one. */
  actionVariant?: Extract<ButtonVariant, 'default' | 'outline'>;
  onAction?: () => void;
};

/** One service in the All Services list: what it is, its status, and an action button. */
export function ServiceCard({
  title,
  subtitle,
  statusLabel,
  footer,
  actionLabel,
  actionVariant = 'default',
  onAction,
}: ServiceCardProps) {
  const { i18n } = useTranslation();
  const row = i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row';

  return (
    <Card className="gap-4">
      <View className={cn(row, 'items-start justify-between gap-3')}>
        <View className="flex-1 gap-1.5">
          <Text className="font-sans-medium text-xs">{title}</Text>
          <Text className="font-sans-medium text-xs">{subtitle}</Text>
        </View>
        <StatusBadge tone="outline" label={statusLabel} />
      </View>
      <View className={cn(row, 'items-center justify-between gap-3')}>
        <Text className="flex-1 font-sans-medium text-xs">{footer}</Text>
        <Button
          size="auto"
          variant={actionVariant}
          className="px-4 py-2"
          textClassName="text-xs"
          label={actionLabel}
          onPress={onAction}
        />
      </View>
    </Card>
  );
}
