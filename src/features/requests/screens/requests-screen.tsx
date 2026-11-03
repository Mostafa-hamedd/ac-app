import { ClipboardList } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { PaginatedList } from '@/shared/ui/paginated-list';

import { RequestCard } from '../components/request-card';
import { useRequests } from '../hooks/use-requests';

export function RequestsScreen() {
  const { t } = useTranslation();
  const query = useRequests();
  return (
    <PaginatedList
      query={query}
      edges={[]}
      renderItem={(item) => <RequestCard request={item} />}
      empty={{
        icon: ClipboardList,
        title: t('requests.emptyTitle'),
        description: t('requests.emptyDescription'),
      }}
    />
  );
}
