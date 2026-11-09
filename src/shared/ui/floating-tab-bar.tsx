import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { Text } from './text';

const MAX_BADGE = 9;

/**
 * Dark floating tab bar. The focused tab gets a light rounded square; each tab can show a
 * count badge through the screen's `tabBarBadge` option.
 */
export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  return (
    <View
      className="bg-background px-7 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
      <View className="h-16 flex-row items-center justify-between rounded-3xl bg-primary px-4">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]!;
          const focused = state.index === index;
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
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
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
