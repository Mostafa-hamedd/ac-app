import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, type TextInputInstance, View } from 'react-native';

import { cn } from '@/shared/utils/cn';

export type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  error?: boolean;
};

/**
 * N auto-advancing single-digit boxes (76x76 at most — boxes shrink
 * responsively below that on narrow screens so this still fits an iPhone
 * Fold's outer display).
 */
export function OtpInput({ length = 4, value, onChange, onComplete, error }: OtpInputProps) {
  const { t } = useTranslation();
  const refs = useRef<(TextInputInstance | null)[]>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    const joined = next.join('');
    onChange(joined);
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (joined.length === length && !joined.includes('')) {
      onComplete?.(joined);
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <View className="flex-row justify-between gap-2">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            refs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => setDigit(index, text.replace(/\D/g, '').slice(-1))}
          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={1}
          accessibilityLabel={t('fields.otpDigit', { index: index + 1, length })}
          className={cn(
            'aspect-square max-w-20 flex-1 rounded-full border bg-transparent p-0 text-center font-sans text-sm text-foreground',
            digit ? 'border-input/50' : 'border-input/20',
            error && 'border-destructive',
          )}
        />
      ))}
    </View>
  );
}
