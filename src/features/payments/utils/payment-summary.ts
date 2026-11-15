export type PaymentLineId = 'labour' | 'parts' | 'inspection';

export type PaymentLine = { id: PaymentLineId; amount: number };

export type PaymentSummary = {
  lines: PaymentLine[];
  subtotal: number;
  taxesAndFees: number;
  total: number;
};

/** FICTIONAL MOCK DATA: a flat fee added to every invoice. */
export const TAXES_AND_FEES = 50;

/**
 * FICTIONAL MOCK DATA: splits an estimated cost into invoice lines (60% labour, 30% parts, the
 * rest inspection) and adds the flat taxes and fees. Replace with the real invoice from the
 * backend when it exists.
 */
export function buildPaymentSummary(cost: number): PaymentSummary {
  const labour = Math.round(cost * 0.6);
  const parts = Math.round(cost * 0.3);
  const inspection = cost - labour - parts;
  return {
    lines: [
      { id: 'labour', amount: labour },
      { id: 'parts', amount: parts },
      { id: 'inspection', amount: inspection },
    ],
    subtotal: cost,
    taxesAndFees: TAXES_AND_FEES,
    total: cost + TAXES_AND_FEES,
  };
}
