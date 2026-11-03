import { render, screen } from '@testing-library/react-native';

import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders the label with an accessible status description', async () => {
    await render(<StatusBadge label="Completed" tone="success" />);
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByLabelText('Status: Completed')).toBeTruthy();
  });
});
