import { FlashList } from '@shopify/flash-list';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';
import { Screen } from './screen';

type PaginatedListProps<T extends { id: string }> = {
  /** An infinite query whose `select` flattens the pages into one array. */
  query: UseInfiniteQueryResult<T[]>;
  renderItem: (item: T) => React.ReactElement;
  empty: { icon: LucideIcon; title: string; description: string };
  /** Tab screens pass [] because the tab bar already handles the bottom inset. */
  edges?: Edge[];
};

/** A full-screen list with loading, error, empty, pull-to-refresh and "load more" handled. */
export function PaginatedList<T extends { id: string }>({
  query,
  renderItem,
  empty,
  edges,
}: PaginatedListProps<T>) {
  if (query.isPending) return <LoadingState />;
  if (query.isError && !query.data) {
    return (
      <ErrorState
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    );
  }

  return (
    <Screen edges={edges}>
      <FlashList
        data={query.data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item)}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={() => void query.refetch()}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState {...empty} />}
        ListFooterComponent={
          query.isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null
        }
      />
    </Screen>
  );
}
