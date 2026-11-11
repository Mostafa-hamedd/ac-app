import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { useTextAlign } from '@/shared/hooks/use-text-align';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import type { InputProps, InputSize } from '../props/input.props';
import { Text } from '../text';

import { InputMessage } from './input-message';

const OUTLINE_HEIGHT: Record<InputSize, string> = { md: 'h-14', sm: 'h-12' };
const BARE_HEIGHT: Record<InputSize, string> = { md: 'h-10', sm: 'h-6' };

/**
 * `outline` (bordered box, label above, real placeholder) and `bare` (just the text input,
 * to sit inside another container such as a search card).
 */
export function StaticInput({
  variant = 'outline',
  size = 'md',
  label,
  placeholder,
  helperText,
  error,
  disabled,
  leading,
  trailing,
  onFocus,
  onBlur,
  className,
  inputClassName,
  containerClassName,
  editable,
  style,
  ref,
  ...props
}: InputProps) {
  const { i18n } = useTranslation();
  const textAlign = useTextAlign();
  const [focused, setFocused] = useState(false);
  const isOutline = variant === 'outline';
  const isArabic = i18n.language === 'ar';
  // A text area grows with its lines instead of having a fixed height.
  const multiline = !!props.multiline;

  return (
    <View className={cn('gap-1.5', disabled && 'opacity-50', containerClassName)}>
      {isOutline && label ? (
        <Text className={cn('font-sans-medium text-sm', textAlign)}>{label}</Text>
      ) : null}
      <View
        className={cn(
          'flex-row',
          !multiline && 'items-center',
          isOutline && [
            'rounded-lg border px-4',
            multiline ? 'min-h-28 items-start py-3' : OUTLINE_HEIGHT[size],
            focused ? 'border-input/50' : 'border-input/20',
            error && 'border-destructive',
          ],
          !isOutline && 'gap-3',
        )}>
        {leading}
        <TextInput
          ref={ref}
          accessibilityLabel={label ?? placeholder}
          accessibilityHint={error}
          accessibilityState={{ disabled: !!disabled }}
          editable={disabled ? false : editable}
          placeholder={placeholder}
          placeholderTextColor={colors['muted-foreground']}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            'flex-1 font-sans text-sm text-foreground',
            multiline
              ? 'min-h-24 p-0'
              : isOutline
                ? OUTLINE_HEIGHT[size]
                : cn('p-0', BARE_HEIGHT[size]),
            inputClassName,
            className,
          )}
          style={[
            { textAlign: isArabic ? 'right' : 'left' },
            multiline && { textAlignVertical: 'top' as const },
            style,
          ]}
          {...props}
        />
        {trailing}
      </View>
      <InputMessage error={error} helperText={helperText} />
    </View>
  );
}
