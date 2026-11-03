import { getVehicleStatusDisplay } from './vehicle-status';

describe('getVehicleStatusDisplay', () => {
  it('maps known statuses', () => {
    expect(getVehicleStatusDisplay('needs_attention')).toEqual({
      label: 'Needs attention',
      tone: 'warning',
    });
  });

  it('falls back for statuses the app does not know yet', () => {
    expect(getVehicleStatusDisplay('recalled')).toEqual({ label: 'recalled', tone: 'neutral' });
  });
});
