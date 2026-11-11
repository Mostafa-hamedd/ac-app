import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { Text } from './text';

export type SelectOption = { value: string; label: string };

export type SelectFieldProps = {
  label: string;
  /** Adds a * to the label. */
  required?: boolean;
  /** Shown while nothing is selected. */
  placeholder: string;
  options: readonly SelectOption[];
  /** The selected option's value, or null. */
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
};

/**
 * A boxed field showing the label and the selected option. Pressing it opens the list of
 * options right below it; choosing one closes the list.
 */
export function SelectField({
  label,
  required = false,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  error,
  className,
}: SelectFieldProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const row = i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row';
  const selected = options.find((option) => option.value === value);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View className={cn('gap-1.5', disabled && 'opacity-50', className)}>
      <View
        className={cn(
          'overflow-hidden rounded-lg border bg-card',
          error ? 'border-destructive' : 'border-border',
        )}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}${required ? ' *' : ''}`}
          accessibilityValue={{ text: selected?.label ?? placeholder }}
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          onPress={() => setOpen((current) => !current)}
          className={cn(row, 'items-center justify-between gap-3 p-4 active:opacity-80')}>
          <View className="flex-1 gap-1">
            <Text variant="muted" className={i18n.language === 'ar' ? 'text-right' : undefined}>
              {label}
              {required ? ' *' : ''}
            </Text>
            <Text
              className={cn(
                'font-sans-medium text-sm',
                !selected && 'text-muted-foreground',
                i18n.language === 'ar' && 'text-right',
              )}
              numberOfLines={1}>
              {selected?.label ?? placeholder}
            </Text>
          </View>
          {disabled ? null : (
            <View className="size-9 items-center justify-center rounded-full border border-border">
              <Chevron size={16} color={colors.foreground} />
            </View>
          )}
        </Pressable>

        {open ? (
          <View className="border-t border-border">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    row,
                    'items-center justify-between gap-3 px-4 py-3 active:bg-muted',
                    isSelected && 'bg-muted',
                  )}>
                  <Text className="flex-1 font-sans-medium text-sm">{option.label}</Text>
                  {isSelected ? <Check size={16} color={colors.foreground} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}
