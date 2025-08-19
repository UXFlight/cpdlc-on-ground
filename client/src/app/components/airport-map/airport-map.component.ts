import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AirportMapService } from '@app/services/airport-map.service';
import { AirportMapData } from '@app/interfaces/AirMap';
import { PilotPublicView } from '@app/interfaces/Publics';
import { AirportMapRenderer, MapRenderOptions } from '@app/classes/airport-map-renderer.ts';
import { MainPageService } from '@app/services/main-page.service';

@Component({
  selector: 'app-airport-map',
  standalone: true,
  templateUrl: './airport-map.component.html',
  styleUrl: './airport-map.component.scss'
})
export class AirportMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  showLabels = false;
  showLabelsSubscription!: Subscription;

  private ctx!: CanvasRenderingContext2D;
  private renderer!: AirportMapRenderer;
  private pilotSubscription!: Subscription;
  private airportMapSubscription!: Subscription;
  private renderSubject!: Subscription;

  pilots: PilotPublicView[] = [];
  airportMap: AirportMapData | null = null;

  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private dragMoved = false;

  constructor(
    private readonly mainpageService: MainPageService,
    private readonly airportMapService: AirportMapService
  ) {}

  ngOnInit(): void {
    this.configSubscriptions();
    this.airportMapService.fetchAirportMapData();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new AirportMapRenderer(this.ctx, canvas);
    this.canvasRef.nativeElement.addEventListener('wheel', this.onCanvasWheel, { passive: false });
    this.resizeCanvas();
    canvas.addEventListener('click', this.onCanvasClick.bind(this));
  }
  
  ngOnDestroy(): void {
    this.pilotSubscription?.unsubscribe();
    this.airportMapSubscription?.unsubscribe();
    this.renderSubject?.unsubscribe();
    this.showLabelsSubscription?.unsubscribe();
    // this.renderer?.stopPingLoop();
  }

  toggleLabels() {
    this.airportMapService.toggleLabels();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.resizeCanvas();
    this.render();
  }

  // never settle for less UX, this event is only used for the cursor style. 
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    this.isDragging = true;
    this.dragMoved = false;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }
  
  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp(): void {
    this.isDragging = false;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
  
    const dx = event.clientX - this.lastMouseX;
    const dy = event.clientY - this.lastMouseY;
  
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.dragMoved = true; // if we actually moved
  
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  
    this.airportMapService.applyPan(dx, dy);
    this.render();
    this.canvasRef.nativeElement.style.cursor = 'grabbing';
  }
  

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    this.airportMapService.updateCanvasSize(canvas.width, canvas.height);
    this.render();
  }

  private configSubscriptions(): void {
    this.pilotSubscription = this.mainpageService.pilotsPreviews$.subscribe(pilots => {
      this.pilots = pilots;
      this.render();
    });
  
    this.airportMapSubscription = this.airportMapService.airportMap$.subscribe(map => {
      if (!map ) return;
      this.airportMap = map;
  
      const canvas = this.canvasRef.nativeElement;
      this.airportMapService.updateCanvasSize(canvas.width, canvas.height);
  
      this.render();
    });

    this.renderSubject = this.airportMapService.render$.subscribe(render => {
      if (render) this.render();
    });

    this.showLabelsSubscription = this.airportMapService.showLabels$.subscribe(show => {
      this.showLabels = show;
      this.render();
    });
  }

  private render(): void {
    const options: MapRenderOptions | null = this.airportMapService.getRenderOptions();
    if (!this.airportMap || !options || !this.renderer) return;
  
    this.renderer.clear();
  
    this.renderer.drawTaxiways(this.airportMap.taxiways, options);
    this.renderer.drawRunways(this.airportMap.runways, options);
    this.renderer.drawParkings(this.airportMap.parking, options);
    this.renderer.drawHelipads(this.airportMap.helipads, options);
  
    if (this.showLabels) {
      this.renderer.drawAllLineLabels(this.airportMap.taxiways, options);
      }
  
    this.renderer.drawPilots(this.pilots, options);
  }
  

  onResetMap(): void {
    this.airportMapService.resetZoom();
  }

  checkNoZoom() : boolean {
    return this.airportMapService.zoomResetted()
  }

  // On event listeners methods
  private onCanvasWheel = (evt: WheelEvent) => {
    evt.preventDefault();
  
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;
    const mouseY = evt.clientY - rect.top;
  
    this.airportMapService.zoomFromWheel(evt.deltaY, [mouseX, mouseY]);
  };

  onCanvasClick(event: MouseEvent): void {
    if (this.dragMoved) return; // if we moved!
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    const options = this.airportMapService.getRenderOptions();
    if (!options) return;
  
    for (const pilot of this.pilots) {
      if (!pilot.plane) continue;
  
      const [projX, projY] = options.project(pilot.plane.current_pos.coord);
      const dx = x - projX;
      const dy = y - projY;
      const dist = Math.sqrt(dx * dx + dy * dy);
  
      if (dist < 12) {
        const ZOOM = 2;
        return this.airportMapService.focusOnPilot(pilot, ZOOM);
      }
    }
    this.airportMapService.selectPlane(null);
  }
  
}