import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, CardTitle } from '@/shared/ui/card';
import { QueryView } from '@/shared/ui/query-view';
import { Screen } from '@/shared/ui/screen';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Text } from '@/shared/ui/text';
import { formatDate, formatNumber } from '@/shared/utils/format';

import { useVehicle } from '../hooks/use-vehicles';
import { getVehicleStatusDisplay } from '../utils/vehicle-status';

export function VehicleDetailScreen({ vehicleId }: { vehicleId: string }) {
  const { t } = useTranslation();
  const query = useVehicle(vehicleId);

  return (
    <QueryView query={query}>
      {(vehicle) => {
        const status = getVehicleStatusDisplay(vehicle.status);
        const title = vehicle.nickname ?? `${vehicle.make} ${vehicle.model}`;
        return (
          <Screen preset="scroll" contentClassName="gap-4">
            <Stack.Screen options={{ title }} />
            <View className="gap-2">
              <Text variant="h2">{title}</Text>
              <StatusBadge label={status.label} tone={status.tone} />
            </View>

            <Card>
              <CardTitle>{t('common.details')}</CardTitle>
              <Text>
                {vehicle.make} {vehicle.model} {vehicle.year}
              </Text>
              <Text variant="muted">{t('vehicles.plate', { plate: vehicle.licensePlate })}</Text>
              <Text variant="muted">{t('vehicles.vin', { vin: vehicle.vin })}</Text>
              {vehicle.color ? <Text variant="muted">{vehicle.color}</Text> : null}
              {vehicle.mileage !== undefined ? (
                <Text variant="muted">
                  {t('vehicles.mileage', { mileage: formatNumber(vehicle.mileage) })}
                </Text>
              ) : null}
            </Card>

            <Card>
              <CardTitle>{t('vehicles.serviceHistory')}</CardTitle>
              {vehicle.lastServiceAt ? (
                <Text variant="small">
                  {t('vehicles.lastServiced', { date: formatDate(vehicle.lastServiceAt) })}
                </Text>
              ) : (
                <Text variant="muted">{t('vehicles.noServiceHistory')}</Text>
              )}
              {vehicle.nextServiceDueAt ? (
                <Text variant="muted">
                  {t('vehicles.nextServiceDue', { date: formatDate(vehicle.nextServiceDueAt) })}
                </Text>
              ) : null}
            </Card>
          </Screen>
        );
      }}
    </QueryView>
  );
}
