import { fireEvent, screen } from '@testing-library/react-native';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { ProfileScreen } from './profile-screen';

jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({ isConnected: true }),
  addEventListener: () => () => undefined,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAwareScrollView: require('react-native').ScrollView,
}));

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

describe('ProfileScreen', () => {
  it('offers Sign out when signed in', async () => {
    const onSignOut = jest.fn();
    await renderWithProviders(<ProfileScreen name="Sara" onSignOut={onSignOut} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalled();
    expect(screen.queryByText('Login')).toBeNull();
  });

  it('offers Login instead of Sign out to a guest', async () => {
    const onLogin = jest.fn();
    await renderWithProviders(<ProfileScreen isGuest onSignOut={jest.fn()} onLogin={onLogin} />);
    expect(screen.queryByText('Sign out')).toBeNull();
    expect(screen.queryByText('Your account')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(onLogin).toHaveBeenCalled();
  });
});
