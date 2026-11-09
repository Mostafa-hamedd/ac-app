import { Construction } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from './empty-state';
import { Screen } from './screen';

/** Placeholder for tabs whose content has not been designed yet. */
export function ComingSoon() {
  const { t } = useTranslation();
  return (
    <Screen edges={[]}>
      <EmptyState
        icon={Construction}
        title={t('tabs.comingSoon')}
        description={t('tabs.comingSoonDescription')}
      />
    </Screen>
  );
}
