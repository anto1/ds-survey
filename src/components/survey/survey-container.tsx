"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { StepAwareness } from "./step-awareness";
import { StepWatching } from "./step-watching";
import { StepAbout } from "./step-about";
import { ThankYou } from "./thank-you";
import { submitSurvey } from "@/actions/survey";
import { trackEvent, events } from "@/lib/analytics";
import type { Channel } from "@/actions/channels";

type Step = "awareness" | "watching" | "about" | "complete";

type Props = {
  initialChannels: Channel[];
  hasExistingSubmission: boolean;
};

export function SurveyContainer({ initialChannels, hasExistingSubmission }: Props) {
  const [step, setStep] = useState<Step>(
    hasExistingSubmission ? "complete" : "awareness"
  );
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [knownChannelIds, setKnownChannelIds] = useState<Set<string>>(new Set());
  const [watchedChannelIds, setWatchedChannelIds] = useState<Set<string>>(new Set());
  const [profession, setProfession] = useState<string | null>(null);
  const [workplace, setWorkplace] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track step 1 view on mount
  useEffect(() => {
    if (!hasExistingSubmission) {
      trackEvent(events.STEP_1_VIEW);
    }
  }, [hasExistingSubmission]);

  const handleToggleKnown = useCallback((id: string) => {
    setKnownChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setWatchedChannelIds((w) => {
          const wNext = new Set(w);
          wNext.delete(id);
          return wNext;
        });
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleWatched = useCallback((id: string) => {
    setWatchedChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleChannelAdded = useCallback((channel: Channel) => {
    trackEvent(events.CHANNEL_ADDED);
    setChannels((prev) => [...prev, channel].sort((a, b) => a.name.localeCompare(b.name)));
    setKnownChannelIds((prev) => {
      const next = new Set(prev);
      next.add(channel.id);
      return next;
    });
  }, []);

  const handleNextToWatching = useCallback(() => {
    trackEvent(events.STEP_2_VIEW);
    setStep("watching");
  }, []);

  const handleSkipToAbout = useCallback(() => {
    trackEvent(events.STEP_3_VIEW);
    setKnownChannelIds(new Set());
    setWatchedChannelIds(new Set());
    setStep("about");
  }, []);

  const handleNextToAbout = useCallback(() => {
    trackEvent(events.STEP_3_VIEW);
    setStep("about");
  }, []);

  const handleSkipWatchingToAbout = useCallback(() => {
    trackEvent(events.STEP_3_VIEW);
    setWatchedChannelIds(new Set());
    setStep("about");
  }, []);

  const handleBackToAwareness = useCallback(() => {
    setStep("awareness");
  }, []);

  const handleBackToWatching = useCallback(() => {
    setStep("watching");
  }, []);

  const handleSubmit = useCallback(() => {
    setError(null);

    const formData = new FormData();
    formData.set("knownChannels", JSON.stringify(Array.from(knownChannelIds)));
    formData.set("watchedChannels", JSON.stringify(Array.from(watchedChannelIds)));
    formData.set("profession", profession || "");
    formData.set("workplace", workplace || "");
    formData.set("website", "");

    startTransition(async () => {
      const result = await submitSurvey(formData);

      if (result.success) {
        trackEvent(events.SURVEY_SENT);
        setStep("complete");
      } else {
        setError(result.error || "Ошибка");
      }
    });
  }, [knownChannelIds, watchedChannelIds, profession, workplace]);

  if (hasExistingSubmission && step !== "complete") {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-normal">Уже отправлено</h2>
        <p className="text-muted-foreground">
          Вы уже участвовали в опросе. Попробуйте завтра.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-16 sm:py-24">
      {error && (
        <div className="mb-8 p-4 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {step === "awareness" && (
        <StepAwareness
          channels={channels}
          selectedIds={knownChannelIds}
          onToggle={handleToggleKnown}
          onChannelAdded={handleChannelAdded}
          onNext={handleNextToWatching}
          onSkipAll={handleSkipToAbout}
        />
      )}

      {step === "watching" && (
        <StepWatching
          allChannels={channels}
          knownChannelIds={knownChannelIds}
          watchedChannelIds={watchedChannelIds}
          onToggle={handleToggleWatched}
          onChannelAdded={handleChannelAdded}
          onBack={handleBackToAwareness}
          onNext={handleNextToAbout}
          onSkipAll={handleSkipWatchingToAbout}
        />
      )}

      {step === "about" && (
        <StepAbout
          profession={profession}
          workplace={workplace}
          onProfessionChange={setProfession}
          onWorkplaceChange={setWorkplace}
          onBack={handleBackToWatching}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      )}

      {step === "complete" && <ThankYou />}
    </div>
  );
}
