import { z } from 'zod';

import { isoDateSchema } from '@/shared/types/api';

const serviceRequestStatusSchema = z.enum([
  'submitted',
  'scheduled',
  'in_progress',
  'awaiting_approval',
  'completed',
  'cancelled',
]);

export const serviceRequestSummarySchema = z.object({
  id: z.string(),
  reference: z.string(),
  title: z.string(),
  status: serviceRequestStatusSchema,
  vehicleLabel: z.string(),
  updatedAt: isoDateSchema,
});

export const serviceRequestSchema = serviceRequestSummarySchema.extend({
  description: z.string().optional(),
  dealershipName: z.string(),
  scheduledFor: isoDateSchema.optional(),
  history: z.array(
    z.object({
      status: serviceRequestStatusSchema,
      at: isoDateSchema,
      note: z.string().optional(),
    }),
  ),
});

export type ServiceRequestStatus = z.infer<typeof serviceRequestStatusSchema>;
export type ServiceRequestSummary = z.infer<typeof serviceRequestSummarySchema>;
export type ServiceRequest = z.infer<typeof serviceRequestSchema>;

export type RequestFilters = { status?: ServiceRequestStatus };
