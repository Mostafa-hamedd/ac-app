import { fireEvent, render, screen } from '@testing-library/react-native';

import { i18n } from '@/lib/i18n';

import { RescheduleSheet } from './reschedule-sheet';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
// The services feature's index pulls in its screens (native keyboard module); only these two are used.
jest.mock('@/features/services', () => ({
  formatSlot: jest.requireActual('@/features/services/utils/format-slot').formatSlot,
  TIME_SLOTS: jest.requireActual('@/features/services/data/booking-options').TIME_SLOTS,
}));
jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  return {
    BottomSheetModal: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    BottomSheetView: View,
    BottomSheetBackdrop: () => null,
  };
});

// Friday 20 November 2026, 12:00. The calendar reads the real clock, so freeze only the Date:
// timers stay real so Testing Library's async helpers keep working.
const NOW = new Date(2026, 10, 20, 12, 0);

beforeEach(async () => {
  jest.useFakeTimers({
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'nextTick',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'performance',
      'hrtime',
    ],
  });
  jest.setSystemTime(NOW);
  await i18n.changeLanguage('en');
});

afterEach(() => {
  jest.useRealTimers();
});

function pickFirstEnabledDay() {
  const days = screen
    .getAllByRole('button')
    .filter(
      (node) =>
        node.props.accessibilityState?.disabled === false &&
        /day,/i.test(String(node.props.accessibilityLabel)),
    );
  return days[0]!;
}

describe('RescheduleSheet', () => {
  it('shows the title, both fields and a disabled Update', async () => {
    await render(<RescheduleSheet onUpdate={jest.fn()} />);
    expect(screen.getByText('Reschedule Booking')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Appointment Date' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Appointment Time' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Update' }).props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it('sends the chosen date and time when Update is pressed', async () => {
    const onUpdate = jest.fn();
    // A moment long before any day shown, so no time slot counts as already passed.
    await render(<RescheduleSheet onUpdate={onUpdate} now={new Date(2000, 0, 1)} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Appointment Date' }));
    await fireEvent.press(pickFirstEnabledDay());
    await fireEvent.press(screen.getByRole('button', { name: 'Appointment Time' }));
    await fireEvent.press(screen.getByRole('radio', { name: '10:00 AM' }));

    const update = screen.getByRole('button', { name: 'Update' });
    expect(update.props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(update);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const [date, time] = onUpdate.mock.calls[0];
    expect(date).toBeInstanceOf(Date);
    expect(time).toBe('10:00');
  });

  describe('when the new day is today', () => {
    // At NOW the 09:00, 10:00 and 11:00 slots are over, 15:30 is not.
    const slot = (label: string) => screen.getByRole('radio', { name: label });

    async function openTimesForToday() {
      await fireEvent.press(screen.getByRole('button', { name: 'Appointment Date' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Friday, November 20' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Appointment Time' }));
    }

    it('disables the times that have already passed', async () => {
      await render(<RescheduleSheet onUpdate={jest.fn()} now={NOW} />);
      await openTimesForToday();
      for (const label of ['09:00 AM', '10:00 AM', '11:00 AM']) {
        expect(slot(label).props.accessibilityState.disabled).toBe(true);
      }
      expect(slot('03:30 PM').props.accessibilityState.disabled).toBe(false);
    });

    it('allows every time on a later day', async () => {
      await render(<RescheduleSheet onUpdate={jest.fn()} now={NOW} />);
      await fireEvent.press(screen.getByRole('button', { name: 'Appointment Date' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Saturday, November 21' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Appointment Time' }));
      expect(slot('09:00 AM').props.accessibilityState.disabled).toBe(false);
    });

    it('clears a chosen time that is already over on the day then picked', async () => {
      await render(<RescheduleSheet onUpdate={jest.fn()} now={NOW} />);
      // Pick 09:00 for tomorrow, then switch the date to today.
      await fireEvent.press(screen.getByRole('button', { name: 'Appointment Date' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Saturday, November 21' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Appointment Time' }));
      await fireEvent.press(slot('09:00 AM'));
      await fireEvent.press(screen.getByRole('button', { name: /Appointment Date/ }));
      await fireEvent.press(screen.getByRole('button', { name: 'Friday, November 20' }));
      expect(screen.queryByText('09:00 AM')).toBeNull();
      expect(screen.getByRole('button', { name: 'Update' }).props.accessibilityState.disabled).toBe(
        true,
      );
    });
  });

  it('reads in Arabic', async () => {
    await i18n.changeLanguage('ar');
    await render(<RescheduleSheet onUpdate={jest.fn()} />);
    expect(screen.getByText('إعادة جدولة الحجز')).toBeTruthy();
  });
});
