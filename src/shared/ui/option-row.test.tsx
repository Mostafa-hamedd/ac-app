import { fireEvent, render, screen } from '@testing-library/react-native';
import type { LucideIcon } from 'lucide-react-native';

import { OptionRow } from './option-row';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

const Icon = (() => null) as unknown as LucideIcon;

describe('OptionRow', () => {
  it('renders its label and handles presses', async () => {
    const onPress = jest.fn();
    await render(<OptionRow icon={Icon} label="Take Photo" onPress={onPress} />);
    await fireEvent.press(screen.getByLabelText('Take Photo'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses and reports the state when disabled', async () => {
    const onPress = jest.fn();
    await render(<OptionRow icon={Icon} label="Remove" disabled onPress={onPress} />);
    const row = screen.getByLabelText('Remove');
    expect(row.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(row);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('styles destructive rows in red', async () => {
    await render(<OptionRow icon={Icon} label="Remove" destructive />);
    expect(String(screen.getByText('Remove').props.className)).toContain('text-destructive');
  });
});
