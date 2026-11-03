import { parseResponse } from '@/lib/api/api-error';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { paginatedSchema, type Paginated } from '@/shared/types/api';

import {
  paymentSchema,
  paymentSummarySchema,
  type Payment,
  type PaymentSummary,
} from '../types/payment.types';

export async function getPayments(params?: {
  cursor?: string | null;
}): Promise<Paginated<PaymentSummary>> {
  const { data } = await apiClient.get(endpoints.payments.list, {
    params: { cursor: params?.cursor ?? undefined },
  });
  return parseResponse(paginatedSchema(paymentSummarySchema), data);
}

export async function getPaymentById(paymentId: string): Promise<Payment> {
  const { data } = await apiClient.get(endpoints.payments.detail(paymentId));
  return parseResponse(paymentSchema, data);
}
