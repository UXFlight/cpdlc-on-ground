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
      this.pilots = pilots.filter(pilot => pilot.clearances && pilot.clearances.length > 0);
    });
  }

  toggleClearance(pilot: PilotPublicView): void {
    pilot.renderClearance = !pilot.renderClearance;
    this.airportMapService.renderSubject.next(true)
  }

  getPilotLatestClearance(pilot: PilotPublicView): string {
    if (!pilot.clearances || pilot.clearances.length === 0) {
      return 'No clearances available';
    }
    const latestClearance = pilot.clearances[pilot.clearances.length - 1];
    return latestClearance.instruction || 'No instruction provided';
  }
}
