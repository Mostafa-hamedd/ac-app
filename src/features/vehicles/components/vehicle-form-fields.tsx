import { Camera, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { FUEL_TYPES, type FuelType } from '../types/vehicle.types';

/** A label above a field, as in the Add Vehicle design. */
export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  return (
    <View className="gap-2">
      <Text className={cn('font-sans-semibold text-compact', isArabic && 'text-right')}>
        {label}
      </Text>
      {children}
      {error ? (
        <Text className={cn('text-xs text-destructive', isArabic && 'text-right')}>{error}</Text>
      ) : null}
    </View>
  );
}

/** The white rounded box that holds a field's value. */
export const FIELD_BOX = 'rounded-md border border-border bg-card px-4 py-3.5';

const LIST_MAX_HEIGHT = 220;

type DropdownFieldProps = {
  label: string;
  placeholder: string;
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
};

/** Tap to open a list of options right under the field; picking one closes it. */
export function DropdownField({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: DropdownFieldProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <FormField label={label}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value ?? placeholder }}
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        disabled={disabled}
        onPress={() => setOpen((was) => !was)}
        className={cn(
          FIELD_BOX,
          'items-center justify-between gap-3 active:opacity-80',
          isArabic ? 'flex-row-reverse' : 'flex-row',
          disabled && 'opacity-50',
        )}>
        <Text
          numberOfLines={1}
          className={cn('flex-1 text-sm', !value && 'text-placeholder', isArabic && 'text-right')}>
          {value ?? placeholder}
        </Text>
        <Chevron size={16} color={colors.foreground} />
      </Pressable>
      {open ? (
        <View className="overflow-hidden rounded-md border border-border bg-card">
          <ScrollView nestedScrollEnabled style={{ maxHeight: LIST_MAX_HEIGHT }}>
            {options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: option === value }}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={cn('px-4 py-3 active:bg-muted', option === value && 'bg-muted')}>
                <Text
                  className={cn(
                    'text-sm',
                    option === value && 'font-sans-semibold',
                    isArabic && 'text-right',
                  )}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </FormField>
  );
}

/** Petrol / Diesel / Electric / Hybrid as one segmented control. */
export function FuelTypeSegment({
  value,
  onChange,
}: {
  value: FuelType | null;
  onChange: (value: FuelType) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <View
      accessibilityRole="radiogroup"
      className={cn(
        'gap-1 rounded-md border border-border bg-card p-1',
        i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row',
      )}>
      {FUEL_TYPES.map((fuel) => {
        const selected = fuel === value;
        return (
          <Pressable
            key={fuel}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(fuel)}
            className={cn(
              'flex-1 items-center rounded-sm px-2 py-2.5',
              selected ? 'bg-primary' : 'active:bg-muted',
            )}>
            <Text
              className={cn(
                'font-sans-semibold text-xs',
                selected ? 'text-primary-foreground' : 'text-placeholder',
              )}>
              {t(`vehicles.add.fuel.${fuel}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Dashed box to add the vehicle's photo; shows the chosen photo once there is one. */
export function PhotoBox({ uri, onPress }: { uri: string | null; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('vehicles.add.photoPrompt')}
      onPress={onPress}
      className="h-36 items-center justify-center overflow-hidden rounded-lg border border-dashed border-placeholder bg-card active:opacity-80">
      {uri ? (
        <Image source={{ uri }} resizeMode="cover" className="size-full" />
      ) : (
        <View className="items-center gap-3">
          <Camera size={24} color={colors.placeholder} />
          <Text className="font-sans-semibold text-compact text-placeholder">
            {t('vehicles.add.photoPrompt')}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
