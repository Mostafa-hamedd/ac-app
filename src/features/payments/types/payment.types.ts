import { z } from 'zod';

import { isoDateSchema } from '@/shared/types/api';

/** Payment states the UI knows how to show. Map the backend's statuses onto these. */
const paymentStatusSchema = z.enum([
  'unpaid',
  'initiating',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
]);

export const paymentSummarySchema = z.object({
  id: z.string(),
  reference: z.string(),
  title: z.string(),
  /** In the currency's smallest unit (cents for USD). */
  amountMinor: z.number().int(),
  currency: z.string(),
  status: paymentStatusSchema,
  vehicleLabel: z.string().optional(),
  issuedAt: isoDateSchema,
  dueAt: isoDateSchema.optional(),
});

export const paymentSchema = paymentSummarySchema.extend({
  dealershipName: z.string(),
  description: z.string().optional(),
  paidAt: isoDateSchema.optional(),
});

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentSummary = z.infer<typeof paymentSummarySchema>;
export type Payment = z.infer<typeof paymentSchema>;
