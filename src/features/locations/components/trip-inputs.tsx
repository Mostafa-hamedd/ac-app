import { Circle, MapPin, Navigation, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

export type Suggestion = { id: string; name: string; subtitle: string };

type TripInputsProps = {
  /** "My location" or "Selected point". */
  fromTitle: string;
  /** Resolved address of the starting point, or a status message while it is unknown. */
  fromAddress: string;
  isCustomOrigin: boolean;
  pickMode: boolean;
  onTogglePick: () => void;
  onUseMyLocation: () => void;
  query: string;
  onQueryChange: (text: string) => void;
  hasDestination: boolean;
  suggestions: Suggestion[];
  onSelectSuggestion: (id: string) => void;
  onClear: () => void;
};

const MAX_SUGGESTIONS = 5;

/** "From" (live GPS or a picked map point) and "To" (searchable maintenance centers). */
export function TripInputs({
  fromTitle,
  fromAddress,
  isCustomOrigin,
  pickMode,
  onTogglePick,
  onUseMyLocation,
  query,
  onQueryChange,
  hasDestination,
  suggestions,
  onSelectSuggestion,
  onClear,
}: TripInputsProps) {
  const { t, i18n } = useTranslation();
  const [focused, setFocused] = useState(false);
  const isArabic = i18n.language === 'ar';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';
  const align = isArabic ? 'text-right' : 'text-left';

  const showSuggestions = focused && !hasDestination;

  return (
    <View className="gap-2 rounded-2xl bg-white p-3">
      <View className={cn(row, 'items-center gap-3')}>
        <View className="w-4 items-center">
          <Circle size={14} color={colors.foreground} />
        </View>
        <View className="flex-1">
          <Text variant="muted" className={align}>
            {t('location.fromLabel')}
          </Text>
          <Text className={cn('font-sans-semibold text-sm', align)} numberOfLines={1}>
            {fromTitle}
          </Text>
          <Text variant="muted" className={align} numberOfLines={1}>
            {pickMode ? t('location.pickingHint') : fromAddress}
          </Text>
        </View>
        {isCustomOrigin ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('location.useMyLocation')}
            onPress={onUseMyLocation}
            hitSlop={8}
            className="size-9 items-center justify-center rounded-full bg-muted active:opacity-70">
            <Navigation size={16} color={colors.foreground} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: pickMode }}
          accessibilityLabel={t('location.pickOnMap')}
          onPress={onTogglePick}
          hitSlop={8}
          className={cn(
            'size-9 items-center justify-center rounded-full active:opacity-70',
            pickMode ? 'bg-primary' : 'bg-muted',
          )}>
          <MapPin size={16} color={pickMode ? colors['primary-foreground'] : colors.foreground} />
        </Pressable>
      </View>

      <View className="h-px bg-border" />

      <View className={cn(row, 'items-center gap-3')}>
        <View className="w-4 items-center">
          <Search size={14} color={colors.foreground} />
        </View>
        <View className="flex-1">
          <Text variant="muted" className={align}>
            {t('location.toLabel')}
          </Text>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('location.searchPlaceholder')}
            placeholderTextColor={colors['muted-foreground']}
            accessibilityLabel={t('location.toLabel')}
            returnKeyType="search"
            className={cn('h-6 p-0 font-sans-semibold text-sm text-foreground', align)}
            style={{ textAlign: isArabic ? 'right' : 'left', textAlignVertical: 'center' }}
          />
        </View>
        {query.length > 0 || hasDestination ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('location.clearDestination')}
            onPress={onClear}
            hitSlop={8}
            className="size-9 items-center justify-center rounded-full bg-muted active:opacity-70">
            <X size={16} color={colors.foreground} />
          </Pressable>
        ) : null}
      </View>

      {showSuggestions ? (
        <View className="gap-1">
          {suggestions.length === 0 ? (
            <Text variant="muted" className={cn('px-1 py-2', align)}>
              {t('location.noResults')}
            </Text>
          ) : (
            suggestions.slice(0, MAX_SUGGESTIONS).map((suggestion) => (
              <Pressable
                key={suggestion.id}
                accessibilityRole="button"
                onPress={() => onSelectSuggestion(suggestion.id)}
                className="rounded-lg bg-muted px-3 py-2 active:opacity-70">
                <Text className={cn('font-sans-medium text-sm', align)} numberOfLines={1}>
                  {suggestion.name}
                </Text>
                <Text variant="muted" className={align} numberOfLines={1}>
                  {suggestion.subtitle}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
