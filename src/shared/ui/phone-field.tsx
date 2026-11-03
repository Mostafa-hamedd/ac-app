import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, Text as RNText } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

import {
  formatDialCode,
  getCountry,
  getCountryName,
  getFlagEmoji,
  getMaxPhoneLength,
} from '@/lib/phone/phone-country';

import { CountryPickerSheet } from './country-picker-sheet';
import { FloatingLabelField, type FloatingLabelFieldProps } from './floating-label-field';

export type PhoneFieldProps = Omit<
  FloatingLabelFieldProps,
  'leading' | 'keyboardType' | 'maxLength' | 'label'
> & {
  label?: string;
  /** The selected country's two-letter code, e.g. 'EG'. */
  country: string;
  onCountryChange: (country: string) => void;
};

/** Mobile-number field with a country selector showing the flag and dial code. */
export function PhoneField({
  label,
  country,
  onCountryChange,
  onChangeText,
  ...props
}: PhoneFieldProps) {
  const { t, i18n } = useTranslation();
  const sheetRef = useRef<BottomSheetModal>(null);
  const selected = getCountry(country);
  const dialCode = formatDialCode(selected);
  const maxLength = getMaxPhoneLength(selected);

  return (
    <>
      <FloatingLabelField
        label={label ?? t('fields.mobileNumber')}
        onChangeText={(text) => onChangeText?.(text.replace(/\D/g, '').slice(0, maxLength))}
        keyboardType="number-pad"
        maxLength={maxLength}
        leading={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('fields.countryCode', {
              country: getCountryName(selected, i18n.language),
              code: dialCode,
            })}
            hitSlop={12}
            onPress={() => {
              Keyboard.dismiss();
              sheetRef.current?.present();
            }}
            className="flex-row items-center active:opacity-70">
            <RNText className="text-lg">{getFlagEmoji(selected)}</RNText>
            <RNText className="ml-2 font-sans text-sm text-foreground">{dialCode}</RNText>
            {/* Small caret that opens the country list. */}
            <Svg
              width={6.00148}
              height={3.9132}
              viewBox="0 0 6.00148 3.9132"
              style={{ marginLeft: 4 }}>
              <Path
                d="M3.27775 3.79968L5.88742 0.668076C5.99703 0.55847 6.03356 0.386231 5.97093 0.24009C5.91352 0.0939482 5.76737 0 5.61079 0H0.391451C0.23487 0 0.0887288 0.0939482 0.031316 0.24009C0.0104387 0.292283 0 0.339257 0 0.391451C0 0.495838 0.0417546 0.595005 0.114825 0.668076L2.7245 3.79968C2.87586 3.95104 3.12639 3.95104 3.27775 3.79968Z"
                fill={colors.foreground}
              />
            </Svg>
          </Pressable>
        }
        {...props}
      />
      <CountryPickerSheet
        ref={sheetRef}
        selectedValue={selected.code}
        onSelect={(next) => {
          onCountryChange(next.code);
          sheetRef.current?.dismiss();
        }}
      />
    </>
  );
}
