import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { Tabs } from 'expo-router/js-tabs';
import { Text, View } from 'react-native';

import { FloatingTabBar } from './floating-tab-bar';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const page = (label: string) =>
  function Page() {
    return (
      <View>
        <Text>{label}</Text>
      </View>
    );
  };

function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => null }} />
      <Tabs.Screen
        name="services"
        options={{ title: 'All Services', tabBarItemStyle: { display: 'none' } }}
      />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: () => null }} />
    </Tabs>
  );
}

const routes = {
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': page('Home screen'),
  '(tabs)/services': page('Services screen'),
  '(tabs)/explore': page('Explore screen'),
};

describe('a tab left out of the bar', () => {
  it('has no button in the bar but can still be opened with router.push', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    expect(screen.getByText('Home screen')).toBeTruthy();
    expect(screen.queryByLabelText('All Services')).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(2);

    await act(async () => router.push('/services'));
    expect(screen.getByText('Services screen')).toBeTruthy();
    // The bar is still there, and Home stays highlighted while the hidden screen is open.
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByLabelText('Home').props.accessibilityState.selected).toBe(true);
  });

  it('goes back to Home from the bar', async () => {
    await renderRouter(routes, { initialUrl: '/services' });
    expect(screen.getByText('Services screen')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Home'));
    expect(screen.getByText('Home screen')).toBeTruthy();
  });
});
