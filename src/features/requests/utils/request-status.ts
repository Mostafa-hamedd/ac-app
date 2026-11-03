import { i18n } from '@/lib/i18n';
import type { StatusTone } from '@/shared/ui/status-badge';

import type { ServiceRequestStatus } from '../types/request.types';

const TONES: Record<ServiceRequestStatus, StatusTone> = {
  submitted: 'neutral',
  scheduled: 'info',
  in_progress: 'info',
  awaiting_approval: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

/** Label and badge tone for a status. Statuses the app doesn't know yet still show, in plain words. */
export function getRequestStatusDisplay(status: string): { label: string; tone: StatusTone } {
  if (!(status in TONES)) return { label: status.replace(/_/g, ' '), tone: 'neutral' };
  const known = status as ServiceRequestStatus;
  return { label: i18n.t(`requests.status.${known}`), tone: TONES[known] };
}
