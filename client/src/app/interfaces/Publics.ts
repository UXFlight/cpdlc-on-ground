import { StepStatus } from "./StepStatus";

export type LonLat = [number, number];

export interface Plane {
    spawn_pos: LonLat;
    current_pos: LonLat;
    final_pos: LonLat | null;
    current_heading: number;
    current_speed: number;
    current_altitude: number;
    current_gate?: string | null;
}
export interface StepPublicView {
    step_code: string;
    label: string;
    status: StepStatus;
    message: string;
    timestamp: number;
    validated_at: number;
    request_id: string;
    time_left: number | null;
}

export interface StepEvent {
    step_code: string;
    status: StepStatus;
    timestamp: number;
    message: string | null;
    request_id: string;
}

export type ClearanceType =
  | 'expected_taxi'
  | 'taxi_clearance'
  | 'route_modification';

export type ClearanceEventKind =
  | 'CROSS'
  | 'HOLD_SHORT'
  | 'STOP'
  | 'POINT';

export interface ClearanceEvent {
  i: number;
  kind: ClearanceEventKind;
  name: string;
}

export interface Clearance {
  type: ClearanceType;
  instruction: string;
  coords: LonLat[];
  events: ClearanceEvent[];
  remarks?: string;
}

export interface PilotPublicView {
    color: string;
    sid: string;
    steps: Record<string, StepPublicView>;
    history: StepEvent[];
    notificationCount: number;
    plane?: Plane;
    clearances?: Clearance[];
    renderClearance?: boolean;
}