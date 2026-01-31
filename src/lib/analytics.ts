declare global {
  interface Window {
    fathom?: {
      trackEvent: (name: string, opts?: { _value?: number }) => void;
    };
  }
}

export function trackEvent(name: string) {
  if (typeof window !== "undefined" && window.fathom) {
    window.fathom.trackEvent(name);
  }
}

export const events = {
  STEP_1_VIEW: "step_1_view",
  STEP_2_VIEW: "step_2_view",
  SURVEY_SENT: "survey_sent",
  CHANNEL_ADDED: "channel_added",
} as const;
