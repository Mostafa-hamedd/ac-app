import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';

import { ResultCard } from '../components/result-card';

export function VerifyingFailedScreen({ registrationId }: { registrationId: string }) {
  const { t } = useTranslation();
  return (
    <ResultCard
      tone="error"
      title={t('verifying.failedTitle')}
      description={t('verifying.failedDescription')}
      note={t('verifying.failedHotline')}
      action={
        <Button
          onPress={() =>
            router.replace({ pathname: '/upload-documents', params: { registrationId } })
          }>
          {t('verifying.backToDocuments')}
        </Button>
      }
    />
  );
}
