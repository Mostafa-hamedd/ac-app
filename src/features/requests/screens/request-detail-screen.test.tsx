import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/lib/api/api-error';
import { i18n } from '@/lib/i18n';
import { requestSummaryFixture } from '@tests/fixtures/requests';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { getRequestById } from '../api/requests.api';

import { RequestDetailScreen } from './request-detail-screen';

jest.mock('../api/requests.api');
jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({ isConnected: true }),
  addEventListener: () => () => undefined,
}));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAwareScrollView: require('react-native').ScrollView,
}));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

const request = {
  ...requestSummaryFixture,
  dealershipName: 'AutoConnect Nasr City',
  description: 'Oil change and brake check',
  scheduledFor: '2026-11-05T10:00:00.000Z',
  history: [
    { status: 'submitted' as const, at: '2026-10-30T09:00:00.000Z' },
    { status: 'in_progress' as const, at: '2026-10-31T09:00:00.000Z', note: 'Parts ordered' },
  ],
};

beforeEach(async () => {
  await i18n.changeLanguage('en');
  jest.mocked(getRequestById).mockReset();
});

describe('RequestDetailScreen', () => {
  it('shows a loading state, then the request details and history', async () => {
    jest.mocked(getRequestById).mockResolvedValue(request);
    await renderWithProviders(<RequestDetailScreen requestId="REQ_123" />);

    expect(screen.getByLabelText('Loading…')).toBeTruthy();

    await waitFor(() => expect(screen.getByText('Annual service')).toBeTruthy());
    expect(screen.getByText('Toyota Corolla 2022')).toBeTruthy();
    expect(screen.getByText('AutoConnect Nasr City')).toBeTruthy();
    expect(screen.getByText('Oil change and brake check')).toBeTruthy();
    expect(screen.getByText('Status history')).toBeTruthy();
    expect(screen.getByText('Parts ordered')).toBeTruthy();
    expect(screen.getByText('Submitted')).toBeTruthy();
  });

  it('omits the schedule and description when the request has none', async () => {
    jest
      .mocked(getRequestById)
      .mockResolvedValue({ ...request, scheduledFor: undefined, description: undefined });
    await renderWithProviders(<RequestDetailScreen requestId="REQ_123" />);

    await waitFor(() => expect(screen.getByText('Annual service')).toBeTruthy());
    expect(screen.queryByText(/Scheduled for/)).toBeNull();
    expect(screen.queryByText('Oil change and brake check')).toBeNull();
  });

  it('shows an error with a retry that loads the request again', async () => {
    jest
      .mocked(getRequestById)
      .mockRejectedValueOnce(new ApiError('network', 'offline'))
      .mockResolvedValueOnce(request);
    await renderWithProviders(<RequestDetailScreen requestId="REQ_123" />);

    await waitFor(() => expect(screen.getByText("You're offline")).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(screen.getByText('Annual service')).toBeTruthy());
    expect(getRequestById).toHaveBeenCalledTimes(2);
  });
});
