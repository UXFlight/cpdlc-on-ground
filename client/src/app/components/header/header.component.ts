import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MainPageService } from '@app/services/main-page.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private isConnectedSubscription: Subscription;
  private pilotConnectionSubscription: Subscription;
  private atcCountSubscription: Subscription;

  pilotCount: number = 0; 
  isConnected: boolean = false;
  sids: string[] = [];
  mySid: string | null = null;

  constructor(
    private readonly mainPageService: MainPageService
  ) {}

  ngOnInit(): void {
    this.configSubscription();
  }

  ngOnDestroy(): void {
    this.pilotConnectionSubscription?.unsubscribe();
    this.isConnectedSubscription?.unsubscribe();
    this.atcCountSubscription?.unsubscribe();
  }

  configSubscription(): void {
    this.pilotConnectionSubscription = this.mainPageService.pilotConnection$.subscribe(count => {
      this.pilotCount = count;
    });

    this.isConnectedSubscription = this.mainPageService.isConnected$.subscribe(isConnected => {
      this.isConnected = isConnected;
      if (isConnected) this.mySid = this.mainPageService.getSid();
    });

    this.atcCountSubscription = this.mainPageService.atcCount$.subscribe(sids => {
      this.sids = sids;
    });
  }

  getSidLabel(sid: string): string {
    return sid === this.mySid?.substring(0,6).toUpperCase() ? `${sid} (You)` : sid;
  }
  
  getJoinedSidList(): string {
    return this.sids.map(sid => this.getSidLabel(sid)).join('\n');
  }
}
