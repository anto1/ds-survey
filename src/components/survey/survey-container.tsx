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
        // Also remove from watched if unchecked
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
    // Auto-select as known
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
    formData.set("website", ""); // Honeypot

    startTransition(async () => {
      const result = await submitSurvey(formData);

      if (result.success) {
        setStep("complete");
      } else {
        setError(result.error || "Failed to submit");
      }
    });
  }, [knownChannelIds, watchedChannelIds]);

  if (hasExistingSubmission && step !== "complete") {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-light mb-4">Already submitted</h2>
        <p className="text-muted-foreground">
          You have already submitted a response. Please try again tomorrow.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-survey mx-auto px-4 py-12">
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
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
