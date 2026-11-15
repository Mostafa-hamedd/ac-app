export type PaymentResult = { status: 'success'; transactionCode: string } | { status: 'failed' };

/** How long the fake gateway "processes" a payment. */
export const MOCK_PAYMENT_DELAY_MS = 1200;

/**
 * FICTIONAL MOCK DATA: the outcome of each payment attempt, in order, repeating. The first
 * attempt fails and the retry succeeds, so one pass through the flow shows both result screens.
 * Use ['success'] to always succeed. Replace this file with the real payment API.
 */
export const MOCK_PAYMENT_PLAN: readonly ('success' | 'failed')[] = ['failed', 'success'];

let attempt = 0;

/** Restarts the plan from the first attempt. */
export function resetMockPayments(): void {
  attempt = 0;
}

/** Pretends to charge the saved card and reports how it went. Never rejects. */
export async function processMockPayment(): Promise<PaymentResult> {
  const outcome = MOCK_PAYMENT_PLAN[attempt % MOCK_PAYMENT_PLAN.length]!;
  attempt += 1;
  await new Promise((resolve) => setTimeout(resolve, MOCK_PAYMENT_DELAY_MS));
  if (outcome === 'failed') return { status: 'failed' };
  // Seven digits, like the Figma "#6754728".
  const transactionCode = String(Math.floor(1_000_000 + Math.random() * 9_000_000));
  return { status: 'success', transactionCode };
}
