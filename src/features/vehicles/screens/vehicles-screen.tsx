import { Car } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { PaginatedList } from '@/shared/ui/paginated-list';

import { VehicleCard } from '../components/vehicle-card';
import { useVehicles } from '../hooks/use-vehicles';

export function VehiclesScreen() {
  const { t } = useTranslation();
  const query = useVehicles();
  return (
    <PaginatedList
      query={query}
      edges={[]}
      renderItem={(item) => <VehicleCard vehicle={item} />}
      empty={{
        icon: Car,
        title: t('vehicles.emptyTitle'),
        description: t('vehicles.emptyDescription'),
      }}
    />
  );
}
