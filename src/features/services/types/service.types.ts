export type Localized = { en: string; ar: string };

export type ServiceStatus = 'ongoing' | 'upcoming' | 'completed';

/** A service that is under way or booked for later. */
export type ActiveService = {
  id: string;
  title: Localized;
  center: Localized;
  status: Extract<ServiceStatus, 'ongoing' | 'upcoming'>;
  /** When the appointment is, as display text. */
  appointment: Localized;
};

/** A finished (and paid) service. */
export type ServiceHistoryItem = {
  id: string;
  title: Localized;
  status: Extract<ServiceStatus, 'completed'>;
  /** The completion date, as display text. */
  completedOn: Localized;
  /** Amount paid, in whole currency units. */
  amount: number;
  currency: string;
};
