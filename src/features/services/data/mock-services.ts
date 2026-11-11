import type { ActiveService, ServiceHistoryItem } from '../types/service.types';

/** Shown in code and asserted in tests so nobody mistakes this data for real bookings. */
export const MOCK_DATA_DISCLAIMER =
  'FICTIONAL MOCK DATA: invented services, dates and prices. Replace with API data when a backend exists.';

/** FICTIONAL MOCK DATA. Services that are ongoing or booked. */
export const MOCK_ACTIVE_SERVICES: readonly ActiveService[] = [
  {
    id: 'svc-tire-pressure',
    title: { en: 'Tire Pressure Check', ar: 'فحص ضغط الإطارات' },
    center: { en: 'Sheikh Zayed Center', ar: 'مركز الشيخ زايد' },
    status: 'ongoing',
    appointment: { en: 'Today, 03:30 PM', ar: 'اليوم، ٠٣:٣٠ م' },
  },
  {
    id: 'svc-10k-maintenance',
    title: { en: '10K Maintenance', ar: 'صيانة ١٠ آلاف كم' },
    center: { en: 'Sheikh Zayed Center', ar: 'مركز الشيخ زايد' },
    status: 'upcoming',
    appointment: { en: '7 May 2025', ar: '٧ مايو ٢٠٢٥' },
  },
];

/** FICTIONAL MOCK DATA. Finished services. */
export const MOCK_SERVICE_HISTORY: readonly ServiceHistoryItem[] = [
  {
    id: 'svc-transmission-fluid',
    title: { en: 'Transmission Fluid Change', ar: 'تغيير زيت ناقل الحركة' },
    status: 'completed',
    completedOn: { en: '11 Sep 2023', ar: '١١ سبتمبر ٢٠٢٣' },
    amount: 1500,
    currency: 'EGP',
  },
];
