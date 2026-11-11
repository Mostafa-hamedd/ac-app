import {
  BatteryFull,
  Circle,
  Disc,
  Ellipsis,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

export type ServiceTypeId =
  'regularMaintenance' | 'tireService' | 'brakeService' | 'batteryCheck' | 'acService' | 'other';

export type ServiceType = {
  id: ServiceTypeId;
  icon: LucideIcon;
};

/** The kinds of service that can be booked, in the order they are shown. */
export const SERVICE_TYPES: readonly ServiceType[] = [
  { id: 'regularMaintenance', icon: Wrench },
  { id: 'tireService', icon: Disc },
  { id: 'brakeService', icon: Circle },
  { id: 'batteryCheck', icon: BatteryFull },
  { id: 'acService', icon: Wind },
  { id: 'other', icon: Ellipsis },
];
