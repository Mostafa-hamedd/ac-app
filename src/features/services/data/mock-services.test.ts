import { MOCK_ACTIVE_SERVICES, MOCK_DATA_DISCLAIMER, MOCK_SERVICE_HISTORY } from './mock-services';

describe('services mock data', () => {
  const all = [...MOCK_ACTIVE_SERVICES, ...MOCK_SERVICE_HISTORY];

  it('has unique ids and bilingual titles', () => {
    const ids = all.map((service) => service.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const service of all) {
      expect(service.title.en.trim()).not.toBe('');
      expect(service.title.ar.trim()).not.toBe('');
    }
  });

  it('matches the Figma content: two active services and one finished one', () => {
    expect(MOCK_ACTIVE_SERVICES.map((s) => s.status)).toEqual(['ongoing', 'upcoming']);
    expect(MOCK_SERVICE_HISTORY).toHaveLength(1);
    expect(MOCK_SERVICE_HISTORY[0]).toMatchObject({
      status: 'completed',
      amount: 1500,
      currency: 'EGP',
    });
  });

  it('is documented as fictional', () => {
    expect(MOCK_DATA_DISCLAIMER).toContain('FICTIONAL MOCK DATA');
  });
});
