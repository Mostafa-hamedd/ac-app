import { getPaymentStatusDisplay } from './payment-status';

describe('getPaymentStatusDisplay', () => {
  it('maps known statuses', () => {
    expect(getPaymentStatusDisplay('failed')).toEqual({ label: 'Failed', tone: 'danger' });
  });

  it('falls back for statuses the app does not know yet', () => {
    expect(getPaymentStatusDisplay('disputed')).toEqual({ label: 'disputed', tone: 'neutral' });
  });
});
