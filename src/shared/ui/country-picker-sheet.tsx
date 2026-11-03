import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Pressable, Text as RNText, View } from 'react-native';

import {
  formatDialCode,
  getCountryName,
  getFlagEmoji,
  searchCountries,
  type Country,
} from '@/lib/phone/phone-country';
import { colors } from '@/theme';

import { Text } from './text';

export type CountryPickerSheetProps = {
  ref?: React.Ref<BottomSheetModal>;
  selectedValue: string;
  onSelect: (country: Country) => void;
};

const SNAP_POINTS = ['85%'];

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
}

/** Searchable list of countries, showing each one's flag and dial code. */
export function CountryPickerSheet({ selectedValue, onSelect, ref }: CountryPickerSheetProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const countries = useMemo(() => searchCountries(query), [query]);
  const { dismiss } = useBottomSheetModal();
  const [isOpen, setIsOpen] = useState(false);

  // Android's Back button closes the list instead of leaving the screen behind it.
  useEffect(() => {
    if (!isOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [isOpen, dismiss]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      backdropComponent={Backdrop}
      keyboardBlurBehavior="restore"
      onChange={(index) => setIsOpen(index >= 0)}
      onDismiss={() => {
        setIsOpen(false);
        setQuery('');
      }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors['muted-foreground'] }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, paddingTop: 8 }}>
        <BottomSheetTextInput
          accessibilityLabel={t('fields.searchCountries')}
          placeholder={t('fields.searchCountryPlaceholder')}
          placeholderTextColor={colors['muted-foreground']}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          style={{
            height: 48,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            borderRadius: 15,
            paddingHorizontal: 16,
            fontSize: 14,
            color: colors.foreground,
            textAlign: i18n.language === 'ar' ? 'right' : 'left',
          }}
        />
      </View>
      <BottomSheetFlatList
        data={countries}
        keyExtractor={(country: Country) => country.code}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={15}
        ListEmptyComponent={
          <Text variant="muted" className="p-6 text-center">
            {t('fields.noCountries')}
          </Text>
        }
        renderItem={({ item }: { item: Country }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: item.code === selectedValue }}
            onPress={() => onSelect(item)}
            className="h-13 flex-row items-center gap-3 px-4 active:opacity-70">
            <RNText className="text-lg">{getFlagEmoji(item)}</RNText>
            <Text numberOfLines={1} className="flex-1">
              {getCountryName(item, i18n.language)}
            </Text>
            <Text className="font-sans text-sm">{formatDialCode(item)}</Text>
            {item.code === selectedValue ? <Check size={16} color={colors.foreground} /> : null}
          </Pressable>
        )}
      />
    </BottomSheetModal>
  );
}
