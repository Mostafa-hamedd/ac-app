import { parseResponse } from '@/lib/api/api-error';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { paginatedSchema, type Paginated } from '@/shared/types/api';

import {
  serviceRequestSchema,
  serviceRequestSummarySchema,
  type RequestFilters,
  type ServiceRequest,
  type ServiceRequestSummary,
} from '../types/request.types';

export async function getRequests(params: {
  filters: RequestFilters;
  cursor?: string | null;
}): Promise<Paginated<ServiceRequestSummary>> {
  const { data } = await apiClient.get(endpoints.requests.list, {
    params: { ...params.filters, cursor: params.cursor ?? undefined },
  });
  return parseResponse(paginatedSchema(serviceRequestSummarySchema), data);
}

export async function getRequestById(requestId: string): Promise<ServiceRequest> {
  const { data } = await apiClient.get(endpoints.requests.detail(requestId));
  return parseResponse(serviceRequestSchema, data);
}
