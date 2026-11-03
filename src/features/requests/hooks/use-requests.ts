import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getRequestById, getRequests } from '../api/requests.api';
import type { RequestFilters } from '../types/request.types';

// Every key starts with 'requests', so invalidating ['requests'] refreshes all of them.

export function useRequests(filters: RequestFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['requests', 'list', filters],
    queryFn: ({ pageParam }) => getRequests({ filters, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.items),
  });
}

export function useRequest(requestId: string) {
  return useQuery({
    queryKey: ['requests', 'detail', requestId],
    queryFn: () => getRequestById(requestId),
  });
}
