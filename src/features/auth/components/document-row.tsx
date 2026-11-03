import { Check, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

import type { KycDocument } from '../types/auth.types';

export type DocumentRowProps = {
  label: string;
  document?: KycDocument;
  uploading?: boolean;
  onPress: () => void;
};

/** One of the 4 KYC document rows (National ID, Driver's License, Car Registration front/back). */
export function DocumentRow({ label, document, uploading = false, onPress }: DocumentRowProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(document ? 'uploadDocuments.rowUploaded' : 'uploadDocuments.rowEmpty', {
        label,
      })}
      accessibilityState={{ busy: uploading, disabled: uploading }}
      disabled={uploading}
      onPress={onPress}
      className="h-16 flex-row items-center justify-between rounded-lg border border-input bg-card px-4 active:opacity-80">
      <View className="flex-1 flex-row items-center gap-2.5">
        {document ? <Check size={16} color={colors.foreground} /> : null}
        <Text className="flex-1 font-sans-medium text-xs text-foreground" numberOfLines={1}>
          {label}
        </Text>
      </View>
      {uploading ? (
        <ActivityIndicator color={colors.foreground} />
      ) : document ? (
        <View className="flex-row items-center gap-1 rounded-full border border-input px-2.5 py-1.5">
          <Text className="font-sans-medium text-2xs text-foreground">
            {t('uploadDocuments.replace')}
          </Text>
        </View>
      ) : (
        <View className="h-9 w-9 items-center justify-center rounded-full border border-input">
          <Plus size={14} color={colors.foreground} />
        </View>
      )}
    </Pressable>
  );
}
