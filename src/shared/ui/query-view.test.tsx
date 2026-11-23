import type { UseQueryResult } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ApiError } from '@/lib/api/api-error';
import { i18n } from '@/lib/i18n';

import { QueryView } from './query-view';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

/** Only the fields QueryView reads. */
function fakeQuery(state: Partial<UseQueryResult<string>>): UseQueryResult<string> {
  return {
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...state,
  } as UseQueryResult<string>;
}

describe('QueryView', () => {
  it('shows the loading state while the query is pending', async () => {
    const children = jest.fn();
    await render(<QueryView query={fakeQuery({ isPending: true })}>{children}</QueryView>);
    expect(screen.getByLabelText('Loading…')).toBeTruthy();
    expect(children).not.toHaveBeenCalled();
  });

  it('shows the error state and retries through refetch', async () => {
    const refetch = jest.fn();
    const query = fakeQuery({ isError: true, error: new ApiError('network', 'offline'), refetch });
    await render(<QueryView query={query}>{() => null}</QueryView>);

    expect(screen.getByText("You're offline")).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders the children with the data once it is ready', async () => {
    const query = fakeQuery({ data: 'hello' });
    await render(<QueryView query={query}>{(data) => <Text>{`Got ${data}`}</Text>}</QueryView>);
    expect(screen.getByText('Got hello')).toBeTruthy();
  });
});
