import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/utils/cn';

import { Text } from './text';

const badgeVariants = cva('self-start rounded-full px-2.5 py-1', {
  variants: {
    tone: {
      neutral: 'bg-muted',
      info: 'bg-info/15',
      success: 'bg-success/15',
      warning: 'bg-warning/15',
      danger: 'bg-destructive/15',
      outline: 'border border-foreground bg-card',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

const badgeTextVariants = cva('font-sans-semibold text-xs', {
  variants: {
    tone: {
      neutral: 'text-muted-foreground',
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-destructive',
      outline: 'font-sans-medium text-foreground',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export type StatusTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

/** A colored status pill. Each feature maps its own statuses to a label and tone. */
export function StatusBadge({ label, tone }: { label: string; tone?: StatusTone }) {
  const { t } = useTranslation();
  return (
    <View className={badgeVariants({ tone })} accessibilityLabel={t('common.status', { label })}>
      <Text className={cn(badgeTextVariants({ tone }))}>{label}</Text>
    </View>
  );
}
