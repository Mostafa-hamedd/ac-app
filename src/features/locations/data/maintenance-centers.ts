import type { Coordinates } from '../utils/distance';

/** Shown in code and asserted in tests so nobody mistakes this data for real businesses. */
export const MOCK_DATA_DISCLAIMER =
  'FICTIONAL MOCK DATA: invented names, addresses and phone numbers; coordinates only approximate the named Cairo districts.';

export type Localized = { en: string; ar: string };

export type MaintenanceCenter = {
  id: string;
  name: Localized;
  /** Neighbourhood / district, used for search and grouping. */
  area: Localized;
  address: Localized;
  coordinates: Coordinates;
  phone: string;
  hours: Localized;
};

/**
 * FICTIONAL MOCK DATA: for development and demos only.
 *
 * - Center names, street addresses, phone numbers and opening hours are invented.
 *   Phone numbers use the 555 pattern and do not belong to real businesses.
 * - Coordinates only place each center inside the named Cairo district; they are
 *   NOT the locations of real service centers.
 *
 * Replace this file (or the exports below) with real data when a backend exists.
 * Everything else in the Locations feature reads from `MAINTENANCE_CENTERS`.
 */
export const MAINTENANCE_CENTERS: readonly MaintenanceCenter[] = [
  {
    id: 'nasr-city',
    name: { en: 'AutoConnect Nasr City Center', ar: 'مركز أوتو كونكت مدينة نصر' },
    area: { en: 'Nasr City', ar: 'مدينة نصر' },
    address: {
      en: '12 Abbas El Akkad St, Nasr City, Cairo',
      ar: '١٢ شارع عباس العقاد، مدينة نصر، القاهرة',
    },
    coordinates: { latitude: 30.0561, longitude: 31.3456 },
    phone: '+20 2 5550 0101',
    hours: { en: 'Daily 9:00 AM – 9:00 PM', ar: 'يوميًا ٩:٠٠ ص – ٩:٠٠ م' },
  },
  {
    id: 'new-cairo',
    name: { en: 'AutoConnect New Cairo Center', ar: 'مركز أوتو كونكت القاهرة الجديدة' },
    area: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
    address: {
      en: '90th Street, Fifth Settlement, New Cairo',
      ar: 'الشارع التسعين، التجمع الخامس، القاهرة الجديدة',
    },
    coordinates: { latitude: 30.0074, longitude: 31.4913 },
    phone: '+20 2 5550 0102',
    hours: { en: 'Daily 10:00 AM – 10:00 PM', ar: 'يوميًا ١٠:٠٠ ص – ١٠:٠٠ م' },
  },
  {
    id: 'maadi',
    name: { en: 'AutoConnect Maadi Center', ar: 'مركز أوتو كونكت المعادي' },
    area: { en: 'Maadi', ar: 'المعادي' },
    address: {
      en: '9 Road 233, Degla, Maadi, Cairo',
      ar: '٩ شارع ٢٣٣، دجلة، المعادي، القاهرة',
    },
    coordinates: { latitude: 29.9602, longitude: 31.2569 },
    phone: '+20 2 5550 0103',
    hours: { en: 'Sat – Thu 9:00 AM – 8:00 PM', ar: 'السبت – الخميس ٩:٠٠ ص – ٨:٠٠ م' },
  },
  {
    id: 'heliopolis',
    name: { en: 'AutoConnect Heliopolis Center', ar: 'مركز أوتو كونكت مصر الجديدة' },
    area: { en: 'Heliopolis', ar: 'مصر الجديدة' },
    address: {
      en: '25 Baghdad St, Korba, Heliopolis, Cairo',
      ar: '٢٥ شارع بغداد، الكوربة، مصر الجديدة، القاهرة',
    },
    coordinates: { latitude: 30.091, longitude: 31.3225 },
    phone: '+20 2 5550 0104',
    hours: { en: 'Daily 9:00 AM – 9:00 PM', ar: 'يوميًا ٩:٠٠ ص – ٩:٠٠ م' },
  },
  {
    id: 'sheikh-zayed',
    name: { en: 'AutoConnect Sheikh Zayed Center', ar: 'مركز أوتو كونكت الشيخ زايد' },
    area: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
    address: {
      en: 'Central Axis, Beverly Hills, Sheikh Zayed City',
      ar: 'المحور المركزي، بيفرلي هيلز، مدينة الشيخ زايد',
    },
    coordinates: { latitude: 30.0194, longitude: 30.971 },
    phone: '+20 2 5550 0105',
    hours: { en: 'Daily 10:00 AM – 10:00 PM', ar: 'يوميًا ١٠:٠٠ ص – ١٠:٠٠ م' },
  },
  {
    id: 'october',
    name: { en: 'AutoConnect 6th of October Center', ar: 'مركز أوتو كونكت السادس من أكتوبر' },
    area: { en: '6th of October', ar: 'السادس من أكتوبر' },
    address: {
      en: 'Mehwar El Wahat Rd, 6th of October City',
      ar: 'طريق محور الواحات، مدينة السادس من أكتوبر',
    },
    coordinates: { latitude: 29.9285, longitude: 30.9188 },
    phone: '+20 2 5550 0106',
    hours: { en: 'Sat – Thu 9:00 AM – 8:00 PM', ar: 'السبت – الخميس ٩:٠٠ ص – ٨:٠٠ م' },
  },
  {
    id: 'zamalek',
    name: { en: 'AutoConnect Zamalek Center', ar: 'مركز أوتو كونكت الزمالك' },
    area: { en: 'Zamalek', ar: 'الزمالك' },
    address: {
      en: '4 Hassan Sabry St, Zamalek, Cairo',
      ar: '٤ شارع حسن صبري، الزمالك، القاهرة',
    },
    coordinates: { latitude: 30.0626, longitude: 31.2197 },
    phone: '+20 2 5550 0107',
    hours: { en: 'Daily 9:00 AM – 7:00 PM', ar: 'يوميًا ٩:٠٠ ص – ٧:٠٠ م' },
  },
  {
    id: 'mohandessin',
    name: { en: 'AutoConnect Mohandessin Center', ar: 'مركز أوتو كونكت المهندسين' },
    area: { en: 'Mohandessin', ar: 'المهندسين' },
    address: {
      en: '31 Syria St, Mohandessin, Giza',
      ar: '٣١ شارع سوريا، المهندسين، الجيزة',
    },
    coordinates: { latitude: 30.0561, longitude: 31.2 },
    phone: '+20 2 5550 0108',
    hours: { en: 'Daily 9:00 AM – 9:00 PM', ar: 'يوميًا ٩:٠٠ ص – ٩:٠٠ م' },
  },
  {
    id: 'shubra',
    name: { en: 'AutoConnect Shubra Center', ar: 'مركز أوتو كونكت شبرا' },
    area: { en: 'Shubra', ar: 'شبرا' },
    address: {
      en: '70 Shubra St, Shubra, Cairo',
      ar: '٧٠ شارع شبرا، شبرا، القاهرة',
    },
    coordinates: { latitude: 30.1134, longitude: 31.2447 },
    phone: '+20 2 5550 0109',
    hours: { en: 'Sat – Thu 9:00 AM – 7:00 PM', ar: 'السبت – الخميس ٩:٠٠ ص – ٧:٠٠ م' },
  },
  {
    id: 'downtown',
    name: { en: 'AutoConnect Downtown Center', ar: 'مركز أوتو كونكت وسط البلد' },
    area: { en: 'Downtown', ar: 'وسط البلد' },
    address: {
      en: '18 Talaat Harb St, Downtown, Cairo',
      ar: '١٨ شارع طلعت حرب، وسط البلد، القاهرة',
    },
    coordinates: { latitude: 30.0444, longitude: 31.2357 },
    phone: '+20 2 5550 0110',
    hours: { en: 'Daily 10:00 AM – 8:00 PM', ar: 'يوميًا ١٠:٠٠ ص – ٨:٠٠ م' },
  },
];
