import { cva } from 'class-variance-authority';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import type {
  ButtonIcon,
  ButtonProps,
  ButtonShape,
  ButtonSize,
  ButtonVariant,
} from '../props/button.props';
import { Text, TextClassContext } from '../text';

// `satisfies Record<…>` keeps these maps in step with the prop unions in props/button.props.ts.
const variantClasses = {
  default: 'bg-primary',
  secondary: 'bg-muted-foreground',
  outline: 'border border-input bg-card',
  ghost: 'bg-transparent',
  light: 'bg-card',
} satisfies Record<ButtonVariant, string>;

const sizeClasses = {
  sm: 'h-10 px-4',
  md: 'h-13 px-4',
  icon: 'size-9',
  auto: '',
} satisfies Record<ButtonSize, string>;

const shapeClasses = {
  rounded: 'rounded-lg',
  pill: 'rounded-full',
} satisfies Record<ButtonShape, string>;

const textVariantClasses = {
  default: 'text-primary-foreground',
  secondary: 'text-primary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  light: 'text-foreground',
} satisfies Record<ButtonVariant, string>;

/** Icon / spinner colour per variant, matching its label. */
const contentColor = {
  default: colors['primary-foreground'],
  secondary: colors['primary-foreground'],
  outline: colors.foreground,
  ghost: colors.foreground,
  light: colors.foreground,
} satisfies Record<ButtonVariant, string>;

const ICON_SIZE = 16;

const buttonVariants = cva('flex-row items-center justify-center gap-2 active:opacity-80', {
  variants: { variant: variantClasses, size: sizeClasses, shape: shapeClasses },
  defaultVariants: { variant: 'default', size: 'md', shape: 'rounded' },
});

const buttonTextVariants = cva('font-sans-medium text-sm', {
  variants: { variant: textVariantClasses },
  defaultVariants: { variant: 'default' },
});

function renderIcon(icon: ButtonIcon | undefined, color: string) {
  return typeof icon === 'function' ? icon({ color, size: ICON_SIZE }) : icon;
}

/**
 * The app's button. All props of `Pressable` are passed through, so `onPress`, `disabled`,
 * `accessibilityLabel`, `testID` etc. work as usual.
 */
export function Button({
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  label,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  textClassName,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const color = contentColor[variant];
  const content = children ?? label;
  const text =
    typeof content === 'string' || typeof content === 'number' ? (
      <Text className={textClassName}>{content}</Text>
    ) : (
      content
    );

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled, busy: loading }}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size, shape }),
          isDisabled && 'opacity-50',
          className,
        )}
        {...props}>
        {loading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color={color} />
            {text}
          </View>
        ) : (
          <>
            {renderIcon(leftIcon, color)}
            {text}
            {renderIcon(rightIcon, color)}
          </>
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}
