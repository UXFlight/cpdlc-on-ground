export type StepCode = 'DM_134' | 'DM_131' | 'DM_127';
export type QuickResponse = 'AFFIRM' | 'STANDBY' | 'UNABLE';

const QUICK_RESPONSES: Record<StepCode, Partial<Record<QuickResponse, string>>> = {
  DM_134: { // Engine Startup
    AFFIRM: "Engine start approved.",
    STANDBY: "Standby for engine start clearance.",
    UNABLE: "Unable to approve engine start."
  },
  DM_131: { // Pushback
    AFFIRM: "Pushback approved. Start when ready.",
    STANDBY: "Standby for pushback clearance.",
    UNABLE: "Unable to approve pushback."
  },
  DM_127: { // De-Icing
    AFFIRM: "De-icing approved. Proceed to de-icing pad.",
    STANDBY: "Standby for de-icing instructions.",
    UNABLE: "Unable to approve de-icing at this time."
  }
};

export const formatQuickResponse = (quick: QuickResponse, stepCode: StepCode): string => {
    return QUICK_RESPONSES[stepCode]?.[quick] ?? '';
};

export const getQReponseByStepCode = (stepCode: StepCode): string[] => {
    return Object.keys(QUICK_RESPONSES[stepCode]);
}
