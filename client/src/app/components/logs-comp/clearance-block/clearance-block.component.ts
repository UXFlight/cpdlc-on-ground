import { NgClass } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Clearance, PilotPublicView } from '@app/interfaces/Publics';
import { StepStatus } from '@app/interfaces/StepStatus';
import { AirportMapService } from '@app/services/airport-map.service';
import { MainPageService } from '@app/services/main-page.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clearance-block',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './clearance-block.component.html',
  styleUrl: './clearance-block.component.scss'
})
export class ClearanceBlockComponent implements OnInit, OnDestroy, OnChanges {
  @Input() clearance: Clearance | null;

  showDetails = false;
  isEditing = false;
  editableInstruction: string = '';

  selectedPlane: PilotPublicView | null = null;
  selectedPlaneSubcription: Subscription;

  selectedPilotSid: string = '';
  response: string = '';

  constructor(
    private readonly airportMapService: AirportMapService,
    private readonly mainPageService: MainPageService
  ) {}

  ngOnInit(): void {
    this.configSubscription();
  }

  ngOnDestroy(): void {
    this.selectedPlaneSubcription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearance'] && this.clearance) {
      this.editableInstruction = this.clearance.instruction || '';
    }
  }

  configSubscription(): void {
    this.selectedPlaneSubcription = this.airportMapService.selectedPlane$.subscribe((plane) => {
      this.selectedPlane = plane;
      this.selectedPilotSid = plane?.sid || '';
      this.response = '';
    });
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  confirmEdit(): void {
    if (!this.clearance) return;
    const updatedClearance: Clearance = {
      ...this.clearance,
      instruction: this.editableInstruction.trim()
    };
    this.isEditing = false;
    console.log('Updated Clearance:', updatedClearance);
  }

  cancelEdit(): void {
    if (!this.clearance) return;
    this.editableInstruction = this.clearance.instruction;
    this.isEditing = false;
  }

  removeCoord(index: number): void {
    if (!this.isEditing || !this.clearance) return;
    this.clearance.coords.splice(index, 1);
  }

  // === LOGIQUE MÉTIER ===================================

  get stepCode(): string {
    if (!this.clearance) return '';
    return this.clearance.kind === 'expected' ? 'DM_136' : 'DM_135';
  }

  get step() {
    return this.selectedPlane?.steps?.[this.stepCode] ?? null;
  }

  get isRespondableStep(): boolean {
    const s = this.step;
    return !!s && [StepStatus.NEW, StepStatus.STANDBY].includes(s.status);
  }

  get isStandby(): boolean {
    const s = this.step;
    return !!s && StepStatus.STANDBY == s.status;
  }

  get defaultMessage(): string {
    if (!this.clearance) return '';
    const label = this.clearance.kind === 'expected' ? 'expected taxi' : 'taxi clearance';
    return `Standby for ${label}`;
  }

  get unableMessage(): string {
    return `Unable to provide clearance at this time.`;
  }

  emitAction(action: 'standby' | 'unable' | 'affirm'): void {
    if (!this.clearance || !this.selectedPilotSid || !this.isRespondableStep || !this.step) return;

    const message =
      action === 'affirm'
        ? this.clearance.instruction
        : action === 'standby'
          ? this.defaultMessage
          : this.unableMessage;

    const payload = {
      pilot_sid: this.selectedPilotSid,
      step_code: this.stepCode,
      action,
      message,
      request_id: this.step?.request_id ?? ''
    };

    this.mainPageService.sendResponse(payload);
    this.response = '';
    this.showDetails = false;
  }
}
