import { AlertTriangle, Check } from 'lucide-react-native';
import { View } from 'react-native';

import { Card } from '@/shared/ui/card';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

type ResultCardProps = {
  tone: 'success' | 'error';
  title: string;
  description: string;
  /** Extra text under the description (e.g. a hotline number). */
  note?: string;
  /** The button that moves the user on. */
  action: React.ReactNode;
};

/** Full-screen card that ends a flow: "Account created", "Password updated", "Verification failed". */
export function ResultCard({ tone, title, description, note, action }: ResultCardProps) {
  const Icon = tone === 'success' ? Check : AlertTriangle;
  return (
    <Screen edges={['top', 'bottom']} contentClassName="items-center justify-center p-4">
      <Card className="w-full max-w-sm items-center gap-6 border-0 p-6">
        <View
          className={cn(
            'h-12 w-12 items-center justify-center rounded-full',
            tone === 'success' ? 'bg-success' : 'bg-destructive-soft',
          )}>
          <Icon size={22} color={tone === 'success' ? 'white' : colors.destructive} />
        </View>
        <View className="gap-2">
          <Text className="text-center text-lg">{title}</Text>
          <Text className="text-center">{description}</Text>
          {note ? <Text className="text-center text-xs">{note}</Text> : null}
        </View>
        <View className="w-full">{action}</View>
      </Card>
    </Screen>
  );
}
