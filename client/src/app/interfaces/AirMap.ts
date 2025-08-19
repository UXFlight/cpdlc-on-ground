// === Base ===
export type LonLat = [number, number];

// === Airport Info ===
export interface AirportInfo {
  icao: string;
  name: string;
  elevation: number;
}

// === Runway ===
export interface Runway {
  name: string;
  start: LonLat;
  end: LonLat;
  width: number;
  surface: number;
}

// === Helipad ===
export interface Helipad {
  name: string;
  location: LonLat;
  heading: number;
  length: number;
  width: number;
}

// === Taxiway ===
export type TaxiwayWidth = "A" | "B" | "C" | "D" | "E" | "F";

export interface Taxiway {
  name: string;
  start: LonLat;
  end: LonLat;
  width: string | TaxiwayWidth;
  is_runway: boolean;
  one_way: boolean;
}

// === Parking ===
export type ParkingType = "gate" | "tie_down" | "hangar" | "ramp" | "unknown";

export interface ParkingPosition {
  name: string;
  location: LonLat;
  heading: number;
  type: ParkingType;
}

// === Complete Map Data ===
export interface AirportMapData {
  airport_info: AirportInfo;
  runways: Runway[];
  helipads: Helipad[];
  taxiways: Taxiway[];
  parking: ParkingPosition[];
}
