import { fireEvent, render, screen } from '@testing-library/react-native';

import { SelectField } from './select-field';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

const options = [
  { value: '5', label: '5K Maintenance' },
  { value: '10', label: '10K Maintenance' },
];

function setup(props: Partial<React.ComponentProps<typeof SelectField>> = {}) {
  const onChange = jest.fn();
  const view = render(
    <SelectField
      label="Service Type"
      required
      placeholder="Select maintenance"
      options={options}
      value={null}
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange, view };
}

describe('SelectField', () => {
  it('shows the label with a required mark and the placeholder when nothing is selected', async () => {
    await setup().view;
    expect(screen.getByText('Service Type *')).toBeTruthy();
    expect(screen.getByText('Select maintenance')).toBeTruthy();
    expect(screen.queryByText('10K Maintenance')).toBeNull();
  });

  it('shows the selected option instead of the placeholder', async () => {
    await setup({ value: '10' }).view;
    expect(screen.getByText('10K Maintenance')).toBeTruthy();
    expect(screen.queryByText('Select maintenance')).toBeNull();
  });

  it('opens the options when pressed and reports the expanded state', async () => {
    await setup().view;
    const field = screen.getByRole('button', { name: 'Service Type *' });
    expect(field.props.accessibilityState.expanded).toBe(false);
    await fireEvent.press(field);
    expect(
      screen.getByRole('button', { name: 'Service Type *' }).props.accessibilityState.expanded,
    ).toBe(true);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('calls onChange with the chosen value and closes the list', async () => {
    const { onChange, view } = setup();
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Service Type *' }));
    await fireEvent.press(screen.getByRole('radio', { name: '5K Maintenance' }));
    expect(onChange).toHaveBeenCalledWith('5');
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('marks the current option as selected in the list', async () => {
    await setup({ value: '10' }).view;
    await fireEvent.press(screen.getByRole('button', { name: 'Service Type *' }));
    expect(
      screen.getByRole('radio', { name: '10K Maintenance' }).props.accessibilityState.selected,
    ).toBe(true);
    expect(
      screen.getByRole('radio', { name: '5K Maintenance' }).props.accessibilityState.selected,
    ).toBe(false);
  });

  it('does not open when disabled', async () => {
    await setup({ disabled: true, value: '5' }).view;
    expect(screen.getByText('5K Maintenance')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Service Type *' }));
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('shows an error message', async () => {
    await setup({ error: 'Required' }).view;
    expect(screen.getByText('Required')).toBeTruthy();
  });
});
