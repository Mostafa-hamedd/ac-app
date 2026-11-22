import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

/** Full translation prefixes of each clause, so every key is checked against the locale type. */
const CLAUSES = {
  privacy: [
    'legal.privacy.clauses.collect',
    'legal.privacy.clauses.use',
    'legal.privacy.clauses.share',
    'legal.privacy.clauses.rights',
  ],
  terms: [
    'legal.terms.clauses.account',
    'legal.terms.clauses.service',
    'legal.terms.clauses.documents',
    'legal.terms.clauses.changes',
  ],
} as const;

export type LegalDocument = keyof typeof CLAUSES;

export type LegalModalProps = {
  /** Which text to show; `null` keeps the modal closed. */
  document: LegalDocument | null;
  onClose: () => void;
};

/**
 * The Privacy Policy or Terms of Use in a modal sheet. FICTIONAL MOCK TEXT: replace with the
 * real legal text when the business provides it.
 */
export function LegalModal({ document, onClose }: LegalModalProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const textAlign = i18n.language === 'ar' ? 'text-right' : undefined;
  // Keep the last document while the sheet slides away, so the text does not blank out.
  const shown = document ?? 'terms';

  return (
    <Modal visible={document !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          className="flex-1"
        />
        <View
          className="max-h-[80%] gap-4 rounded-t-xl bg-background px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
          <Text accessibilityRole="header" variant="h3" className={textAlign}>
            {t(`legal.${shown}.title`)}
          </Text>
          <ScrollView contentContainerClassName="gap-4">
            {CLAUSES[shown].map((clause) => (
              <View key={clause} className="gap-1">
                <Text className={cn('font-sans-semibold text-sm', textAlign)}>
                  {t(`${clause}.title`)}
                </Text>
                <Text variant="muted" className={textAlign}>
                  {t(`${clause}.body`)}
                </Text>
              </View>
            ))}
          </ScrollView>
          <Button label={t('common.close')} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
