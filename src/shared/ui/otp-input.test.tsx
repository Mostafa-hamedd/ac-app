import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { TextInput } from 'react-native';

import { OtpInput } from './otp-input';

function Harness({
  length = 4,
  onComplete,
  initial = '',
}: {
  length?: number;
  onComplete?: (code: string) => void;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return <OtpInput length={length} value={value} onChange={setValue} onComplete={onComplete} />;
}

function digit(index: number, length = 4) {
  return screen.getByLabelText(`Digit ${index + 1} of ${length}`);
}

async function flushFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('OtpInput', () => {
  beforeEach(() => {
    jest.spyOn(TextInput.prototype, 'focus').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('advances focus to the next input when a digit is entered', async () => {
    await render(<Harness />);
    const focus = TextInput.prototype.focus as jest.Mock;

    await fireEvent.changeText(digit(0), '1');
    expect(digit(0).props.value).toBe('1');
    await flushFocus();

    expect(focus).toHaveBeenCalled();
    expect(digit(1).props.value).toBe('');
  });

  it('calls onComplete when all digits are filled', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);

    await fireEvent.changeText(digit(0), '1');
    await fireEvent.changeText(digit(1), '2');
    await fireEvent.changeText(digit(2), '3');
    await fireEvent.changeText(digit(3), '4');

    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('clears the current digit and moves to the previous input on Backspace', async () => {
    await render(<Harness initial="12" />);
    const focus = TextInput.prototype.focus as jest.Mock;
    focus.mockClear();

    expect(digit(1).props.value).toBe('2');
    await fireEvent(digit(1), 'keyPress', { nativeEvent: { key: 'Backspace' } });

    expect(digit(0).props.value).toBe('1');
    expect(digit(1).props.value).toBe('');
    await flushFocus();
    expect(focus).toHaveBeenCalled();
  });

  it('moves to the previous input and deletes its digit on Backspace when empty', async () => {
    await render(<Harness initial="12" />);
    const focus = TextInput.prototype.focus as jest.Mock;
    focus.mockClear();

    await fireEvent(digit(2), 'keyPress', { nativeEvent: { key: 'Backspace' } });

    expect(digit(0).props.value).toBe('1');
    expect(digit(1).props.value).toBe('');
    await flushFocus();
    expect(focus).toHaveBeenCalled();
  });

  it('moves focus backward automatically while deleting digits', async () => {
    await render(<Harness initial="1234" />);
    const focus = TextInput.prototype.focus as jest.Mock;

    // Delete last digit → code "123", focus previous
    await fireEvent(digit(3), 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(digit(3).props.value).toBe('');
    expect(digit(2).props.value).toBe('3');
    await flushFocus();
    expect(focus).toHaveBeenCalled();
    focus.mockClear();

    // Delete from the (now focused) previous cell
    await fireEvent(digit(2), 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(digit(2).props.value).toBe('');
    expect(digit(1).props.value).toBe('2');
    await flushFocus();
    expect(focus).toHaveBeenCalled();
    focus.mockClear();

    await fireEvent(digit(1), 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(digit(1).props.value).toBe('');
    expect(digit(0).props.value).toBe('1');
    await flushFocus();
    expect(focus).toHaveBeenCalled();
  });

  it('moves to the previous input when onChangeText reports an empty string', async () => {
    await render(<Harness initial="98" />);
    const focus = TextInput.prototype.focus as jest.Mock;
    focus.mockClear();

    await fireEvent.changeText(digit(1), '');
    expect(digit(0).props.value).toBe('9');
    expect(digit(1).props.value).toBe('');
    await flushFocus();
    expect(focus).toHaveBeenCalled();
  });

  it('pastes a complete OTP code into the inputs', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);

    await fireEvent.changeText(digit(0), '1234');

    expect(digit(0).props.value).toBe('1');
    expect(digit(1).props.value).toBe('2');
    expect(digit(2).props.value).toBe('3');
    expect(digit(3).props.value).toBe('4');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('replaces a filled digit when a new one is typed over it', async () => {
    await render(<Harness initial="1234" />);

    // The platform reports the old digit plus the new one ("2" -> "25").
    await fireEvent.changeText(digit(1), '25');

    expect(digit(0).props.value).toBe('1');
    expect(digit(1).props.value).toBe('5');
    expect(digit(2).props.value).toBe('3');
    expect(digit(3).props.value).toBe('4');
  });

  it('replaces the last digit instead of keeping the old one', async () => {
    const onComplete = jest.fn();
    await render(<Harness initial="1234" onComplete={onComplete} />);

    await fireEvent.changeText(digit(3), '49');

    expect(digit(3).props.value).toBe('9');
    expect(onComplete).toHaveBeenLastCalledWith('1239');
  });

  it('strips non-digits when pasting', async () => {
    await render(<Harness />);
    await fireEvent.changeText(digit(0), '12a3');
    expect(digit(0).props.value).toBe('1');
    expect(digit(1).props.value).toBe('2');
    expect(digit(2).props.value).toBe('3');
    expect(digit(3).props.value).toBe('');
  });
});
