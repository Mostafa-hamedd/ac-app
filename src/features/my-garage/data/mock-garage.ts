import type { BookedService, DuePayment, OngoingService } from '../types/garage.types';

/** Shown in code and asserted in tests so nobody mistakes this data for real records. */
export const MOCK_DATA_DISCLAIMER =
  'FICTIONAL MOCK DATA: invented services, dates and prices. Replace with API data when a backend exists.';

/** FICTIONAL MOCK DATA. The service in progress. */
export const MOCK_ONGOING_SERVICE: OngoingService = {
  id: 'ongoing-10k',
  title: { en: '10k Scheduled Maintenance', ar: 'صيانة دورية ١٠ آلاف كم' },
  center: { en: 'Sheikh Zayed Service Center', ar: 'مركز خدمة الشيخ زايد' },
  centerId: 'sheikh-zayed',
  steps: [
    {
      id: 'tire-pressure',
      label: { en: 'Tire Pressure Diagnostics', ar: 'فحص ضغط الإطارات' },
      state: 'done',
    },
    {
      id: 'functional-test',
      label: { en: 'Functional Systems test', ar: 'اختبار الأنظمة الوظيفية' },
      state: 'done',
    },
    {
      id: 'oil-filter',
      label: { en: 'Oil & Filter replacement', ar: 'تغيير الزيت والفلتر' },
      state: 'active',
    },
    {
      id: 'transmission',
      label: { en: 'Transmission Fluid Top-up', ar: 'تعبئة زيت ناقل الحركة' },
      state: 'pending',
    },
  ],
  readyDate: { en: '11 Sep', ar: '١١ سبتمبر' },
  readyTime: { en: '5:00 PM', ar: '٥:٠٠ م' },
};

/** FICTIONAL MOCK DATA. Booked and finished services. */
export const MOCK_BOOKED_SERVICES: readonly BookedService[] = [
  {
    id: 'booked-tire-pressure',
    title: { en: 'Tire Pressure Calibration', ar: 'معايرة ضغط الإطارات' },
    date: { en: '11 Sep 2023', ar: '١١ سبتمبر ٢٠٢٣' },
    status: 'upcoming',
    serviceType: 'tireService',
  },
  {
    id: 'booked-transmission',
    title: { en: 'Transmission Fluid Check', ar: 'فحص زيت ناقل الحركة' },
    date: { en: '04 Sep 2023', ar: '٠٤ سبتمبر ٢٠٢٣' },
    status: 'completed',
    serviceType: 'regularMaintenance',
  },
];

/** FICTIONAL MOCK DATA. Invoices waiting to be paid. */
export const MOCK_DUE_PAYMENTS: readonly DuePayment[] = [
  {
    id: 'due-functional-tests',
    title: { en: 'Functional Tests Fee', ar: 'رسوم الاختبارات الوظيفية' },
    dueDate: { en: '15 Sep 2023', ar: '١٥ سبتمبر ٢٠٢٣' },
    amount: 1500,
  },
];
