import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { BookNewServiceScreen } from './book-new-service-screen';

let mockParams: { type?: string } = {};

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = require('react-native');
  return { KeyboardAwareScrollView: ScrollView };
});
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: View,
  };
});
// The locations feature also pulls in the native map; only its center list is needed here.
jest.mock('@/features/locations', () => ({
  MAINTENANCE_CENTERS: jest.requireActual('../../locations/data/maintenance-centers')
    .MAINTENANCE_CENTERS,
}));

/** Renders the screen and waits for the vehicle list, which loads asynchronously. */
async function renderScreen() {
  const view = await renderWithProviders(<BookNewServiceScreen />);
  await waitFor(() => expect(screen.getAllByRole('button').length).toBeGreaterThan(0));
  await screen.findByRole('button', {
    name: i18n.language === 'ar' ? /طراز السيارة/ : /Car Model/,
  });
  await waitFor(() => expect(screen.queryByText(/Select your car|اختر سيارتك/)).toBeNull());
  return view;
}

const confirm = () => screen.getByRole('button', { name: 'Confirm Booking' });
const confirmDisabled = () => confirm().props.accessibilityState.disabled;
const futureDay = () => {
  const days = screen.getAllByLabelText(/^\w+day, \w+ \d+$/);
  return days[days.length - 1]!;
};

async function openSelect(name: string) {
  await fireEvent.press(screen.getByRole('button', { name }));
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockParams = { type: 'regularMaintenance' };
  await i18n.changeLanguage('en');
});

describe('BookNewServiceScreen: header and shared fields', () => {
  it('goes back to the service type screen', async () => {
    await renderScreen();
    expect(screen.getByText('Book New Service')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(router.navigate).toHaveBeenCalledWith('/book-service');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('shows the car chosen in My Garage in a disabled field without options', async () => {
    await renderScreen();
    expect(await screen.findByText('Toyota Corolla 2022')).toBeTruthy();
    const field = screen.getByRole('button', { name: 'Car Model *' });
    expect(field.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(field);
    expect(screen.queryByRole('radio', { name: 'Honda CR-V 2021' })).toBeNull();
  });

  it('lists the maintenance centers to choose from', async () => {
    await renderScreen();
    await openSelect('Service Center *');
    expect(screen.getByRole('radio', { name: 'AutoConnect Maadi Center' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'AutoConnect Maadi Center' }));
    expect(screen.getByText('AutoConnect Maadi Center')).toBeTruthy();
  });

  it('shows the calendar and the four time slots', async () => {
    await renderScreen();
    expect(screen.getByText('Appointment Details')).toBeTruthy();
    expect(screen.getAllByLabelText(/^\w+day, \w+ \d+$/)).toHaveLength(14);
    expect(screen.getByText('Select Time Slot *')).toBeTruthy();
    for (const slot of ['09:00 AM', '10:00 AM', '11:00 AM', '03:30 PM']) {
      expect(screen.getByText(slot)).toBeTruthy();
    }
  });

  it('shows the terms text', async () => {
    await renderScreen();
    expect(
      screen.getByText(
        "By booking a new service, you agree to AutoConnect's Terms and Conditions.",
      ),
    ).toBeTruthy();
  });
});

describe('BookNewServiceScreen: Regular Maintenance', () => {
  it('shows the maintenance select and no notes text area', async () => {
    await renderScreen();
    expect(screen.getByRole('button', { name: 'Service Type *' })).toBeTruthy();
    expect(screen.getByText('Select maintenance')).toBeTruthy();
    expect(screen.queryByLabelText(/details$/)).toBeNull();
    expect(screen.queryByPlaceholderText(/Tell us what you need/)).toBeNull();
  });

  it('offers the km packages and shows the chosen one', async () => {
    await renderScreen();
    await openSelect('Service Type *');
    for (const km of [5, 10, 20, 30, 40, 50]) {
      expect(screen.getByRole('radio', { name: `${km}K Maintenance` })).toBeTruthy();
    }
    await fireEvent.press(screen.getByRole('radio', { name: '10K Maintenance' }));
    expect(screen.getByText('10K Maintenance')).toBeTruthy();
  });

  it('updates the estimated cost with the chosen package', async () => {
    await renderScreen();
    expect(screen.getByText('Estimated Cost')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
    await openSelect('Service Type *');
    await fireEvent.press(screen.getByRole('radio', { name: '10K Maintenance' }));
    expect(screen.getByText('EGP 12,000')).toBeTruthy();
    await openSelect('Service Type *');
    await fireEvent.press(screen.getByRole('radio', { name: '50K Maintenance' }));
    expect(screen.getByText('EGP 26,000')).toBeTruthy();
  });

  it('keeps Confirm disabled until the package, center, date and time are all chosen', async () => {
    await renderScreen();
    await screen.findByText('Toyota Corolla 2022');
    expect(confirmDisabled()).toBe(true);

    await openSelect('Service Center *');
    await fireEvent.press(screen.getByRole('radio', { name: 'AutoConnect Maadi Center' }));
    await fireEvent.press(futureDay());
    await fireEvent.press(screen.getByText('10:00 AM'));
    // Everything but the maintenance package is filled in.
    expect(confirmDisabled()).toBe(true);

    await openSelect('Service Type *');
    await fireEvent.press(screen.getByRole('radio', { name: '20K Maintenance' }));
    expect(confirmDisabled()).toBe(false);
  });
});

describe('BookNewServiceScreen: other services', () => {
  beforeEach(() => {
    mockParams = { type: 'tireService' };
  });

  it('hides the maintenance select and shows a notes text area instead', async () => {
    await renderScreen();
    expect(screen.queryByRole('button', { name: 'Service Type *' })).toBeNull();
    expect(screen.queryByText('Select maintenance')).toBeNull();

    const notes = screen.getByLabelText('Tire Service details');
    expect(notes.props.multiline).toBe(true);
    expect(notes.props.placeholder).toBe('Tell us what you need or what you noticed…');
  });

  it('puts the text area under the calendar', async () => {
    await renderScreen();
    const tree = JSON.stringify(screen.toJSON());
    const calendar = tree.indexOf('Saturday, ');
    const notes = tree.indexOf('Tire Service details');
    expect(calendar).toBeGreaterThan(-1);
    expect(notes).toBeGreaterThan(calendar);
  });

  it('lets the user type notes', async () => {
    await renderScreen();
    const notes = screen.getByLabelText('Tire Service details');
    await fireEvent.changeText(notes, 'Front left tire loses pressure');
    expect(screen.getByLabelText('Tire Service details').props.value).toBe(
      'Front left tire loses pressure',
    );
  });

  it('names the selected service in the text area label', async () => {
    mockParams = { type: 'acService' };
    await renderScreen();
    expect(screen.getByLabelText('AC Service details')).toBeTruthy();
  });

  it('shows the fixed price, or "To be quoted" for Other', async () => {
    await renderScreen();
    expect(screen.getByText('EGP 800')).toBeTruthy();
  });

  it('shows "To be quoted" for the Other service', async () => {
    mockParams = { type: 'other' };
    await renderScreen();
    expect(screen.getByText('To be quoted')).toBeTruthy();
    expect(screen.getByLabelText('Other details')).toBeTruthy();
  });

  it('enables Confirm without a package or notes once center, date and time are chosen', async () => {
    await renderScreen();
    await screen.findByText('Toyota Corolla 2022');
    expect(confirmDisabled()).toBe(true);

    await openSelect('Service Center *');
    await fireEvent.press(screen.getByRole('radio', { name: 'AutoConnect Maadi Center' }));
    await fireEvent.press(futureDay());
    await fireEvent.press(screen.getByText('03:30 PM'));
    await waitFor(() => expect(confirmDisabled()).toBe(false));
  });

  it('treats an unknown or missing service type like Other', async () => {
    mockParams = { type: 'nonsense' };
    await renderScreen();
    expect(screen.queryByRole('button', { name: 'Service Type *' })).toBeNull();
    expect(screen.getByLabelText('Other details')).toBeTruthy();
  });
});

describe('BookNewServiceScreen: Arabic', () => {
  it('translates the form and the regular maintenance packages', async () => {
    await i18n.changeLanguage('ar');
    await renderScreen();
    expect(screen.getByText('حجز خدمة جديدة')).toBeTruthy();
    expect(screen.getByText('التكلفة التقديرية')).toBeTruthy();
    expect(screen.getByText('تفاصيل الموعد')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'نوع الخدمة *' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'تأكيد الحجز' })).toBeTruthy();
    await openSelect('نوع الخدمة *');
    expect(screen.getAllByRole('radio', { name: /^صيانة .* ألف كم$/ })).toHaveLength(6);
  });

  it('shows the notes text area, with the service name, for other services', async () => {
    await i18n.changeLanguage('ar');
    mockParams = { type: 'tireService' };
    await renderScreen();
    expect(screen.getByLabelText('تفاصيل خدمة الإطارات')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'نوع الخدمة *' })).toBeNull();
  });
});
