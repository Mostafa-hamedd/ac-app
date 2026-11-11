import { fireEvent, render, screen } from '@testing-library/react-native';
import type { LucideIcon } from 'lucide-react-native';

import { ServiceTypeCard } from './service-type-card';

const Icon = (() => null) as unknown as LucideIcon;

describe('ServiceTypeCard', () => {
  it('shows its label and handles presses', async () => {
    const onPress = jest.fn();
    await render(
      <ServiceTypeCard label="Tire Service" icon={Icon} selected={false} onPress={onPress} />,
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'Tire Service' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports whether it is selected', async () => {
    const { rerender } = await render(
      <ServiceTypeCard label="Tire Service" icon={Icon} selected={false} onPress={jest.fn()} />,
    );
    expect(screen.getByRole('radio').props.accessibilityState.selected).toBe(false);
    await rerender(
      <ServiceTypeCard label="Tire Service" icon={Icon} selected onPress={jest.fn()} />,
    );
    expect(screen.getByRole('radio').props.accessibilityState.selected).toBe(true);
  });
});
