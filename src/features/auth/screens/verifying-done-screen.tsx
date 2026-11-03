import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';
import { QueryView } from '@/shared/ui/query-view';

import { ResultCard } from '../components/result-card';
import { useRegistrationDraft } from '../hooks/use-registration-draft';

export function VerifyingDoneScreen({ registrationId }: { registrationId: string }) {
  const { t } = useTranslation();
  const query = useRegistrationDraft(registrationId);

  return (
    <QueryView query={query}>
      {({ phone, country }) => (
        <ResultCard
          tone="success"
          title={t('verifying.doneTitle')}
          description={t('verifying.doneDescription')}
          action={
            <Button
              onPress={() => router.replace({ pathname: '/login', params: { phone, country } })}>
              {t('verifying.logIn')}
            </Button>
          }
        />
      )}
    </QueryView>
  );
}
