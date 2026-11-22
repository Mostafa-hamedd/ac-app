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
  // Latest code for key handlers — avoids stale closures when Backspace fires
  // in the same tick as an onChangeText clear.
  const valueRef = useRef(value);
  valueRef.current = value;
  // When onKeyPress already handled Backspace, ignore the follow-up onChangeText('').
  const skipNextEmptyChange = useRef(false);

  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  function focusIndex(index: number) {
    // Defer so focus survives the re-render from onChange (Android especially).
    setTimeout(() => {
      refs.current[index]?.focus();
    }, 0);
  }

  function emit(code: string) {
    const next = code.slice(0, length);
    valueRef.current = next;
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }

  /** Clear this cell and move focus to the previous input. */
  function deleteAt(index: number) {
    emit(valueRef.current.slice(0, index));
    if (index > 0) focusIndex(index - 1);
  }

  function handleChangeText(index: number, text: string) {
    const digitsOnly = text.replace(/\D/g, '');
    const previous = value[index] ?? '';

    // Typing over a filled cell reports old + new digit; keep only the new one.
    let newDigit = digitsOnly;
    if (previous && digitsOnly.length === 2) {
      newDigit = digitsOnly.startsWith(previous) ? digitsOnly.charAt(1) : digitsOnly.charAt(0);
    }
    const cleaned = newDigit;

    // Paste / SMS autofill / typing that yields more than one digit at once.
    if (cleaned.length > 1) {
      skipNextEmptyChange.current = false;
      const start = cleaned.length >= length ? 0 : index;
      const merged = (valueRef.current.slice(0, start) + cleaned).slice(0, length);
      emit(merged);
      focusIndex(Math.min(merged.length, length) - 1);
      return;
    }

    // Platform cleared this cell (Backspace). Move to the previous input.
    if (cleaned.length === 0) {
      if (skipNextEmptyChange.current) {
        skipNextEmptyChange.current = false;
        return;
      }
      deleteAt(index);
      return;
    }

    skipNextEmptyChange.current = false;
    // Single digit typed (or replacement via slice(-1) if platform prepends).
    const char = cleaned.slice(-1);
    // Overwriting a filled cell keeps the digits after it.
    const next = (
      valueRef.current.slice(0, index) +
      char +
      (previous ? valueRef.current.slice(index + 1) : '')
    ).slice(0, length);
    emit(next);
    if (next.length < length) {
      focusIndex(index + 1);
    } else {
      focusIndex(length - 1);
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key !== 'Backspace') return;

    const current = valueRef.current;

    // Filled cell: clear it and move to the previous input.
    if (current[index]) {
      skipNextEmptyChange.current = true;
      deleteAt(index);
      return;
    }

    // Empty cell: delete the previous digit and focus it.
    if (index > 0) {
      skipNextEmptyChange.current = true;
      deleteAt(index - 1);
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
          onChangeText={(text) => handleChangeText(index, text)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
          keyboardType="number-pad"
          // Allow multi-digit paste / autofill into a single box; we slice in handlers.
          maxLength={length}
          textContentType={index === 0 ? 'oneTimeCode' : 'none'}
          autoComplete={index === 0 ? 'sms-otp' : 'off'}
          blurOnSubmit={false}
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
