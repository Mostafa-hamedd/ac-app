import { cva, type VariantProps } from 'class-variance-authority';
import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';

import { cn } from '@/shared/utils/cn';

import { Text, TextClassContext } from './text';

const buttonVariants = cva(
  'h-13 flex-row items-center justify-center gap-2 rounded-lg px-4 active:opacity-80',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-muted-foreground',
        outline: 'border border-input bg-card',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const buttonTextVariants = cva('font-sans-medium text-sm', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-primary-foreground',
      outline: 'text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    /** Shows a spinner and blocks presses (prevents duplicate submissions). */
    loading?: boolean;
    children?: React.ReactNode;
  };

export function Button({
  className,
  variant,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const label = typeof children === 'string' ? <Text>{children}</Text> : children;
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled, busy: loading }}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant }), isDisabled && 'opacity-50', className)}
        {...props}>
        {loading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="white" />
            {label}
          </View>
        ) : (
          label
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}
