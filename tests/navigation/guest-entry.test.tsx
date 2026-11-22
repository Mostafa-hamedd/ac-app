import { act, screen } from '@testing-library/react-native';
import { Stack } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { enterGuestMode, leaveGuestMode, useSessionStatus } from '@/features/auth';

// The real tabs layout: its initial-route setting is part of what is being checked.
import { unstable_settings } from '../../src/app/(app)/(tabs)/_layout';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAwareScrollView: require('react-native').ScrollView,
}));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({ isConnected: true }),
  addEventListener: () => () => undefined,
}));
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));

/** Every screen that has been put on screen, in order. */
const mounted: string[] = [];

function page(name: string) {
  return function Page() {
    mounted.push(name);
    return <Text>{`${name} screen`}</Text>;
  };
}

// Same guards as the root layout: the landing page while logged out, the app for a guest.
function RootLayout() {
  const status = useSessionStatus();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'guest'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'unauthenticated'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

const StackLayout = () => <Stack screenOptions={{ headerShown: false }} />;

function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
    </Tabs>
  );
}

const routes = {
  _layout: RootLayout,
  '(auth)/_layout': StackLayout,
  '(auth)/index': page('Landing'),
  '(app)/_layout': StackLayout,
  '(app)/(tabs)/_layout': { default: TabsLayout, unstable_settings },
  '(app)/(tabs)/index': page('My Garage'),
  '(app)/(tabs)/explore': page('Explore'),
};

describe('Continue as a Guest', () => {
  beforeEach(() => {
    mounted.length = 0;
    leaveGuestMode();
  });

  it('opens Explore directly and never mounts My Garage on the way', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    expect(screen.getByText('Landing screen')).toBeTruthy();

    await act(async () => enterGuestMode());

    expect(screen.getByText('Explore screen')).toBeTruthy();
    expect(mounted).not.toContain('My Garage');
  });
});
