import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui';
import { Text } from '@/shared/ui/text';

/** Keys of the clauses under `services.payment.termsClauses`. */
const CLAUSES = ['booking', 'cancellation', 'pricing', 'payment'] as const;

export type TermsModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * The booking terms in a modal sheet. FICTIONAL MOCK TEXT: replace with the real terms when
 * the business provides them.
 */
export function TermsModal({ visible, onClose }: TermsModalProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const textAlign = i18n.language === 'ar' ? 'text-right' : undefined;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            {t('services.payment.terms')}
          </Text>
          <ScrollView contentContainerClassName="gap-4">
            {CLAUSES.map((clause) => (
              <View key={clause} className="gap-1">
                <Text className={`font-sans-semibold text-sm ${textAlign ?? ''}`}>
                  {t(`services.payment.termsClauses.${clause}.title`)}
                </Text>
                <Text variant="muted" className={textAlign}>
                  {t(`services.payment.termsClauses.${clause}.body`)}
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
