import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { Text } from './text';

const MAX_BADGE = 9;

/** A screen is left out of the bar with `tabBarItemStyle: { display: 'none' }`. */
function isHiddenFromBar(options: BottomTabBarProps['descriptors'][string]['options']) {
  return StyleSheet.flatten(options.tabBarItemStyle)?.display === 'none';
}

/**
 * Dark floating tab bar. The focused tab gets a light rounded square; each tab can show a
 * count badge through the screen's `tabBarBadge` option. Screens hidden from the bar
 * (see `isHiddenFromBar`) get no button, and while one is open the first tab stays highlighted.
 */
export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const visibleRoutes = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => !isHiddenFromBar(descriptors[route.key]!.options));
  const focusedIsHidden = !visibleRoutes.some(({ index }) => index === state.index);
  const highlightedIndex = focusedIsHidden ? visibleRoutes[0]?.index : state.index;

  return (
    <View
      className="bg-background px-7 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
      <View className="h-16 flex-row items-center justify-between rounded-3xl bg-primary px-4">
        {visibleRoutes.map(({ route, index }) => {
          const { options } = descriptors[route.key]!;
          const focused = highlightedIndex === index;
          const badge = options.tabBarBadge;
          const hasBadge = badge !== undefined && badge !== null && badge !== 0 && badge !== '';
          const badgeText =
            typeof badge === 'number' && badge > MAX_BADGE ? `${MAX_BADGE}+` : badge;
          const iconColor = focused ? colors.primary : colors['primary-foreground'];

          function onPress() {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (state.index !== index && !event.defaultPrevented) navigateToTab(route.key);
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
              onPress={onPress}
              hitSlop={4}
              className={cn(
                'size-10 items-center justify-center rounded-md active:opacity-80',
                focused && 'bg-white',
              )}>
              {options.tabBarIcon?.({ focused, color: iconColor, size: 20 })}
              {hasBadge ? (
                <View
                  testID={`tab-badge-${route.name}`}
                  className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1">
                  <Text className="font-sans-medium text-2xs text-destructive-foreground">
                    {badgeText}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
