import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getVehicleById, getVehicles } from '../api/vehicles.api';

// Every key starts with 'vehicles', so invalidating ['vehicles'] refreshes all of them.

export function useVehicles() {
  return useInfiniteQuery({
    queryKey: ['vehicles', 'list'],
    queryFn: ({ pageParam }) => getVehicles({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.items),
  });
}

export function useVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicles', 'detail', vehicleId],
    queryFn: () => getVehicleById(vehicleId),
  });
}
