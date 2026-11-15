import { MOCK_PAYMENT_PLAN, processMockPayment, resetMockPayments } from './payment-gateway.mock';

beforeEach(() => {
  jest.useFakeTimers();
  resetMockPayments();
});

afterEach(() => {
  jest.useRealTimers();
});

async function attempt() {
  const promise = processMockPayment();
  await jest.runAllTimersAsync();
  return promise;
}

describe('processMockPayment', () => {
  it('follows the plan: the first attempt fails and the retry succeeds', async () => {
    expect(MOCK_PAYMENT_PLAN).toEqual(['failed', 'success']);
    expect(await attempt()).toEqual({ status: 'failed' });
    const second = await attempt();
    expect(second.status).toBe('success');
  });

  it('gives a seven digit transaction code on success', async () => {
    await attempt();
    const result = await attempt();
    expect(result).toMatchObject({ status: 'success' });
    expect((result as { transactionCode: string }).transactionCode).toMatch(/^\d{7}$/);
  });

  it('starts over after a reset', async () => {
    await attempt();
    await attempt();
    resetMockPayments();
    expect((await attempt()).status).toBe('failed');
  });
});
