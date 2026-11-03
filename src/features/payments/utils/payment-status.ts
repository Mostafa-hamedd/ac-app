import { i18n } from '@/lib/i18n';
import type { StatusTone } from '@/shared/ui/status-badge';

import type { PaymentStatus } from '../types/payment.types';

const TONES: Record<PaymentStatus, StatusTone> = {
  unpaid: 'warning',
  initiating: 'info',
  pending: 'info',
  paid: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  refunded: 'neutral',
};

/** Label and badge tone for a status. Statuses the app doesn't know yet still show, in plain words. */
export function getPaymentStatusDisplay(status: string): { label: string; tone: StatusTone } {
  if (!(status in TONES)) return { label: status.replace(/_/g, ' '), tone: 'neutral' };
  const known = status as PaymentStatus;
  return { label: i18n.t(`payments.status.${known}`), tone: TONES[known] };
}
