import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { Alert, Linking } from 'react-native';

import { i18n } from '@/lib/i18n';

import { MAINTENANCE_CENTERS } from '../data/maintenance-centers';
import { fitCamera } from '../utils/trip';

import { LocationScreen } from './location-screen';

type Coords = { latitude: number; longitude: number };

// Plain test positions. The app itself never hardcodes a user position.
const GPS_A: Coords = { latitude: 30.0444, longitude: 31.2357 };
const GPS_B: Coords = { latitude: 30.06, longitude: 31.25 };
const PICKED: Coords = { latitude: 30.1, longitude: 31.3 };

const mockLocation = {
  status: 'granted' as 'granted' | 'loading' | 'denied',
  coords: GPS_A as Coords | null,
  isApproximate: false,
  request: jest.fn(),
  refresh: jest.fn(),
};
const mockRetry = jest.fn();
const mockReverseGeocode = jest.fn();
// Latest props the screen passed to the (mocked) native map.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockMapProps: any;

jest.mock('../hooks/use-device-location', () => ({ useDeviceLocation: () => mockLocation }));
jest.mock('../hooks/use-reverse-geocode', () => ({
  useReverseGeocode: (coords: Coords | null) => mockReverseGeocode(coords),
}));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// The native map can't render in Jest: capture what the screen asks of it instead.
jest.mock('../components/device-map', () => ({
  DeviceMap: (props: unknown) => {
    mockMapProps = props;
    return null;
  },
}));

const clipboard = jest.mocked(Clipboard.setStringAsync);
const center = (id: string) => MAINTENANCE_CENTERS.find((c) => c.id === id)!;
const maadi = center('maadi');
const heliopolis = center('heliopolis');

function resolvedFor(coords: Coords | null) {
  return {
    address: coords
      ? {
          short: `Pt ${coords.latitude}`,
          full: `Address at ${coords.latitude},${coords.longitude}`,
        }
      : null,
    isLoading: false,
    isUnavailable: false,
    retry: mockRetry,
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
  mockLocation.status = 'granted';
  mockLocation.coords = GPS_A;
  mockReverseGeocode.mockImplementation(resolvedFor);
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});

afterAll(async () => {
  await i18n.changeLanguage('en');
});

async function search(text: string, label = 'To') {
  const input = screen.getByLabelText(label);
  await fireEvent(input, 'focus');
  await fireEvent.changeText(input, text);
}

async function chooseSuggestion(name: string) {
  await fireEvent.press(screen.getByText(name));
}

async function pickPoint(coords: Coords) {
  await fireEvent.press(screen.getByLabelText('Pick starting point on map'));
  await act(async () => mockMapProps.onPickPoint(coords));
}

describe('origin (From)', () => {
  it('defaults to the live GPS position with its resolved address', async () => {
    await render(<LocationScreen />);
    expect(mockReverseGeocode).toHaveBeenLastCalledWith(GPS_A);
    expect(screen.getAllByText('My location').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(`Address at ${GPS_A.latitude},${GPS_A.longitude}`).length,
    ).toBeGreaterThan(0);
    expect(mockMapProps.originMarker).toBeNull();
    expect(mockMapProps.userCoords).toEqual(GPS_A);
  });

  it('follows GPS when the device moves', async () => {
    const { rerender } = await render(<LocationScreen />);
    mockLocation.coords = GPS_B;
    await rerender(<LocationScreen />);
    expect(mockReverseGeocode).toHaveBeenLastCalledWith(GPS_B);
    expect(
      screen.getAllByText(`Address at ${GPS_B.latitude},${GPS_B.longitude}`).length,
    ).toBeGreaterThan(0);
  });

  it('turns on pick mode, then uses the tapped map point as the origin with its own address', async () => {
    await render(<LocationScreen />);
    await fireEvent.press(screen.getByLabelText('Pick starting point on map'));
    expect(mockMapProps.pickMode).toBe(true);
    expect(screen.getByText('Tap the map to choose a starting point')).toBeTruthy();

    await act(async () => mockMapProps.onPickPoint(PICKED));

    expect(mockMapProps.pickMode).toBe(false);
    expect(mockMapProps.originMarker).toEqual({
      coordinates: PICKED,
      title: 'Selected point',
    });
    expect(mockReverseGeocode).toHaveBeenLastCalledWith(PICKED);
    expect(screen.getAllByText('Selected point').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(`Address at ${PICKED.latitude},${PICKED.longitude}`).length,
    ).toBeGreaterThan(0);
    // The live blue dot keeps following GPS, separate from the picked origin.
    expect(mockMapProps.userCoords).toEqual(GPS_A);
    // The camera moves to the picked point.
    expect(mockMapProps.cameraRequest.target.coordinates).toEqual(PICKED);
  });

  it('ignores the map tap unless pick mode is on', async () => {
    await render(<LocationScreen />);
    expect(mockMapProps.pickMode).toBe(false);
  });

  it('goes back to live GPS with "Use my location" and with the recenter button', async () => {
    await render(<LocationScreen />);
    await pickPoint(PICKED);
    await fireEvent.press(screen.getByLabelText('Use my location'));
    expect(mockMapProps.originMarker).toBeNull();
    expect(mockReverseGeocode).toHaveBeenLastCalledWith(GPS_A);
    expect(mockMapProps.cameraRequest.target.coordinates).toEqual(GPS_A);

    await pickPoint(PICKED);
    await act(async () => mockMapProps.onRecenter());
    expect(mockMapProps.originMarker).toBeNull();
    expect(screen.getAllByText('My location').length).toBeGreaterThan(0);
  });

  it('explains when there is no GPS position yet and none was picked', async () => {
    mockLocation.coords = null;
    mockLocation.status = 'denied';
    mockReverseGeocode.mockImplementation(resolvedFor);
    await render(<LocationScreen />);
    expect(
      screen.getAllByText('Location unavailable. Pick a point on the map or search for a center.')
        .length,
    ).toBeGreaterThan(0);
    // Picking a point makes the trip usable without GPS.
    await pickPoint(PICKED);
    expect(screen.getAllByText('Selected point').length).toBeGreaterThan(0);
  });
});

describe('destination search (To) and suggestions', () => {
  it('lists every center nearest-first when the field is focused and empty', async () => {
    await render(<LocationScreen />);
    await fireEvent(screen.getByLabelText('To'), 'focus');
    // The list is capped; the nearest center to GPS_A is Downtown.
    expect(screen.getByText(center('downtown').name.en)).toBeTruthy();
  });

  it('filters suggestions as the user types in English', async () => {
    await render(<LocationScreen />);
    await search('maadi');
    expect(screen.getByText(maadi.name.en)).toBeTruthy();
    expect(screen.queryByText(center('nasr-city').name.en)).toBeNull();
  });

  it('filters suggestions as the user types in Arabic', async () => {
    await i18n.changeLanguage('ar');
    await render(<LocationScreen />);
    await search('المعادى', 'إلى');
    expect(screen.getByText(maadi.name.ar)).toBeTruthy();
    expect(screen.queryByText(center('nasr-city').name.ar)).toBeNull();
  });

  it('finds Arabic names while the UI is English, and vice versa', async () => {
    await render(<LocationScreen />);
    await search('مدينة نصر');
    expect(screen.getByText(center('nasr-city').name.en)).toBeTruthy();
  });

  it('shows distance in the suggestion subtitle', async () => {
    await render(<LocationScreen />);
    await search('maadi');
    expect(screen.getByText(/Maadi · \d+\.\d km/)).toBeTruthy();
  });

  it('says so when nothing matches', async () => {
    await render(<LocationScreen />);
    await search('zzzz');
    expect(screen.getByText('No matching maintenance centers')).toBeTruthy();
  });
});

describe('selecting a destination keeps everything in sync', () => {
  it('updates the map, route, camera, input and details sheet', async () => {
    await render(<LocationScreen />);
    await search('maadi');
    await chooseSuggestion(maadi.name.en);

    // Map state
    expect(mockMapProps.destinationId).toBe('maadi');
    expect(mockMapProps.route).toEqual([GPS_A, maadi.coordinates]);
    expect(mockMapProps.cameraRequest.target).toEqual(fitCamera(GPS_A, maadi.coordinates));
    expect(mockMapProps.centers).toHaveLength(MAINTENANCE_CENTERS.length);
    expect(mockMapProps.pickMode).toBe(false);

    // Input shows the chosen center and the suggestion list is gone.
    expect(screen.getByLabelText('To').props.value).toBe(maadi.name.en);
    expect(screen.queryByText('No matching maintenance centers')).toBeNull();

    // Details sheet
    expect(screen.getAllByText(maadi.name.en).length).toBeGreaterThan(0);
    expect(screen.getByText(maadi.address.en)).toBeTruthy();
    expect(screen.getByText(maadi.hours.en)).toBeTruthy();
    expect(screen.getByText(maadi.phone)).toBeTruthy();
    expect(screen.getByText(/km away \(straight line\)/)).toBeTruthy();
    expect(screen.getByText(/Approximate straight-line route/)).toBeTruthy();
    expect(screen.getByText('Call')).toBeTruthy();
    expect(screen.queryByText('My location')).not.toBeNull(); // still the From row
  });

  it('selects a center by tapping its marker, updating the input too', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('heliopolis'));
    expect(mockMapProps.destinationId).toBe('heliopolis');
    expect(mockMapProps.route).toEqual([GPS_A, heliopolis.coordinates]);
    expect(screen.getByLabelText('To').props.value).toBe(heliopolis.name.en);
    expect(screen.getByText(heliopolis.hours.en)).toBeTruthy();
  });

  it('redraws the route and camera from a newly picked origin', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await pickPoint(PICKED);
    expect(mockMapProps.route).toEqual([PICKED, maadi.coordinates]);
    expect(mockMapProps.cameraRequest.target).toEqual(fitCamera(PICKED, maadi.coordinates));
    expect(mockMapProps.destinationId).toBe('maadi');
  });

  it('keeps the route anchored to live GPS as the device moves', async () => {
    const { rerender } = await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    mockLocation.coords = GPS_B;
    await rerender(<LocationScreen />);
    expect(mockMapProps.route).toEqual([GPS_B, maadi.coordinates]);
  });

  it('shows the center details in Arabic', async () => {
    await i18n.changeLanguage('ar');
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    expect(screen.getAllByText(maadi.name.ar).length).toBeGreaterThan(0);
    expect(screen.getByText(maadi.address.ar)).toBeTruthy();
    expect(screen.getByText(maadi.hours.ar)).toBeTruthy();
  });

  it('ignores a marker that is not a known center', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('nope'));
    expect(mockMapProps.destinationId).toBeNull();
  });
});

describe('clearing or changing the destination', () => {
  it('resets the map, route, input and sheet back to the current location', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByLabelText('Clear destination'));

    expect(mockMapProps.destinationId).toBeNull();
    expect(mockMapProps.route).toBeNull();
    expect(screen.getByLabelText('To').props.value).toBe('');
    expect(screen.queryByText(maadi.phone)).toBeNull();
    expect(screen.queryByText('Call')).toBeNull();
    expect(screen.queryByText(/Approximate straight-line route/)).toBeNull();
    expect(screen.getAllByText('My location').length).toBeGreaterThan(1); // From row + sheet title
  });

  it('keeps the picked origin when the destination is cleared', async () => {
    await render(<LocationScreen />);
    await pickPoint(PICKED);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByLabelText('Clear destination'));
    expect(mockMapProps.originMarker?.coordinates).toEqual(PICKED);
  });

  it('drops the destination as soon as the user edits the search text', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.changeText(screen.getByLabelText('To'), 'nasr');
    expect(mockMapProps.destinationId).toBeNull();
    expect(mockMapProps.route).toBeNull();
  });
});

describe('Copy Address follows the sheet', () => {
  it('copies the resolved address of the origin when there is no destination', async () => {
    await render(<LocationScreen />);
    await fireEvent.press(screen.getByText('Copy Address'));
    await waitFor(() =>
      expect(clipboard).toHaveBeenCalledWith(`Address at ${GPS_A.latitude},${GPS_A.longitude}`),
    );
    expect(Alert.alert).toHaveBeenCalledWith('Address copied');
  });

  it('copies the address of a picked origin', async () => {
    await render(<LocationScreen />);
    await pickPoint(PICKED);
    await fireEvent.press(screen.getByText('Copy Address'));
    await waitFor(() =>
      expect(clipboard).toHaveBeenLastCalledWith(
        `Address at ${PICKED.latitude},${PICKED.longitude}`,
      ),
    );
  });

  it('copies the selected center address, then the origin again after clearing', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByText('Copy Address'));
    await waitFor(() => expect(clipboard).toHaveBeenLastCalledWith(maadi.address.en));

    await fireEvent.press(screen.getByLabelText('Clear destination'));
    await fireEvent.press(screen.getByText('Copy Address'));
    await waitFor(() =>
      expect(clipboard).toHaveBeenLastCalledWith(`Address at ${GPS_A.latitude},${GPS_A.longitude}`),
    );
  });

  it('copies the Arabic address when the app is in Arabic', async () => {
    await i18n.changeLanguage('ar');
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByText('نسخ العنوان'));
    await waitFor(() => expect(clipboard).toHaveBeenLastCalledWith(maadi.address.ar));
  });

  it('does not copy and says why when the origin address is unavailable', async () => {
    mockReverseGeocode.mockImplementation(() => ({
      address: null,
      isLoading: false,
      isUnavailable: true,
      retry: mockRetry,
    }));
    await render(<LocationScreen />);
    expect(screen.getAllByText('Address unavailable for this location').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByText('Try again'));
    expect(mockRetry).toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Copy Address'));
    expect(clipboard).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('No address available to copy yet.');
  });

  it('shows a failure message when the clipboard rejects', async () => {
    clipboard.mockRejectedValueOnce(new Error('no clipboard'));
    await render(<LocationScreen />);
    await fireEvent.press(screen.getByText('Copy Address'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Could not copy the address.'));
  });
});

describe('Open in Google Maps follows the trip', () => {
  it('opens the live origin when there is no destination', async () => {
    await render(<LocationScreen />);
    await fireEvent.press(screen.getByText('Open in Google Maps'));
    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.google.com/maps/search/?api=1&query=${GPS_A.latitude},${GPS_A.longitude}`,
      ),
    );
  });

  it('opens directions from the origin to the destination', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByText('Open in Google Maps'));
    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.google.com/maps/dir/?api=1&origin=${GPS_A.latitude},${GPS_A.longitude}&destination=${maadi.coordinates.latitude},${maadi.coordinates.longitude}`,
      ),
    );
  });

  it('uses a picked origin for the directions', async () => {
    await render(<LocationScreen />);
    await pickPoint(PICKED);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByText('Open in Google Maps'));
    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.google.com/maps/dir/?api=1&origin=${PICKED.latitude},${PICKED.longitude}&destination=${maadi.coordinates.latitude},${maadi.coordinates.longitude}`,
      ),
    );
  });
});

describe('Call button', () => {
  it('only appears for a selected center', async () => {
    await render(<LocationScreen />);
    expect(screen.queryByText('Call')).toBeNull();
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    expect(screen.getByText('Call')).toBeTruthy();
  });

  it('opens the dialer with the center phone number', async () => {
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByText('Call'));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith('tel:+20255500103'));
  });

  it('tells the user when the dialer cannot be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no dialer'));
    await render(<LocationScreen />);
    await act(async () => mockMapProps.onSelectCenter('maadi'));
    await fireEvent.press(screen.getByText('Call'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Could not open the phone dialer.'),
    );
  });
});
