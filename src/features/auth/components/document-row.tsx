import { CircleCheck, Pencil, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import type { KycDocument } from '../types/auth.types';

/** From the Last-Step design: row 338x66, 36x36 action 15 from the end edge. */
const ROW_HEIGHT = 66;
const ROW_END_INSET = 15;
const ACTION_SIZE = 36;
/** The Replace chip on an uploaded row: 29 high, corner radius 7. */
const REPLACE_HEIGHT = 29;
const REPLACE_RADIUS = 7;

export type DocumentRowProps = {
  label: string;
  document?: KycDocument;
  uploading?: boolean;
  onPress: () => void;
};

/** One of the 4 KYC document rows (National ID, Driver's License, Car Registration front/back). */
export function DocumentRow({ label, document, uploading = false, onPress }: DocumentRowProps) {
  const { t } = useTranslation();
  // The labels carry a trailing "*" for required; show it in the error colour.
  const required = label.trimEnd().endsWith('*');
  const title = required ? label.trimEnd().slice(0, -1).trimEnd() : label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(document ? 'uploadDocuments.rowUploaded' : 'uploadDocuments.rowEmpty', {
        label,
      })}
      accessibilityState={{ busy: uploading, disabled: uploading }}
      disabled={uploading}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-between rounded-lg bg-transparent pl-6 active:opacity-80',
        // Uploaded rows get a faint solid border; empty ones a dashed one.
        document ? 'border-solid border-input/10' : 'border-dashed border-input/20',
      )}
      style={{ height: ROW_HEIGHT, borderWidth: 1, paddingRight: ROW_END_INSET }}>
      <View className="flex-1 flex-row items-center gap-2.5">
        {document ? <CircleCheck size={16} color={colors.foreground} /> : null}
        <Text className="flex-1 font-sans-medium text-xs " numberOfLines={1}>
          {title}
          {required ? <Text className="text-destructive"> *</Text> : null}
        </Text>
      </View>
      {uploading ? (
        <ActivityIndicator color={colors.foreground} />
      ) : document ? (
        <View
          className="flex-row items-center justify-center gap-1.5 border border-input/20 px-2.5"
          style={{ height: REPLACE_HEIGHT, borderRadius: REPLACE_RADIUS, borderWidth: 1 }}>
          <Pencil size={8} color={colors.foreground} />
          <Text className="font-sans-medium text-2xs text-foreground">
            {t('uploadDocuments.replace')}
          </Text>
        </View>
      ) : (
        <View
          className="items-center justify-center"
          style={{ width: ACTION_SIZE, height: ACTION_SIZE }}>
          <Plus size={14} color={colors.foreground} />
        </View>
      )}
    </Pressable>
  );
}
