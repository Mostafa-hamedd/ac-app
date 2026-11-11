import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { type TextInputInstance, View } from 'react-native';

import { Input } from './input';

jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));

describe('Input (floating, default)', () => {
  it('shows the label and passes TextInput props through', async () => {
    const onChangeText = jest.fn();
    await render(
      <Input
        label="Email"
        value=""
        onChangeText={onChangeText}
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={30}
        testID="field"
      />,
    );
    expect(screen.getByText('Email')).toBeTruthy();
    const field = screen.getByTestId('field');
    expect(field.props.keyboardType).toBe('email-address');
    expect(field.props.autoCapitalize).toBe('none');
    expect(field.props.maxLength).toBe(30);
    await fireEvent.changeText(field, 'a@b.co');
    expect(onChangeText).toHaveBeenCalledWith('a@b.co');
  });

  it('shows the placeholder only once the label has floated', async () => {
    const { rerender } = await render(
      <Input label="Name" placeholder="Jane" value="" testID="field" />,
    );
    expect(screen.getByTestId('field').props.placeholder).toBeUndefined();
    await fireEvent(screen.getByTestId('field'), 'focus');
    expect(screen.getByTestId('field').props.placeholder).toBe('Jane');
    await rerender(<Input label="Name" placeholder="Jane" value="x" testID="field" />);
    expect(screen.getByTestId('field').props.placeholder).toBe('Jane');
  });

  it('shows an error (replacing helper text) and exposes it as the accessibility hint', async () => {
    await render(
      <Input label="Pw" helperText="At least 8 characters" error="Too short" testID="field" />,
    );
    expect(screen.getByText('Too short')).toBeTruthy();
    expect(screen.queryByText('At least 8 characters')).toBeNull();
    expect(screen.getByTestId('field').props.accessibilityHint).toBe('Too short');
  });

  it('shows helper text when there is no error', async () => {
    await render(<Input label="Pw" helperText="At least 8 characters" />);
    expect(screen.getByText('At least 8 characters')).toBeTruthy();
  });

  it('renders leading and trailing content', async () => {
    await render(
      <Input label="Phone" leading={<View testID="lead" />} trailing={<View testID="trail" />} />,
    );
    expect(screen.getByTestId('lead')).toBeTruthy();
    expect(screen.getByTestId('trail')).toBeTruthy();
  });

  it('is not editable when disabled', async () => {
    await render(<Input label="Locked" disabled testID="field" />);
    expect(screen.getByTestId('field').props.editable).toBe(false);
  });

  it('forwards a ref to the native input', async () => {
    const ref = createRef<TextInputInstance>();
    await render(<Input label="Ref" ref={ref} />);
    expect(ref.current).toBeTruthy();
  });

  it('applies the size', async () => {
    await render(<Input label="Small" size="sm" testID="field" />);
    expect(String(screen.getByTestId('field').props.className)).toContain('h-12');
  });
});

describe('Input (outline)', () => {
  it('shows the label above and a real placeholder', async () => {
    await render(<Input variant="outline" label="City" placeholder="Cairo" testID="field" />);
    expect(screen.getByText('City')).toBeTruthy();
    expect(screen.getByTestId('field').props.placeholder).toBe('Cairo');
  });

  it('shows errors and the disabled state', async () => {
    await render(<Input variant="outline" label="City" error="Required" disabled testID="field" />);
    expect(screen.getByText('Required')).toBeTruthy();
    expect(screen.getByTestId('field').props.editable).toBe(false);
  });
});

describe('Input (outline, multiline)', () => {
  it('is a text area that passes multiline props through and has no fixed height', async () => {
    const onChangeText = jest.fn();
    await render(
      <Input
        variant="outline"
        label="Notes"
        placeholder="Describe"
        multiline
        numberOfLines={4}
        onChangeText={onChangeText}
        testID="field"
      />,
    );
    const field = screen.getByTestId('field');
    expect(field.props.multiline).toBe(true);
    expect(field.props.numberOfLines).toBe(4);
    expect(String(field.props.className)).toContain('min-h-24');
    expect(String(field.props.className)).not.toContain('h-14');
    await fireEvent.changeText(field, 'Strange noise');
    expect(onChangeText).toHaveBeenCalledWith('Strange noise');
  });
});

describe('Input (bare)', () => {
  it('renders only the input, labelled for screen readers', async () => {
    await render(
      <Input
        variant="bare"
        label="Search"
        placeholder="Find"
        testID="field"
        returnKeyType="search"
      />,
    );
    expect(screen.queryByText('Search')).toBeNull();
    const field = screen.getByTestId('field');
    expect(field.props.accessibilityLabel).toBe('Search');
    expect(field.props.placeholder).toBe('Find');
    expect(field.props.returnKeyType).toBe('search');
  });

  it('lets callers restyle the text through inputClassName', async () => {
    await render(<Input variant="bare" inputClassName="font-sans-semibold" testID="field" />);
    expect(String(screen.getByTestId('field').props.className)).toContain('font-sans-semibold');
  });
});
