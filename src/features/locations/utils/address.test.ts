import { formatAddress } from './address';

describe('formatAddress', () => {
  it('builds a short and a full address from geocoder fields', () => {
    expect(
      formatAddress({
        streetNumber: '5',
        street: 'Nile St',
        district: 'Zamalek',
        city: 'Cairo',
        country: 'Egypt',
      }),
    ).toEqual({ short: '5 Nile St', full: '5 Nile St, Zamalek, Cairo, Egypt' });
  });

  it('prefers the geocoder formattedAddress for the full address', () => {
    expect(
      formatAddress({ street: 'Nile St', formattedAddress: 'Nile St, Cairo 11211' })?.full,
    ).toBe('Nile St, Cairo 11211');
  });

  it('does not repeat identical parts', () => {
    expect(formatAddress({ name: 'Cairo', city: 'Cairo', country: 'Egypt' })?.full).toBe(
      'Cairo, Egypt',
    );
  });

  it('returns null when the geocoder has nothing usable', () => {
    expect(formatAddress(null)).toBeNull();
    expect(formatAddress({})).toBeNull();
    expect(formatAddress({ street: '  ', city: null })).toBeNull();
  });
});
