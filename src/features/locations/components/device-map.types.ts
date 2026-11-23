import type { Coordinates } from '../utils/distance';
import type { CameraTarget } from '../utils/trip';

export type MapCenterMarker = { id: string; coordinates: Coordinates; title: string };
export type MapCameraRequest = { id: number; target: CameraTarget };

export type DeviceMapProps = {
  /** Real device position; null until a fix is available. */
  userCoords: Coordinates | null;
  /** Show the native blue user-location dot (only once permission is granted). */
  showUserLocation: boolean;
  /** Every maintenance center; each becomes a selectable marker. */
  centers: MapCenterMarker[];
  /** Id of the chosen destination center, if any (drawn on top and highlighted). */
  destinationId: string | null;
  /** Marker for a starting point picked on the map; null while the origin is live GPS. */
  originMarker: { coordinates: Coordinates; title: string } | null;
  /** Straight line between origin and destination; null when either is missing. */
  route: Coordinates[] | null;
  /** While true, the next map tap is reported through `onPickPoint`. */
  pickMode: boolean;
  onPickPoint: (coords: Coordinates) => void;
  onSelectCenter: (id: string) => void;
  /** The recenter button was pressed. */
  onRecenter: () => void;
  /** Moves the camera whenever a new request (new id) arrives. */
  cameraRequest: MapCameraRequest | null;
  /** Height of the bottom sheet, so the recenter button and map logo clear it. */
  bottomInset: number;
};
