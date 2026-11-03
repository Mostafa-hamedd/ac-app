import { Receipt } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { PaginatedList } from '@/shared/ui/paginated-list';

import { PaymentCard } from '../components/payment-card';
import { usePayments } from '../hooks/use-payments';

/** Always shows the status the backend confirms: a checkout redirect is never proof of payment. */
export function PaymentsScreen() {
  const { t } = useTranslation();
  const query = usePayments();
  return (
    <PaginatedList
      query={query}
      renderItem={(item) => <PaymentCard payment={item} />}
      empty={{
        icon: Receipt,
        title: t('payments.emptyTitle'),
        description: t('payments.emptyDescription'),
      }}
    />
  );
}
