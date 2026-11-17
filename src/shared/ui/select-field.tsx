import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  View,
  type ViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
 * On Android + Fabric, `measureInWindow` omits the top inset while a
 * `statusBarTranslucent` Modal lays out from the screen origin — add the inset
 * back. iOS Modal coords already match measureInWindow, so do not offset there
 * (that left a large gap under the trigger).
 */
const isFabric = !!(globalThis as { nativeFabricUIManager?: unknown }).nativeFabricUIManager;

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
  const insets = useSafeAreaInsets();
  const triggerRef = useRef<ViewInstance>(null);
  const [open, setOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState<MenuLayout | null>(null);
  const row = i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row';
  const selected = options.find((option) => option.value === value);
  const Chevron = open ? ChevronUp : ChevronDown;
  const borderColor = error ? colors.destructive : colors.border;
  const yOffset =
    Platform.OS === 'android' && isFabric ? insets.top || StatusBar.currentHeight || 0 : 0;

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
    // Measure in the same tick as setOpen (before Modal mounts) so Android
    // still reports the trigger's window coords. Fall back to 0,0 when
    // measure is unavailable (tests).
    triggerRef.current?.measureInWindow?.((x, y, width, height) => {
      setMenuLayout({ x, y: y + height + yOffset, width });
    });
  }

  return (
    <View className={cn('gap-1.5', disabled && 'opacity-50', className)}>
      <View
        ref={triggerRef}
        collapsable={false}
        className={cn('rounded-lg border bg-card', open && 'rounded-b-none')}
        style={{ borderColor }}>
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
          {/*
            NativeWind classNames (bg-card / border) often do not paint inside Android
            Modals — set surface styles inline so the list stays opaque.
          */}
          <View
            className="overflow-hidden rounded-b-lg"
            style={{
              position: 'absolute',
              top: menuLayout?.y ?? 0,
              left: menuLayout?.x ?? 0,
              width: menuLayout?.width || undefined,
              right: menuLayout?.width ? undefined : 0,
              opacity: menuLayout ? 1 : 0,
              backgroundColor: colors.card,
              borderColor,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderTopWidth: 0,
            }}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              bounces={options.length > MAX_VISIBLE_OPTIONS}
              style={{
                maxHeight: OPTION_ROW_HEIGHT * MAX_VISIBLE_OPTIONS,
                backgroundColor: colors.card,
              }}>
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
                    style={{
                      minHeight: OPTION_ROW_HEIGHT,
                      backgroundColor: isSelected ? colors.muted : colors.card,
                    }}>
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
