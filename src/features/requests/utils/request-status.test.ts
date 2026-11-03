import { getRequestStatusDisplay } from './request-status';

describe('getRequestStatusDisplay', () => {
  it('maps known statuses', () => {
    expect(getRequestStatusDisplay('awaiting_approval')).toEqual({
      label: 'Needs approval',
      tone: 'warning',
    });
  });

  it('falls back for statuses the app does not know yet', () => {
    expect(getRequestStatusDisplay('parts_on_order')).toEqual({
      label: 'parts on order',
      tone: 'neutral',
    });
  });
});
