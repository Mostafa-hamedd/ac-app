import { useEffect, useId, useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import type { InputProps, InputSize } from '../props/input.props';

import { InputMessage } from './input-message';

// Sizes in dp. They're explicit because NativeWind's native `rem` is 14, not 16.
const BOX_HEIGHT: Record<InputSize, number> = { md: 56, sm: 48 };
const BOX_CLASS: Record<InputSize, string> = { md: 'h-14', sm: 'h-12' };
/** Input text starts this far from the box's outer edge. */
const TEXT_INSET = 24;
/** Between `leading` and the input (+20's caret to the number). */
const LEADING_GAP = 20;
/** The floated label's notch starts this far from the box's outer edge. */
const NOTCH_LEFT = 27;
/** The label's `px-2.5`, which is also the notch's padding either side of the text. */
const LABEL_PADDING = 10;
/** Fixed so the label centers identically under each platform's font metrics. */
const LABEL_LINE_HEIGHT = 20;
/** Centers the floated label on the 1dp top border. */
const FLOATED_LABEL_TOP = 0.5 - LABEL_LINE_HEIGHT / 2;

/**
 * The app's text field: a bordered box whose label sits inside like a placeholder
 * when empty, and floats up into a notch in the top border once focused or filled.
 */
export function FloatingInput({
  size = 'md',
  label,
  placeholder,
  helperText,
  error,
  disabled,
  leading,
  trailing,
  value,
  onFocus,
  onBlur,
  className,
  inputClassName,
  containerClassName,
  editable,
  ref,
  ...props
}: Omit<InputProps, 'variant'>) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floated = focused || !!value;
  const progress = useSharedValue(floated ? 1 : 0);
  const [leadingWidth, setLeadingWidth] = useState(0);
  const labelText = label ?? placeholder ?? '';
  const restingLabelTop = (BOX_HEIGHT[size] - LABEL_LINE_HEIGHT) / 2;
  // At rest the label's text sits where typed text will start, past any `leading`.
  const restingLeft = TEXT_INSET - LABEL_PADDING + (leading ? leadingWidth + LEADING_GAP : 0);

  useEffect(() => {
    progress.value = withTiming(floated ? 1 : 0, { duration: 150 });
  }, [floated, progress]);

  const labelStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [restingLabelTop, FLOATED_LABEL_TOP]),
    lineHeight: LABEL_LINE_HEIGHT,
    left: interpolate(progress.value, [0, 1], [restingLeft, NOTCH_LEFT]),
    fontSize: interpolate(progress.value, [0, 1], [14, 12]),
  }));

  return (
    <View className={cn('gap-1.5', disabled && 'opacity-50', containerClassName)}>
      <View className="relative">
        <View
          className={cn(
            'flex-row items-center rounded-lg border pl-6 pr-4',
            BOX_CLASS[size],
            floated ? 'border-input/50' : 'border-input/20',
            error && 'border-destructive',
          )}>
          {leading ? (
            <View
              className="mr-5"
              onLayout={(event) => setLeadingWidth(event.nativeEvent.layout.width)}>
              {leading}
            </View>
          ) : null}
          <TextInput
            ref={ref}
            accessibilityLabel={labelText}
            accessibilityLabelledBy={id}
            accessibilityHint={error}
            accessibilityState={{ disabled: !!disabled }}
            editable={disabled ? false : editable}
            value={value}
            // While the label is resting in the box it doubles as the placeholder.
            placeholder={floated ? placeholder : undefined}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            placeholderTextColor={colors['muted-foreground']}
            className={cn(
              'flex-1 font-sans text-sm text-foreground',
              BOX_CLASS[size],
              inputClassName,
              className,
            )}
            {...props}
          />
          {trailing}
        </View>
        <Animated.Text
          nativeID={id}
          numberOfLines={1}
          pointerEvents="none"
          style={labelStyle}
          className={cn(
            'absolute px-2.5',
            floated
              ? 'bg-background font-sans-medium text-placeholder'
              : 'bg-transparent font-sans text-foreground/60',
          )}>
          {labelText}
        </Animated.Text>
      </View>
      <InputMessage error={error} helperText={helperText} />
    </View>
  );
}
