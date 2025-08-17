import { NgClass, NgStyle } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Atc } from '@app/interfaces/Atc';
import { PilotPublicView } from '@app/interfaces/Publics';
import { MainPageService } from '@app/services/main-page.service';
import { Subscription } from 'rxjs';
import { trigger, transition,style, animate } from '@angular/animations';
import { AirportMapService } from '@app/services/airport-map.service';

@Component({
  selector: 'app-pilot-carousel',
  standalone: true,
  imports: [NgClass, NgStyle],
  templateUrl: './pilot-carousel.component.html',
  styleUrls: ['./pilot-carousel.component.scss'],
  animations: [
    trigger('pilotAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.6)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.33, 1, 0.68, 1)', style({
          opacity: 0,
          transform: 'scale(0.8) rotateZ(-4deg)'
        }))
      ])
    ])
  ]
})
export class PilotCarouselComponent implements OnInit, OnDestroy {
  private pilotListSubscription?: Subscription;
  private atcListSubscription?: Subscription;
  pilotList: PilotPublicView[] = [];
  atcList: Atc[] = [];

  constructor(
    private readonly mainPageService: MainPageService,
    private readonly airportMapService: AirportMapService
  ) {}

  ngOnInit(): void {
    this.configSubscription();
    this.mainPageService.fetchPilotPublicViews();

  }

  ngOnDestroy(): void {
    this.pilotListSubscription?.unsubscribe();
    this.atcListSubscription?.unsubscribe();
  }

  configSubscription(): void {
    this.pilotListSubscription = this.mainPageService.pilotsPreviews$.subscribe((pilotList: PilotPublicView[]) => {
      this.pilotList = pilotList.sort((pil1, pil2) => { return pil2.notificationCount - pil1.notificationCount; });
    });

    this.atcListSubscription = this.mainPageService.atcList$.subscribe((atcList: Atc[]) => {
      this.atcList = atcList;
    });
  }

  selectPilot(pilot: PilotPublicView): void {
    const selectedPlane = this.airportMapService.selectedPlaneSubject.getValue();
    const sendRequest = selectedPlane?.sid !== pilot.sid;
    this.mainPageService.selectPilot(pilot.sid, sendRequest);
    this.airportMapService.selectPlane(null);
  }

  isSelected(pilot: PilotPublicView): boolean {
    return this.mainPageService.isSelectedPilot(pilot.sid);
  }

  isHandledByAnotherAtc(pilotSid : string): boolean {
    return this.atcList.some(atc => atc.selectedPilot === pilotSid);
  }

  getAtcHandler(pilotSid: string): string {
    const handlers = this.atcList
      .filter(atc => atc.selectedPilot === pilotSid)
      .map(atc => atc.sid.substring(0, 6));
  
    if (handlers.length === 0) {
      return 'No active ATC is monitoring this pilot.';
    }
  
    return `Monitored by :\n •   ${handlers.join('\n •   ')}`;
  }
}