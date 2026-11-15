import { fireEvent, render, screen } from '@testing-library/react-native';

import { Checkbox } from './checkbox';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

describe('Checkbox', () => {
  it('reports its checked state', async () => {
    await render(<Checkbox checked onCheckedChange={jest.fn()} accessibilityLabel="Agree" />);
    expect(screen.getByRole('checkbox', { name: 'Agree' }).props.accessibilityState.checked).toBe(
      true,
    );
  });

  it('asks for the opposite value when pressed', async () => {
    const onCheckedChange = jest.fn();
    await render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} accessibilityLabel="Agree" />,
    );
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Agree' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('ignores presses when disabled', async () => {
    const onCheckedChange = jest.fn();
    await render(
      <Checkbox
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
        accessibilityLabel="Agree"
      />,
    );
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Agree' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
