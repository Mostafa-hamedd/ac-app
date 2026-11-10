import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { Text } from './text';

export type OptionRowProps = Omit<PressableProps, 'children'> & {
  label: string;
  icon: LucideIcon;
  /** Red label and icon, for destructive actions such as removing something. */
  destructive?: boolean;
  className?: string;
};

/** A tappable row with a leading icon and a label, used in option lists. */
export function OptionRow({
  label,
  icon: Icon,
  destructive = false,
  disabled,
  className,
  ...props
}: OptionRowProps) {
  const { i18n } = useTranslation();
  const row = i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row';
  const color = destructive ? colors.destructive : colors.foreground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        row,
        'items-center gap-4 rounded-lg border border-border bg-card px-4 py-4 active:opacity-80',
        disabled && 'opacity-50',
        className,
      )}
      {...props}>
      <Icon size={20} color={color} />
      <Text className={cn('font-sans-medium text-sm', destructive && 'text-destructive')}>
        {label}
      </Text>
    </Pressable>
  );
}
