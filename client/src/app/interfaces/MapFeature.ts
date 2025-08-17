type MapFeatureType = 'runway' | 'taxiway' | 'helipad' | 'parking' | 'clearance';

interface MapFeatureBase {
  type: MapFeatureType;
  geometry: GeoJSON.Geometry;
  properties: Record<string, any>; 
}

interface ClearanceFeature extends MapFeatureBase {
  type: 'clearance';
  pilotId: string;
  status: 'LOADED' | 'EXECUTED';
}
