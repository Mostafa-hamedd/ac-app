import type { UseQueryResult } from '@tanstack/react-query';

import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';

type QueryViewProps<T> = {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
};

/** Shows loading and error states for a query, and renders `children` once its data is ready. */
export function QueryView<T>({ query, children }: QueryViewProps<T>) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    );
  }
  return children(query.data);
}
