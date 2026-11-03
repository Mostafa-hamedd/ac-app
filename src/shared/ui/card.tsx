import { View, type ViewProps } from 'react-native';

import { cn } from '@/shared/utils/cn';

import { Text, type TextProps } from './text';

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('gap-3 rounded-lg border border-border bg-card p-4', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: TextProps) {
  return <Text variant="large" className={cn('text-card-foreground', className)} {...props} />;
}
