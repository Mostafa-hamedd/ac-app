import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View, type ViewInstance } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { Text } from './text';

/** Approx. height of one option row (`py-3` + `text-sm`). */
const OPTION_ROW_HEIGHT = 44;
const MAX_VISIBLE_OPTIONS = 5;

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

type MenuLayout = { x: number; y: number; width: number };

/**
 * A boxed field showing the label and the selected option. Pressing it opens the list of
 * options as an overlay anchored below the field; choosing one closes the list.
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
  const triggerRef = useRef<ViewInstance>(null);
  const [open, setOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState<MenuLayout | null>(null);
  const row = i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row';
  const selected = options.find((option) => option.value === value);
  const Chevron = open ? ChevronUp : ChevronDown;

  function close() {
    setOpen(false);
    setMenuLayout(null);
  }

  function toggle() {
    if (open) {
      close();
      return;
    }

    setOpen(true);
    // Place the menu in a Modal (outside the page ScrollView) so nested scroll
    // does not move the screen. Fall back to 0,0 when measure is unavailable (tests).
    triggerRef.current?.measureInWindow?.((x, y, width, height) => {
      setMenuLayout({ x, y: y + height, width });
    });
  }

  return (
    <View className={cn('gap-1.5', disabled && 'opacity-50', className)}>
      <View
        ref={triggerRef}
        collapsable={false}
        className={cn(
          'rounded-lg border bg-card',
          open && 'rounded-b-none',
          error ? 'border-destructive' : 'border-border',
        )}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}${required ? ' *' : ''}`}
          accessibilityValue={{ text: selected?.label ?? placeholder }}
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          onPress={toggle}
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
      </View>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}>
        <View className="flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={close}
            className="absolute inset-0"
          />
          <View
            className={cn(
              'absolute overflow-hidden rounded-b-lg border border-t-0 bg-card',
              error ? 'border-destructive' : 'border-border',
            )}
            style={{
              top: menuLayout?.y ?? 0,
              left: menuLayout?.x ?? 0,
              width: menuLayout?.width || undefined,
              right: menuLayout?.width ? undefined : 0,
              opacity: menuLayout ? 1 : 0,
              elevation: 8,
            }}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              bounces={options.length > MAX_VISIBLE_OPTIONS}
              style={{ maxHeight: OPTION_ROW_HEIGHT * MAX_VISIBLE_OPTIONS }}>
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
                      close();
                    }}
                    className={cn(
                      row,
                      'items-center justify-between gap-3 px-4 py-3 active:bg-muted',
                      isSelected && 'bg-muted',
                    )}
                    style={{ minHeight: OPTION_ROW_HEIGHT }}>
                    <Text className="flex-1 font-sans-medium text-sm">{option.label}</Text>
                    {isSelected ? <Check size={16} color={colors.foreground} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}
