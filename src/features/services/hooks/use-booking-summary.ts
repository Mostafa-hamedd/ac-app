import { useTranslation } from 'react-i18next';

import { MAINTENANCE_CENTERS } from '@/features/locations';
import { useSelectedVehicle, vehicleLabel } from '@/features/vehicles';
import { formatNumber } from '@/shared/utils/format';

import { estimateCost } from '../data/booking-options';
import { isServiceTypeId } from '../utils/booking-form';

/** The booking, as it travels between the payment screens in route params. */
export type BookingParams = {
  type?: string;
  packageKm?: string;
  vehicleId?: string;
  centerId?: string;
  date?: string;
  time?: string;
};

/** Readable pieces of a booking, in the app's language. */
export function useBookingSummary(params: BookingParams) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  const { vehicles } = useSelectedVehicle();

  const serviceType = isServiceTypeId(params.type) ? params.type : 'other';
  const packageKm = params.packageKm ? Number(params.packageKm) : null;
  const vehicle = vehicles.find((item) => item.id === params.vehicleId);
  const center = MAINTENANCE_CENTERS.find((item) => item.id === params.centerId);

  return {
    serviceType,
    packageKm,
    cost: estimateCost(serviceType, packageKm),
    serviceName:
      serviceType === 'regularMaintenance' && packageKm !== null
        ? t('services.form.maintenancePackage', { km: formatNumber(packageKm) })
        : t(`services.types.${serviceType}`),
    vehicleText: vehicle ? `${vehicleLabel(vehicle)} ${vehicle.year}` : '—',
    centerName: center ? center.name[locale] : '—',
  };
}
