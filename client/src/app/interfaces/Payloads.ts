import { Clearance } from "./Publics";

export interface SmartResponse {
    responses: string[];
    step_code: string;
    pilot_sid: string
}

export interface StepUpdate {
    pilot_sid: string;
    step_code: string;
    request_id: string;
    message: string;
}

export interface ResponseCache {
    [pilotSid: string]: {
        [stepCode: string]: {
            responses: string[];
        };
    };
}

export interface ClearanceSocketPayload {
    pilot_sid: string;
    clearance: Clearance;
    expected: boolean;
}