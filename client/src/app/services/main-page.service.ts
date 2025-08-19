import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { AckUpdatePayload, PilotPublicView, StepPublicView } from '@app/interfaces/Publics';
import { ClientSocketService } from './client-socket.service';
import { CommunicationService, ErrorMessage } from './communication.service';
import { Atc } from '@app/interfaces/Atc';
import { SelectedRequestInfo } from '@app/interfaces/SelectedRequest';
import { ClearanceSocketPayload, ResponseCache, StepUpdate } from '@app/interfaces/Payloads'; // SmartResponse
import { StepStatus } from '@app/interfaces/StepStatus';

@Injectable({
  providedIn: 'root'
})
export class MainPageService {
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$: Observable<boolean> = this.isConnectedSubject.asObservable();
  
  pilotsPreviewsSubject = new BehaviorSubject<PilotPublicView[]>([]);
  pilotsPreviews$: Observable<PilotPublicView[]> = this.pilotsPreviewsSubject.asObservable()
  
  selectedPilotSubject = new BehaviorSubject<PilotPublicView | null>(null);
  selectedPilot$: Observable<PilotPublicView | null> = this.selectedPilotSubject.asObservable();

  private selectedRequestIdSubject = new BehaviorSubject<SelectedRequestInfo>({stepCode: "", requestId: ""});
  selectedRequestId$ = this.selectedRequestIdSubject.asObservable()
  
  private atcSubject = new BehaviorSubject<Atc[]>([]);
  atcList$: Observable<Atc[]> = this.atcSubject.asObservable();

  private smartResponsesSubject = new BehaviorSubject<string[]>([]);
  smartResponses$: Observable<string[]> = this.smartResponsesSubject.asObservable()
  responseCache: ResponseCache = {}; // pilotSid -> stepCode -> responses

  atcCount$: Observable<string[]> = this.atcSubject.asObservable().pipe(
    map(atcs => atcs.map(atc => atc.sid.substring(0, 6).toUpperCase()))
  );
  pilotConnection$: Observable<number> = this.pilotsPreviewsSubject.asObservable().pipe(
    map(pilots => pilots.length)
  );

  constructor(
    private readonly clientSocketService: ClientSocketService,
    private readonly communicationService: CommunicationService,
  ) {
    this.listenToSocketEvents();
  }

  private listenToSocketEvents(): void {
    // connections events
    this.clientSocketService.listen('connect', this.onConnect);
    this.clientSocketService.listen('disconnect', this.onDisconnect);

    // pilot events
    this.clientSocketService.listen<PilotPublicView[]>('pilot_list', this.pilotListUpdate);
    this.clientSocketService.listen<PilotPublicView>('pilot_connected', this.onNewPilotPublicView)
    this.clientSocketService.listen<string>('pilot_disconnected', this.onPilotDisconnect)
    this.clientSocketService.listen<AckUpdatePayload>('new_request', this.onNewRequest)
    this.clientSocketService.listen<ClearanceSocketPayload>('clearance_sent', this.onClearanceReceived);

    // atc events 
    this.clientSocketService.listen<Atc[]>('atc_list', this.onAtcListUpdate);
    this.clientSocketService.listen<Atc>("selected_pilot", this.onAtcPilotSelect);

    
    // global error handling
    this.clientSocketService.listen<{message:string}>('error', this.onError)
  }

  private buildStepViewFromAck(payload: AckUpdatePayload): StepPublicView {
    return {
      step_code: payload.step_code,
      label: payload.label,
      status: payload.status,
      message: payload.message,
      timestamp: Date.now(), // ou un autre timestamp si nécessaire
      validated_at: payload.validated_at,
      request_id: payload.request_id,
      time_left: payload.time_left ?? null
    };
  }

  private updatePilotPreview(pilot: PilotPublicView, payload: AckUpdatePayload): void {
    pilot.steps[payload.step_code] = this.buildStepViewFromAck(payload);
  
    pilot.history.push({
      step_code: payload.step_code,
      status: payload.status,
      timestamp: payload.validated_at,
      message: payload.message,
      request_id: payload.request_id
    });
  }

  private updatePilotStep(pilotUpdate: AckUpdatePayload): void {
    const currentPreviews = this.pilotsPreviewsSubject.getValue();
    const pilotIndex = currentPreviews.findIndex(p => p.sid === pilotUpdate.pilot_sid);
    if (pilotIndex === -1) return;
  
    const pilot = currentPreviews[pilotIndex];
    if (!pilot) return;
  
    this.updatePilotPreview(pilot, pilotUpdate);
  
    this.pilotsPreviewsSubject.next([...currentPreviews]);
  
    const selectedPilot = this.selectedPilotSubject.getValue();
    if (pilot.sid !== selectedPilot?.sid) pilot.notificationCount += 1;
    else this.selectedPilotSubject.next(pilot);
  
    const lastIndx = pilot.history.length - 1;
    const currentStep = pilot.history[lastIndx];
    const selectedStep = this.selectedRequestIdSubject.getValue();
    if (
      selectedStep.stepCode === currentStep?.step_code &&
      selectedStep.requestId !== currentStep?.request_id
    ) {
      this.selectedRequestIdSubject.next({
        stepCode: currentStep.step_code,
        requestId: currentStep.request_id
      });
    }
  }
  

  getPilotBySid(sid: string): PilotPublicView | undefined {
    return this.pilotsPreviewsSubject.getValue().find(pilot => pilot.sid === sid);
  }

  getPilotSteps(sid: string): Record<string, StepPublicView> {
    const pilot = this.getPilotBySid(sid);
    return pilot ? pilot.steps : {};
  }

  getActiveStep(sid: string): StepPublicView[] {
    const pilot = this.getPilotBySid(sid);
    if (!pilot) return [];
    
    return Object.values(pilot.steps).filter(
      step => [StepStatus.NEW, StepStatus.LOADED, StepStatus.EXECUTED, StepStatus.STANDBY].includes(step.status)
    );
  }

  getPilotColor(sid: string): string {
    const currentPreviews = this.pilotsPreviewsSubject.getValue();
    const pilot = currentPreviews.find(p => p.sid === sid);
    return pilot?.color || '#fffff';
  }

  selectRequest(requestInfo : SelectedRequestInfo): void {
    this.selectedRequestIdSubject.next(requestInfo);
  }

  selectPilot(pilotSid: string, sendRequest: boolean = true): void {
    console.log('send request:', sendRequest, 'pilotSid:', pilotSid);
    if(sendRequest) this.clientSocketService.send('selectPilot', pilotSid);
    if (this.selectedPilotSubject.getValue()?.sid === pilotSid) {
      this.selectedPilotSubject.next(null);
      return;
    }
    const currentPreviews = this.pilotsPreviewsSubject.getValue();
    const selectedPilot = currentPreviews.find(pilot => pilot.sid === pilotSid) || null;
    if (selectedPilot) selectedPilot.notificationCount = 0;
    if (!this.isPilotRequest(selectedPilot)) this.selectedRequestIdSubject.next({stepCode: "", requestId: ""});
    this.selectedPilotSubject.next(selectedPilot);
  }

  isSelectedPilot(pilotSid: string): boolean {
    const currPilot = this.selectedPilotSubject.getValue();
    return currPilot?.sid === pilotSid;
  }

  isPilotRequest(pilot : PilotPublicView | null) : boolean {
    if (!pilot) return false;
    const selectedRequest = this.selectedRequestIdSubject.getValue();
    return pilot.history.some(step => step.request_id === selectedRequest.requestId && step.step_code === selectedRequest.stepCode);
  }

  getSid(): string | null {
    return this.clientSocketService.getSocketId();
  }

  // private setPilotCache(payload: SmartResponse) {
  //   const { responses, pilot_sid, step_code } = payload;
  
  //   if (!this.responseCache[pilot_sid]) this.responseCache[pilot_sid] = {};
  
  //   this.responseCache[pilot_sid][step_code] = {
  //     responses: responses
  //   };
  // }

  // === Socket Event Handlers ===
  private onConnect = () => {
    this.isConnectedSubject.next(true);
  }

  private onDisconnect = () => {
    this.isConnectedSubject.next(false);
    this.pilotsPreviewsSubject.next([]);
    this.selectedPilotSubject.next(null);
    this.selectedRequestIdSubject.next({stepCode: "", requestId: ""});
  }

  private onNewPilotPublicView = (preview: PilotPublicView) => {
    preview.notificationCount = 0;
    preview.renderClearance = true

    const currentPreviews = this.pilotsPreviewsSubject.getValue();
    this.pilotsPreviewsSubject.next([...currentPreviews, preview]);
  
    if (this.selectedPilotSubject.getValue()?.sid === preview.sid) {
      this.selectedPilotSubject.next(preview);
    }
  };
    
  private onPilotDisconnect = (pilotSid: string) => {
    console.log('Pilot disconnected:', pilotSid);
    const currentPreviews = this.pilotsPreviewsSubject.getValue();
    const updatedPreviews = currentPreviews.filter(pilot => pilot.sid !== pilotSid);
    this.pilotsPreviewsSubject.next(updatedPreviews);
    if (this.selectedPilotSubject.getValue()?.sid === pilotSid) this.selectPilot(pilotSid);
  }

  private onNewRequest = (payload: AckUpdatePayload) => {
    console.log('New Request Payload:', payload);
    this.updatePilotStep(payload);
  }

  private pilotListUpdate = (pilots: PilotPublicView[]) => {
    pilots.forEach(pilot => {
      pilot.notificationCount = 0;
      pilot.renderClearance = true;
    });
    this.pilotsPreviewsSubject.next(pilots);
  }

  private onAtcListUpdate = (atcList: Atc[]) => {
    atcList.forEach(atc => {
      atc.sid = atc.sid.substring(0, 6).toUpperCase();
    });
    this.atcSubject.next(atcList);
  }

  private onAtcPilotSelect = (atc: Atc) => {
    const frontSid = atc.sid.substring(0, 6).toUpperCase();
    const currentAtcList = this.atcSubject.getValue();
    const atcIdx = currentAtcList.findIndex(a => a.sid === frontSid);
    if (atcIdx === -1) return;
    const updatedAtcList = [...currentAtcList];
    updatedAtcList[atcIdx] = {
      ...currentAtcList[atcIdx],
      selectedPilot: atc.selectedPilot
    };
    this.atcSubject.next(updatedAtcList);
  }

  private onClearanceReceived = (payload: ClearanceSocketPayload) => {
    const { pilot_sid } = payload; //, clearance, expected
    const currentPreviews = this.pilotsPreviewsSubject.getValue();
    const pilotIndex = currentPreviews.findIndex(p => p.sid === pilot_sid);
    if (pilotIndex === -1) return;

    const pilot = currentPreviews[pilotIndex];
    // if (!pilot.clearances) pilot.clearances = [];
    
    // pilot.clearances.push(clearance);
    // if (expected) {
    //   pilot.clearances[0] = clearance;
    //   this.setPilotCache({
    //     responses: [clearance.instruction],
    //     step_code: 'DM_136',
    //     pilot_sid: pilot.sid
    //   });
    // }
    
    currentPreviews[pilotIndex] = pilot;
    this.pilotsPreviewsSubject.next(currentPreviews);
    this.smartResponsesSubject.next(this.responseCache[pilot_sid]?.['DM_136']?.responses || []);

    if (this.selectedPilotSubject.getValue()?.sid === pilot_sid) this.selectedPilotSubject.next(pilot)
  }

  private onError = (payload : ErrorMessage) => {
    this.communicationService.handleError(payload.message)
  }
  
  // === Public ===
  // GET
  fetchPilotPublicViews(): void {
    this.clientSocketService.send('getPilotList');
  }

  fetchSmartResponse(pilotSid: string, stepCode: string): void {
    const cachedResponses = this.responseCache[pilotSid]?.[stepCode]?.responses;
    console.log('Cached Responses:', cachedResponses);
    this.smartResponsesSubject.next(cachedResponses);
  }

  
  fetchClearance(pilotSid: string, stepCode: string): void {
    if (!['DM_136', 'DM_135'].includes(stepCode)) this.communicationService.handleError('Invalid Request');
    if (!pilotSid || !stepCode) return this.communicationService.handleError('Invalid Payload');
    const expected = stepCode === 'DM_136';
    const payload = { pilot_sid: pilotSid, expected: expected };
    this.clientSocketService.send('clearance', payload);
  }

  // SEND
  sendResponse(payload : StepUpdate): void {
    const { pilot_sid, step_code, request_id, message } = payload;
    if (!pilot_sid || !step_code || !request_id || !message) return this.communicationService.handleError('Invalid Payload');
    this.clientSocketService.send('send_step_update', payload);
  }
}