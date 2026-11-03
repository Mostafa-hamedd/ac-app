import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';

/** Fresh, non-retrying QueryClient so tests stay isolated and fast. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      // gcTime: Infinity too — otherwise a settled mutation schedules react-query's
      // default ~5min garbage-collection timer, which outlives the test and leaves
      // Jest unable to exit cleanly.
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

/** Wrapper for `renderHook(..., { wrapper })`. */
export function createQueryWrapper(queryClient = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

export async function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = createTestQueryClient();
  const result = await render(ui, { wrapper: createQueryWrapper(queryClient), ...options });
  return { queryClient, ...result };
}
