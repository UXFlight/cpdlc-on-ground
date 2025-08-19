import { Injectable } from '@angular/core';
// import { CommunicationService } from './communication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MapRenderOptions } from '@app/classes/airport-map-renderer.ts';
import { PilotPublicView } from '@app/interfaces/Publics';
import { ClientSocketService } from './client-socket.service';
import { AirportMapData } from '@app/interfaces/AirMap';

@Injectable({ providedIn: 'root' })
export class AirportMapService {
  airportMapSubject = new BehaviorSubject<AirportMapData | null>(null);
  airportMap$: Observable<AirportMapData | null> = this.airportMapSubject.asObservable();

  private loadedRouteSubject = new BehaviorSubject<AirportMapData[]>([]);
  loadedRoute$: Observable<AirportMapData[]> = this.loadedRouteSubject.asObservable();

  private executedRouteSubject = new BehaviorSubject<AirportMapData[]>([]);
  executedRoute$: Observable<AirportMapData[]> = this.executedRouteSubject.asObservable();

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
    // private readonly communicationService: CommunicationService,
    private readonly socketClientService: ClientSocketService
  ) {
    this.listenToSocketEvents();
  }

  private listenToSocketEvents(): void {
    this.socketClientService.listen('airport_map_data', this.onAirportMapData);
  }

  fetchAirportMapData(): void {
    this.socketClientService.send('getAirportMapData');
  }

  updateCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.computeProjection();
  }

  private computeProjection(): void {
    const map = this.airportMapSubject.value;
    if (!map) return;
  
    // === Collect all LonLat coordinates ===
    const allCoords: [number, number][] = [];
  
    map.runways.forEach(rw => {
      allCoords.push(rw.start, rw.end);
    });
  
    map.helipads.forEach(h => {
      allCoords.push(h.location);
    });
  
    map.taxiways.forEach(t => {
      allCoords.push(t.start, t.end);
    });
  
    map.parking.forEach(p => {
      allCoords.push(p.location);
    });
  
    if (!allCoords.length) return;
  
    // === Extract bounds ===
    const lons = allCoords.map(([lon, _]) => lon);
    const lats = allCoords.map(([_, lat]) => lat);
    this.minLon = Math.min(...lons);
    this.maxLon = Math.max(...lons);
    this.minLat = Math.min(...lats);
    this.maxLat = Math.max(...lats);
  
    // === Compute scaling factors ===
    const W = this.canvasWidth - 2 * this.padding;
    const H = this.canvasHeight - 2 * this.padding;
    const scaleX = W / (this.maxLon - this.minLon);
    const scaleY = H / (this.maxLat - this.minLat);
    this.baseScale = Math.min(scaleX, scaleY);
  
    // === Center offset ===
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
    this.socketClientService.send('selectPilot', pilot.sid);
    const selectedPlane = this.selectedPlaneSubject.value;
    if (selectedPlane && selectedPlane.sid === pilot.sid) return this.resetZoom();
    this.selectPlane(pilot);
  
    const pan = this.centerOnCoordinate(pilot.plane!.current_pos.coord, zoomLevel);
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
    this.socketClientService.send('selectPilot', currentPlaneSid);
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

  // === Socket events ===
  private onAirportMapData = (data: AirportMapData): void => {
    this.airportMapSubject.next(data);
    this.computeProjection();
  }
}
