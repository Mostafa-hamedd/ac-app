import { fireEvent, render, screen } from '@testing-library/react-native';

import { i18n } from '@/lib/i18n';

import { ServicesBookingHeader } from './services-booking-header';

jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));

afterEach(async () => {
  await i18n.changeLanguage('en');
});

describe('ServicesBookingHeader', () => {
  it('shows the section title and the Book New button', async () => {
    await render(<ServicesBookingHeader onBookNew={jest.fn()} />);
    expect(screen.getByText('Services & Booking')).toBeTruthy();
    expect(screen.getByText('Book New')).toBeTruthy();
  });

  it('calls onBookNew when the button is pressed', async () => {
    const onBookNew = jest.fn();
    await render(<ServicesBookingHeader onBookNew={onBookNew} />);
    await fireEvent.press(screen.getByText('Book New'));
    expect(onBookNew).toHaveBeenCalledTimes(1);
  });

  it('is translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await render(<ServicesBookingHeader onBookNew={jest.fn()} />);
    expect(screen.getByText('الخدمات والحجز')).toBeTruthy();
    expect(screen.getByText('احجز الآن')).toBeTruthy();
  });
});
