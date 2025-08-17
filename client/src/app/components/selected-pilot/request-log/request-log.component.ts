import { NgClass } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatQuickResponse, getQReponseByStepCode, QuickResponse, StepCode } from '@app/interfaces/Messages';
import { StepUpdate } from '@app/interfaces/Payloads';
import { PilotPublicView, StepPublicView } from '@app/interfaces/Publics';
import { SelectedRequestInfo } from '@app/interfaces/SelectedRequest';
import { StepStatus } from '@app/interfaces/StepStatus';
import { AirportMapService } from '@app/services/airport-map.service';
import { MainPageService } from '@app/services/main-page.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-request-log',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './request-log.component.html',
  styleUrl: './request-log.component.scss'
})
export class RequestLogComponent implements OnInit, OnDestroy {
  @Input() step!: StepPublicView;

  requestIdSubscription: Subscription;
  selectedRequestInfo: SelectedRequestInfo;

  private selectedPlaneSubscription: Subscription;

  private selectedPilotSubscription: Subscription;
  selectedPilotSid: string = '';

  expanded = false;
  response: string = '';

  quickResponses : string[] = [];
  smartResponses: string[] = [];
  isLoadingSmartResponses = false;

  smartResponsesSubscription: Subscription;

  isRespondable: boolean = false;

  constructor(
    private readonly mainPageService: MainPageService,
    private readonly airportMapService: AirportMapService  
  ) {}

  ngOnInit(): void {
    this.configSubscription();
    this.isRespondable = [StepStatus.NEW, StepStatus.STANDBY].includes(this.step?.status);
  }

  ngOnDestroy(): void {
    this.requestIdSubscription?.unsubscribe();
    this.smartResponsesSubscription?.unsubscribe();
    this.selectedPilotSubscription?.unsubscribe();
    this.selectedPlaneSubscription?.unsubscribe();
    if (this.expanded) this.selectRequest('', '');
  }

  configSubscription(): void {
    this.requestIdSubscription = this.mainPageService.selectedRequestId$.subscribe((requestInfo : SelectedRequestInfo) => {
      this.selectedRequestInfo = requestInfo;
      const isEmpty = requestInfo.stepCode || requestInfo.requestId;
      this.expanded = !!isEmpty && this.selectedRequestInfo.requestId === this.step.request_id
      if (this.expanded) {
        if (['DM_136', 'DM_135'].includes(this.selectedRequestInfo.stepCode)) this.mainPageService.fetchClearance(this.selectedPilotSid, this.selectedRequestInfo.stepCode)
        else this.smartResponses = [];
        this.quickResponses = getQReponseByStepCode(this.selectedRequestInfo.stepCode as StepCode);

      }

    })

    this.smartResponsesSubscription = this.mainPageService.smartResponses$.subscribe((responses: string[]) => {
      this.smartResponses = responses;
    });

    this.selectedPilotSubscription = this.mainPageService.selectedPilot$.subscribe((pilot: PilotPublicView | null) => {
      this.setSelectedPilotSid(pilot?.sid)
    });

    this.selectedPlaneSubscription = this.airportMapService.selectedPlane$.subscribe((plane: PilotPublicView | null) => {
      this.setSelectedPilotSid(plane?.sid)
    });
  }

  get statusClass(): string {
    return this.step?.status?.toLowerCase() ?? 'idle';
  }

  get formattedTime(): string {
    if (!this.step?.timestamp) return '';
    return new Date(this.step.timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  setSelectedPilotSid(sid: string = '') {
    if (!sid) return
    if (!this.selectedPilotSid) this.selectedPilotSid = sid;
    if (this.selectedPilotSid !== sid) this.selectedPilotSid = sid;
  }


  toggleExpand(event: MouseEvent): void {
    event.stopPropagation();
    if (this.expanded) return this.selectRequest('', '');
    this.selectRequest(
      this.step.step_code,
      this.step.request_id
    );
  }

  onInputChange(event: Event) : void {
    const input = event.target as HTMLTextAreaElement;
    const value = input.value;

    this.quickResponses.forEach(qr => {
      if (value.toUpperCase().includes(qr)) {
        this.response = formatQuickResponse(qr as QuickResponse, this.step.step_code as StepCode) || this.response;
      }
    });

  }

  submitResponse(event: Event): void {
    event.stopPropagation();
    const formattedResponse = this.response.trim();
    if (!formattedResponse) return;

    const payload : StepUpdate = {
      pilot_sid: this.selectedPilotSid,
      step_code: this.step.step_code,
      request_id: this.step.request_id,
      message: formattedResponse
    }

    this.mainPageService.sendResponse(payload);
    this.response = '';
    this.smartResponses = [];
  }

  selectRequest(stepCode: string, requestId: string): void {
    const requestInfo: SelectedRequestInfo = { stepCode, requestId };
    this.mainPageService.selectRequest(requestInfo);
  }

  getStepTooltip(step: StepPublicView): string {
    return `
CODE: ${step.step_code}
STATUS: ${step.status}
LABEL: ${step.label}
MESSAGE: ${step.message}
TIME: ${this.formatTimestamp(step.timestamp)}
VALIDATED: ${this.formatTimestamp(step.validated_at)}
REQUEST ID: ${step.request_id}
`.trim();
  }

  formatTimestamp(ts: number | null | undefined): string {
    if (!ts) return '—';
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  setQuickResponse(text: string, event: MouseEvent): void {
    event.stopPropagation();
    const selectedStepCode = this.selectedRequestInfo?.stepCode as StepCode;
    if (!selectedStepCode) return;
    const formattedText = formatQuickResponse(text as QuickResponse, selectedStepCode);
    if (!formattedText) return;
    this.response = formattedText;
  }

  applySmart(text: string, event: MouseEvent): void {
    event.stopPropagation();
    this.response = text;
  }
}
