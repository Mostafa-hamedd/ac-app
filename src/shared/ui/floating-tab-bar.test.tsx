import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { FloatingTabBar } from './floating-tab-bar';

type TabSpec = { key: string; name: string; title: string; badge?: number };

function setup(tabs: TabSpec[], focusedIndex = 0, defaultPrevented = false) {
  const emitter = { emit: jest.fn(() => ({ defaultPrevented })) };
  const navigateToTab = jest.fn();
  const props = {
    state: {
      index: focusedIndex,
      routes: tabs.map((tab) => ({ key: tab.key, name: tab.name })),
    },
    descriptors: Object.fromEntries(
      tabs.map((tab) => [
        tab.key,
        {
          options: {
            title: tab.title,
            tabBarBadge: tab.badge,
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <View testID={`icon-${tab.name}-${focused ? 'on' : 'off'}`} />
            ),
          },
        },
      ]),
    ),
    emitter,
    navigateToTab,
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  } as unknown as BottomTabBarProps;
  return { props, emitter, navigateToTab };
}

const TABS: TabSpec[] = [
  { key: 'home-1', name: 'index', title: 'Home' },
  { key: 'explore-1', name: 'explore', title: 'Explore' },
  { key: 'bell-1', name: 'notifications', title: 'Notifications' },
];

describe('FloatingTabBar', () => {
  it('renders one labelled tab per route and marks the focused one', async () => {
    const { props } = setup(TABS, 1);
    await render(<FloatingTabBar {...props} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByLabelText('Home').props.accessibilityState.selected).toBe(false);
    expect(screen.getByLabelText('Explore').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('icon-explore-on')).toBeTruthy();
    expect(screen.getByTestId('icon-index-off')).toBeTruthy();
  });

  it('navigates when an unfocused tab is pressed', async () => {
    const { props, emitter, navigateToTab } = setup(TABS, 0);
    await render(<FloatingTabBar {...props} />);
    await fireEvent.press(screen.getByLabelText('Explore'));
    expect(emitter.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'explore-1' }),
    );
    expect(navigateToTab).toHaveBeenCalledWith('explore-1');
  });

  it('does not navigate when the focused tab is pressed again', async () => {
    const { props, navigateToTab } = setup(TABS, 0);
    await render(<FloatingTabBar {...props} />);
    await fireEvent.press(screen.getByLabelText('Home'));
    expect(navigateToTab).not.toHaveBeenCalled();
  });

  it('does not navigate when a tabPress listener prevents it', async () => {
    const { props, navigateToTab } = setup(TABS, 0, true);
    await render(<FloatingTabBar {...props} />);
    await fireEvent.press(screen.getByLabelText('Explore'));
    expect(navigateToTab).not.toHaveBeenCalled();
  });

  it('shows a count badge, capped at 9+', async () => {
    const { props } = setup([TABS[0]!, TABS[1]!, { ...TABS[2]!, badge: 4 }]);
    const { rerender } = await render(<FloatingTabBar {...props} />);
    expect(screen.getByTestId('tab-badge-notifications')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();

    const many = setup([TABS[0]!, TABS[1]!, { ...TABS[2]!, badge: 23 }]);
    await rerender(<FloatingTabBar {...many.props} />);
    expect(screen.getByText('9+')).toBeTruthy();
  });

  it('hides the badge when there is no count', async () => {
    const none = setup([TABS[0]!, TABS[1]!, { ...TABS[2]!, badge: 0 }]);
    await render(<FloatingTabBar {...none.props} />);
    expect(screen.queryByTestId('tab-badge-notifications')).toBeNull();
  });
});
