import { Component, EventEmitter, Output } from '@angular/core';
import { AirportMapComponent } from '@app/components/airport-map/airport-map.component';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-controls-panel',
  standalone: true,
  imports: [AirportMapComponent, SettingsComponent],
  templateUrl: './controls-panel.component.html',
  styleUrl: './controls-panel.component.scss',

  
})
export class ControlsPanelComponent {
  activeTab: 'map' | 'settings' = 'map';
  @Output() close = new EventEmitter<void>();

  setTab(tab: 'map' | 'settings') {
    this.activeTab = tab;
  }

  closePanel() {
    this.close.emit();
  }
}
