import { fireEvent, render, screen } from '@testing-library/react-native';

import '@/lib/i18n';

import { ServiceCard } from './service-card';

jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));

const baseProps = {
  title: 'Tire Pressure Check',
  subtitle: 'Sheikh Zayed Center',
  statusLabel: 'Ongoing',
  footer: 'Appt: Today, 03:30 PM',
  actionLabel: 'Track Service',
};

describe('ServiceCard', () => {
  it('shows the title, subtitle, status, footer and action', async () => {
    await render(<ServiceCard {...baseProps} />);
    expect(screen.getByText('Tire Pressure Check')).toBeTruthy();
    expect(screen.getByText('Sheikh Zayed Center')).toBeTruthy();
    expect(screen.getByText('Ongoing')).toBeTruthy();
    expect(screen.getByText('Appt: Today, 03:30 PM')).toBeTruthy();
    expect(screen.getByText('Track Service')).toBeTruthy();
  });

  it('calls onAction when the action button is pressed', async () => {
    const onAction = jest.fn();
    await render(<ServiceCard {...baseProps} onAction={onAction} />);
    await fireEvent.press(screen.getByText('Track Service'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('supports the outlined action button', async () => {
    await render(<ServiceCard {...baseProps} actionLabel="View Details" actionVariant="outline" />);
    expect(screen.getByText('View Details')).toBeTruthy();
  });
});
