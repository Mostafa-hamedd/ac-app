import { Inbox, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '@/theme';

import { Text } from './text';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <Icon size={40} color={colors['muted-foreground']} />
      <Text variant="h3" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="muted" className="text-center">
          {description}
        </Text>
      ) : null}
      {action}
    </View>
  );
}
