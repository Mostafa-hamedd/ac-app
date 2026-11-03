import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { QueryView } from '@/shared/ui/query-view';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { AuthHeader } from '../components/auth-header';
import { DocumentRow } from '../components/document-row';
import { DocumentUploadSheet } from '../components/document-upload-sheet';
import { FormError } from '../components/form-error';
import { useUploadKycDocument } from '../hooks/use-auth-mutations';
import { useRegistrationDraft } from '../hooks/use-registration-draft';
import type { KycDocumentType } from '../types/auth.types';

const DOCUMENT_TYPES: KycDocumentType[] = [
  'national_id_front',
  'drivers_license_front',
  'car_registration_front',
  'car_registration_back',
];

export function UploadDocumentsScreen({ registrationId }: { registrationId: string }) {
  const { t } = useTranslation();
  const query = useRegistrationDraft(registrationId);
  const upload = useUploadKycDocument();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [activeType, setActiveType] = useState<KycDocumentType | null>(null);
  const uploadingType = upload.isPending ? upload.variables.type : null;

  function openSheet(type: KycDocumentType) {
    setActiveType(type);
    sheetRef.current?.present();
  }

  return (
    <QueryView query={query}>
      {(draft) => (
        <Screen preset="scroll" edges={['top', 'bottom']} contentClassName="px-6 pt-3">
          <AuthHeader title={t('uploadDocuments.title')} subtitle={t('uploadDocuments.subtitle')} />

          <View className="gap-5">
            <FormError error={upload.error} />
            <View className="gap-3">
              {DOCUMENT_TYPES.map((type) => (
                <DocumentRow
                  key={type}
                  label={t(`documents.${type}.label`)}
                  document={draft.documents[type]}
                  uploading={uploadingType === type}
                  onPress={() => openSheet(type)}
                />
              ))}
            </View>
            <Button
              disabled={!DOCUMENT_TYPES.every((type) => draft.documents[type]) || upload.isPending}
              onPress={() => router.push({ pathname: '/verifying', params: { registrationId } })}>
              {t('uploadDocuments.submit')}
            </Button>
            <Text variant="muted" className="text-center">
              {t('uploadDocuments.terms')}
            </Text>
          </View>

          <DocumentUploadSheet
            ref={sheetRef}
            label={activeType ? t(`documents.${activeType}.short`) : ''}
            onPicked={(image) => {
              if (!activeType) return;
              upload.mutate({ registrationId, type: activeType, ...image });
              sheetRef.current?.dismiss();
            }}
          />
        </Screen>
      )}
    </QueryView>
  );
}
