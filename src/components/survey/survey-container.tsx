"use client";

import { useState, useTransition, useCallback } from "react";
import { StepAwareness } from "./step-awareness";
import { StepWatching } from "./step-watching";
import { ThankYou } from "./thank-you";
import { submitSurvey } from "@/actions/survey";
import type { Channel } from "@/actions/channels";

type Step = "awareness" | "watching" | "complete";

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
  const [addedChannelsCount, setAddedChannelsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    setChannels((prev) => [...prev, channel].sort((a, b) => a.name.localeCompare(b.name)));
    setKnownChannelIds((prev) => {
      const next = new Set(prev);
      next.add(channel.id);
      return next;
    });
    setAddedChannelsCount((c) => c + 1);
  }, []);

  const handleNext = useCallback(() => {
    setStep("watching");
  }, []);

  const handleSkip = useCallback(() => {
    setKnownChannelIds(new Set());
    setStep("watching");
  }, []);

  const handleBack = useCallback(() => {
    setStep("awareness");
  }, []);

  const handleSubmit = useCallback(() => {
    setError(null);

    const formData = new FormData();
    formData.set("knownChannels", JSON.stringify(Array.from(knownChannelIds)));
    formData.set("watchedChannels", JSON.stringify(Array.from(watchedChannelIds)));
    formData.set("website", "");

    startTransition(async () => {
      const result = await submitSurvey(formData);

      if (result.success) {
        setStep("complete");
      } else {
        setError(result.error || "Ошибка");
      }
    });
  }, [knownChannelIds, watchedChannelIds]);

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
    <div className="w-full max-w-2xl mx-auto px-6 py-16 sm:py-24">
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
          onNext={handleNext}
          onSkip={handleSkip}
        />
      )}

      {step === "watching" && (
        <StepWatching
          allChannels={channels}
          knownChannelIds={knownChannelIds}
          watchedChannelIds={watchedChannelIds}
          onToggle={handleToggleWatched}
          onChannelAdded={handleChannelAdded}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          addedChannelsCount={addedChannelsCount}
        />
      )}

      {step === "complete" && <ThankYou />}
    </div>
  );
}
