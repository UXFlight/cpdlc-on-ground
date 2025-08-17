export type StepCode = 'DM_136' | 'DM_134' | 'DM_131' | 'DM_135' | 'DM_127';
export type QuickResponse = 'AFFIRM' | 'NEGATIVE' | 'STANDBY' | 'UNABLE';

const QUICK_RESPONSES: Record<StepCode, Partial<Record<QuickResponse, string>>> = {
  DM_136: { // Expected Taxi Clearance
    NEGATIVE: "Expected taxi route rejected.",
    STANDBY: "Standby for expected taxi route.",
    UNABLE: "Unable to confirm expected taxi route."
  },
  DM_134: { // Engine Startup
    AFFIRM: "Engine start approved.",
    NEGATIVE: "Engine start not approved.",
    STANDBY: "Standby for engine start clearance.",
    UNABLE: "Unable to approve engine start."
  },
  DM_131: { // Pushback
    AFFIRM: "Pushback approved. Start when ready.",
    NEGATIVE: "Pushback not approved at this time.",
    STANDBY: "Standby for pushback clearance.",
    UNABLE: "Unable to approve pushback."
  },
  DM_135: { // Taxi Clearance
    NEGATIVE: "Taxi clearance denied.",
    STANDBY: "Standby for taxi clearance.",
    UNABLE: "Unable to issue taxi clearance."
  },
  DM_127: { // De-Icing
    AFFIRM: "De-icing approved. Proceed to de-icing pad.",
    NEGATIVE: "De-icing request denied.",
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
