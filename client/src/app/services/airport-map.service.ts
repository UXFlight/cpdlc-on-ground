import { Injectable } from '@angular/core';
import { CommunicationService } from './communication.service';
import {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  GeoJSONLineString,
  GeoJSONPoint
} from '@app/interfaces/AirMap';
import { BehaviorSubject, Observable } from 'rxjs';
import { MapRenderOptions } from '@app/classes/airport-map-renderer.ts';
import { PilotPublicView } from '@app/interfaces/Publics';
import { ClientSocketService } from './client-socket.service';

@Injectable({ providedIn: 'root' })
export class AirportMapService {
  airportMapSubject = new BehaviorSubject<GeoJSONFeatureCollection | null>(null);
  airportMap$: Observable<GeoJSONFeatureCollection | null> = this.airportMapSubject.asObservable();

  private loadedRouteSubject = new BehaviorSubject<GeoJSONFeature[]>([]);
  loadedRoute$: Observable<GeoJSONFeature[]> = this.loadedRouteSubject.asObservable();

  private executedRouteSubject = new BehaviorSubject<GeoJSONFeature[]>([]);
  executedRoute$: Observable<GeoJSONFeature[]> = this.executedRouteSubject.asObservable();

  selectedPlaneSubject = new BehaviorSubject<PilotPublicView | null>(null);
  selectedPlane$: Observable<PilotPublicView | null> = this.selectedPlaneSubject.asObservable();

  renderSubject = new BehaviorSubject<boolean>(false);
  render$: Observable<boolean> = this.renderSubject.asObservable();

  private showLabelsSubject = new BehaviorSubject<boolean>(false);
  showLabels$: Observable<boolean> = this.showLabelsSubject.asObservable();

  // === Projection data ===
  private baseScale = 1;
  private minLon = 0;
  private maxLon = 0;
  private minLat = 0;
  private maxLat = 0;
  private padding = 50;

  private offsetCenterX = 0;
  private offsetCenterY = 0;

  private canvasWidth = 0;
  private canvasHeight = 0;

  // zoom
  zoomFactor = 1;
  private panOffset = { x: 0, y: 0 };

  constructor(
    private readonly communicationService: CommunicationService,
    private readonly socketClientService: ClientSocketService
  ) {}

  async fetchAirportMapData(): Promise<void> {
    if (this.airportMapSubject.value) return;
    console.log('Fetching airport map data...');
    const data = await this.communicationService.get<GeoJSONFeatureCollection>('atc-request/get-airport-info');
    this.airportMapSubject.next(data);
  }

  updateCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.computeProjection();
  }

  private computeProjection(): void {
    const map = this.airportMapSubject.value;
    if (!map) return;

    const allCoords = map.features.reduce((acc: [number, number][], feat) => {
      if (feat.geometry.type === 'LineString') {
        return acc.concat((feat.geometry as GeoJSONLineString).coordinates);
      } else if (feat.geometry.type === 'Point') {
        return acc.concat([(feat.geometry as GeoJSONPoint).coordinates]);
      }
      return acc;
    }, []);

    const lons = allCoords.map(([lon]) => lon);
    const lats = allCoords.map(([, lat]) => lat);
    this.minLon = Math.min(...lons);
    this.maxLon = Math.max(...lons);
    this.minLat = Math.min(...lats);
    this.maxLat = Math.max(...lats);

    const W = this.canvasWidth - 2 * this.padding;
    const H = this.canvasHeight - 2 * this.padding;
    const scaleX = W / (this.maxLon - this.minLon);
    const scaleY = H / (this.maxLat - this.minLat);
    this.baseScale = Math.min(scaleX, scaleY);

    const projectedWidth = (this.maxLon - this.minLon) * this.baseScale;
    const projectedHeight = (this.maxLat - this.minLat) * this.baseScale;

    this.offsetCenterX = (this.canvasWidth - projectedWidth) / 2;
    this.offsetCenterY = (this.canvasHeight - projectedHeight) / 2;
  }

  getRenderOptions(): MapRenderOptions | null {
    if (!this.canvasWidth || !this.canvasHeight || !this.airportMapSubject.value) return null;

    const rawProject = ([lon, lat]: [number, number]): [number, number] => [
      this.offsetCenterX + (lon - this.minLon) * this.baseScale,
      this.canvasHeight - (this.offsetCenterY + (lat - this.minLat) * this.baseScale)
    ];

    const project = (coord: [number, number]): [number, number] => {
      const [x0, y0] = rawProject(coord);
      return [
        x0 * this.zoomFactor + this.panOffset.x,
        y0 * this.zoomFactor + this.panOffset.y
      ];
    };

    return {
      project,
      showLabels: true,
      zoomLevel: this.zoomFactor
    };
  }

  // external controls for zoom/pan
  setZoomAndPan(zoom: number, pan: { x: number; y: number }): void {
    this.zoomFactor = zoom;
    this.panOffset = { ...pan };
    this.renderSubject.next(true);
  }

  private rawProject([lon, lat]: [number, number]): [number, number] {
    return [
      this.offsetCenterX + (lon - this.minLon) * this.baseScale,
      this.canvasHeight - (this.offsetCenterY + (lat - this.minLat) * this.baseScale)
    ];
  }
  
  centerOnCoordinate(coord: [number, number], zoom: number): { x: number; y: number } {
    const [x0, y0] = this.rawProject(coord);
    const canvasCenterX = this.canvasWidth / 3; // slighty to the left, this.canvasWidth/2 to center 
    const canvasCenterY = this.canvasHeight / 2;
  
    return {
      x: canvasCenterX - x0 * zoom,
      y: canvasCenterY - y0 * zoom
    };
  }

  navigateToPilot(pilots: PilotPublicView[], direction: string): void {
    const sid = this.selectedPlaneSubject.value?.sid;
    if (pilots.length === 0) return;

    let index = 0;

    if (sid) index = pilots.findIndex(p => p.sid === sid)
    if (index === -1) return;
  
    const newIndex =
      direction === 'next'
        ? (index + 1) % pilots.length
        : (index - 1 + pilots.length) % pilots.length;
        
    this.focusOnPilot(pilots[newIndex]);
  }

  focusOnPilot(pilot: PilotPublicView, zoomLevel = 2): void {
    this.socketClientService.send('select_pilot', pilot.sid);
    const selectedPlane = this.selectedPlaneSubject.value;
    if (selectedPlane && selectedPlane.sid === pilot.sid) return this.resetZoom();
    this.selectPlane(pilot);
  
    const pan = this.centerOnCoordinate(pilot.plane!.current_pos, zoomLevel);
    this.animateZoomAndPan(zoomLevel, pan);
  }
  
  
  animateZoomAndPan(targetZoom: number, targetPan: { x: number; y: number }, duration = 300): void {
    const startZoom = this.zoomFactor;
    const startPan = { ...this.panOffset };

    const startTime = performance.now();
  
    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
  
      const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  
      const zoom = startZoom + (targetZoom - startZoom) * easedT;
      const panX = startPan.x + (targetPan.x - startPan.x) * easedT;
      const panY = startPan.y + (targetPan.y - startPan.y) * easedT;
  
      this.setZoomAndPan(zoom, { x: panX, y: panY });
  
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
  
    requestAnimationFrame(animate);
  }
  
  resetZoom(): void {
    this.resetZoomAndPan();
    this.resetPlaneSelection()
  }

  resetZoomAndPan(): void {
    this.zoomFactor = 1;
    this.panOffset = { x: 0, y: 0 };
    this.animateZoomAndPan(this.zoomFactor, this.panOffset, 300);
    this.renderSubject.next(true);
  }

  resetPlaneSelection(): void {
    const currentPlaneSid = this.selectedPlaneSubject.value?.sid;
    if (!currentPlaneSid) return;
    this.socketClientService.send('select_pilot', currentPlaneSid);
    this.selectedPlaneSubject.next(null);
  }

  zoomResetted(): boolean {
    return this.zoomFactor !== 1 && this.panOffset.x !== 0 && this.panOffset.y !== 0;
  }

  zoomFromWheel(deltaY: number, center: [number, number]): void {
    const zoomChange = deltaY < 0 ? 1.1 : 1 / 1.1;
    const newZoom = Math.min(20, Math.max(0.1, this.zoomFactor * zoomChange));
    const factor = newZoom / this.zoomFactor;
  
    const [cx, cy] = center;
    this.panOffset.x = cx - (cx - this.panOffset.x) * factor;
    this.panOffset.y = cy - (cy - this.panOffset.y) * factor;
  
    this.zoomFactor = newZoom;

    this.renderSubject.next(true);
  }

  selectPlane(plane: PilotPublicView | null): void {
    this.selectedPlaneSubject.next(plane);
  }

  toggleLabels(): void {
    this.showLabelsSubject.next(!this.showLabelsSubject.value);
  }
  // event
  applyPan(dx: number, dy: number): void {
    const factor = 1 / Math.sqrt(this.zoomFactor);
  
    this.panOffset.x += dx * factor;
    this.panOffset.y += dy * factor;
  }
  

  getBaseScale(): number {
    return this.baseScale || 1; // fallback pour éviter division par 0
  }
  
}
