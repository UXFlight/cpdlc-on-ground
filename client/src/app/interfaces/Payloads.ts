export interface SmartResponse {
    responses: string[];
    step_code: string;
    pilot_sid: string
}

export interface StepUpdate {
    pilot_sid: string;
    step_code: string;
    message: string;
    request_id: string;
    action: string;
}

export interface ResponseCache {
    [pilotSid: string]: {
        [stepCode: string]: {
            responses: string[];
        };
    };
}
