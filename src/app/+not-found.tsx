import { Link, Stack } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Screen } from '@/shared/ui/screen';

export default function NotFoundRoute() {
  const { t } = useTranslation();
  return (
    <Screen edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: t('errors.notFoundTitle') }} />
      <EmptyState
        icon={SearchX}
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={
          <Link href="/" replace asChild>
            <Button variant="outline">{t('notFound.goHome')}</Button>
          </Link>
        }
      />
    </Screen>
  );
}
