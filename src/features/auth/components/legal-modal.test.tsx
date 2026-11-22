import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LegalModal } from './legal-modal';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderModal(ui: React.ReactElement) {
  return render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);
}

describe('LegalModal', () => {
  it('shows nothing while no document is chosen', async () => {
    await renderModal(<LegalModal document={null} onClose={jest.fn()} />);

    expect(screen.queryByText('Privacy Policy')).toBeNull();
    expect(screen.queryByText('Terms of Use')).toBeNull();
  });

  it('shows the privacy policy', async () => {
    await renderModal(<LegalModal document="privacy" onClose={jest.fn()} />);

    expect(screen.getByText('Privacy Policy')).toBeOnTheScreen();
    expect(screen.getByText('What we collect')).toBeOnTheScreen();
  });

  it('shows the terms of use', async () => {
    await renderModal(<LegalModal document="terms" onClose={jest.fn()} />);

    expect(screen.getByText('Terms of Use')).toBeOnTheScreen();
    expect(screen.getByText('Your account')).toBeOnTheScreen();
  });

  it('closes from the Close button', async () => {
    const onClose = jest.fn();
    await renderModal(<LegalModal document="terms" onClose={onClose} />);

    await fireEvent.press(screen.getByText('Close'));

    expect(onClose).toHaveBeenCalled();
  });
});
