import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getPaymentById, getPayments } from '../api/payments.api';

// Every key starts with 'payments', so invalidating ['payments'] refreshes all of them.

export function usePayments() {
  return useInfiniteQuery({
    queryKey: ['payments', 'list'],
    queryFn: ({ pageParam }) => getPayments({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.items),
  });
}

export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: ['payments', 'detail', paymentId],
    queryFn: () => getPaymentById(paymentId),
  });
}
