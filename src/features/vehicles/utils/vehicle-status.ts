import { i18n } from '@/lib/i18n';
import type { StatusTone } from '@/shared/ui/status-badge';

import type { VehicleStatus } from '../types/vehicle.types';

const TONES: Record<VehicleStatus, StatusTone> = {
  active: 'success',
  in_service: 'info',
  needs_attention: 'warning',
};

/** Label and badge tone for a status. Statuses the app doesn't know yet still show, in plain words. */
export function getVehicleStatusDisplay(status: string): { label: string; tone: StatusTone } {
  if (!(status in TONES)) return { label: status.replace(/_/g, ' '), tone: 'neutral' };
  const known = status as VehicleStatus;
  return { label: i18n.t(`vehicles.status.${known}`), tone: TONES[known] };
}
