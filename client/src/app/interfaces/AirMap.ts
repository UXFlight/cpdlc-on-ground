export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: Record<string, any>; 
}

export type GeoJSONGeometry =
  | GeoJSONPoint
  | GeoJSONLineString;

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // LatLon
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // LatLon Array
}
