import type { ServiceTypeId } from '@/features/services';

export type Localized = { en: string; ar: string };

export type ChecklistStep = {
  id: string;
  label: Localized;
  /** `done` is crossed out, `active` is being worked on, `pending` is faded. */
  state: 'done' | 'active' | 'pending';
};

/** The service the car is in for right now. */
export type OngoingService = {
  id: string;
  title: Localized;
  center: Localized;
  /** The maintenance center's id, so the name can open it on the map. */
  centerId: string;
  steps: ChecklistStep[];
  /** When the car should be ready, as display text. */
  readyDate: Localized;
  readyTime: Localized;
};

/** A booked or finished service, as listed under Services & Booking. */
export type BookedService = {
  id: string;
  title: Localized;
  date: Localized;
  status: 'upcoming' | 'completed';
  /** What to pre-select when the booking is rescheduled. */
  serviceType: ServiceTypeId;
};

export type DuePayment = {
  id: string;
  title: Localized;
  dueDate: Localized;
  /** In whole currency units. */
  amount: number;
};
