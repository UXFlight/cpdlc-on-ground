import { Component, OnDestroy, OnInit } from '@angular/core';
import { PilotPublicView } from '@app/interfaces/Publics';
import { AirportMapService } from '@app/services/airport-map.service';
import { MainPageService } from '@app/services/main-page.service';
import { Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-clearances-sticker',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './clearances-sticker.component.html',
  styleUrl: './clearances-sticker.component.scss'
})
export class ClearancesStickerComponent implements OnDestroy, OnInit  {
  pilotsSubscription: Subscription;
  pilots: PilotPublicView[] = [];

  constructor(
    private readonly mainpageService: MainPageService,
    private readonly airportMapService: AirportMapService
  ) {
  }

  ngOnInit(): void {
      this.configSubscriptions();
  }
   
  ngOnDestroy(): void {
    this.pilotsSubscription?.unsubscribe();
  }

  configSubscriptions(): void {
    this.pilotsSubscription = this.mainpageService.pilotsPreviews$.subscribe((pilots: PilotPublicView[]) => {
      this.pilots = pilots.filter(pilot => pilot.clearances);
    });
  }

  toggleClearance(pilot: PilotPublicView): void {
    if (!this.hasValidClearance(pilot)) return;
    pilot.renderClearance = !pilot.renderClearance;
    this.airportMapService.renderSubject.next(true);
  }

  getPilotLatestClearance(pilot: PilotPublicView): string {
    const clearances = Object.values(pilot.clearances || {});
    if (!clearances.length) return 'No clearances available';
    const validClearances = clearances.filter(c => c.instruction?.trim());
    if (!validClearances.length) return 'No instruction provided';
    validClearances.sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime() );
  
    return validClearances[0].instruction;
  }

  hasValidClearance(pilot: PilotPublicView): boolean {
    return Object.values(pilot.clearances || {}).some(
      c => c.instruction?.trim()
    );
  }
}
