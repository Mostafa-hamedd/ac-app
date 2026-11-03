import { env } from '@/config/env';
import { apiClient } from '@/lib/api/client';

import { authRoutes } from './auth';
import { notificationsRoutes } from './notifications';
import { paymentsRoutes } from './payments';
import { requestsRoutes } from './requests';
import { createMockAdapter } from './server';
import { vehiclesRoutes } from './vehicles';

/**
 * Answers every API call from the fake backend in this folder instead of the network.
 * Builds without EXPO_PUBLIC_USE_MOCK_API=true load noop.ts instead (see metro.config.js),
 * so none of this code or data ships to users.
 */
if (env.useMockApi) {
  apiClient.defaults.adapter = createMockAdapter([
    ...authRoutes,
    ...requestsRoutes,
    ...vehiclesRoutes,
    ...paymentsRoutes,
    ...notificationsRoutes,
  ]);
}
