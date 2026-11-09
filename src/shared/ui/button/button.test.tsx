import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { colors } from '@/theme';

import { Button } from './button';

describe('Button', () => {
  it('renders a label and handles presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders children instead of the label, and strings as text', async () => {
    await render(
      <>
        <Button label="Ignored">Child text</Button>
        <Button>
          <Text>Custom</Text>
        </Button>
      </>,
    );
    expect(screen.getByText('Child text')).toBeTruthy();
    expect(screen.queryByText('Ignored')).toBeNull();
    expect(screen.getByText('Custom')).toBeTruthy();
  });

  it('passes native Pressable props through', async () => {
    await render(<Button label="Go" testID="go" accessibilityLabel="Go now" />);
    expect(screen.getByTestId('go')).toBeTruthy();
    expect(screen.getByLabelText('Go now')).toBeTruthy();
  });

  it('reports its disabled state and ignores presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Off" disabled onPress={onPress} />);
    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('blocks presses while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Saving" loading onPress={onPress} />);
    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true, disabled: true }),
    );
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByText('Saving')).toBeTruthy();
  });

  it('renders left and right icons, giving function icons the label colour', async () => {
    const left = jest.fn(() => <View testID="left" />);
    await render(
      <Button
        label="Icons"
        leftIcon={left}
        rightIcon={<View testID="right" />}
        variant="outline"
      />,
    );
    // Outline buttons use the foreground (dark) colour for their icons.
    expect(left).toHaveBeenCalledWith({ color: colors.foreground, size: 16 });
    expect(screen.getByTestId('left')).toBeTruthy();
    expect(screen.getByTestId('right')).toBeTruthy();
  });

  it('hides the icons while loading', async () => {
    await render(<Button label="L" loading leftIcon={<View testID="ico" />} />);
    expect(screen.queryByTestId('ico')).toBeNull();
  });

  it.each([
    ['default', 'bg-primary'],
    ['secondary', 'bg-muted-foreground'],
    ['outline', 'border-input'],
    ['ghost', 'bg-transparent'],
  ] as const)('applies the %s variant classes', async (variant, expected) => {
    await render(<Button label="V" variant={variant} testID="v" />);
    expect(String(screen.getByTestId('v').props.className)).toContain(expected);
  });

  it.each([
    ['sm', 'h-10'],
    ['md', 'h-13'],
  ] as const)('applies the %s size', async (size, expected) => {
    await render(<Button label="S" size={size} testID="s" />);
    expect(String(screen.getByTestId('s').props.className)).toContain(expected);
  });

  it('supports the pill shape and extra classes without losing the defaults', async () => {
    await render(<Button label="P" shape="pill" className="px-5" testID="p" />);
    const className = String(screen.getByTestId('p').props.className);
    expect(className).toContain('rounded-full');
    expect(className).toContain('px-5');
    expect(className).not.toContain('rounded-lg');
  });
});
