"use client";

import { useMemo } from "react";
import { ChannelList } from "./channel-list";
import { AddChannelDialog } from "./add-channel-dialog";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./progress-indicator";
import { MAX_WATCHED_CHANNELS } from "@/lib/validation";
import type { Channel } from "@/actions/channels";

type Props = {
  allChannels: Channel[];
  knownChannelIds: Set<string>;
  watchedChannelIds: Set<string>;
  onToggle: (id: string) => void;
  onChannelAdded: (channel: Channel) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  addedChannelsCount: number;
};

export function StepWatching({
  allChannels,
  knownChannelIds,
  watchedChannelIds,
  onToggle,
  onChannelAdded,
  onBack,
  onSubmit,
  isSubmitting,
  addedChannelsCount,
}: Props) {
  // Only show channels that were marked as known in step 1
  const eligibleChannels = useMemo(() => {
    return allChannels.filter((c) => knownChannelIds.has(c.id));
  }, [allChannels, knownChannelIds]);

  const canSubmit =
    watchedChannelIds.size >= 1 || addedChannelsCount >= 1;

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <ProgressIndicator currentStep={2} />
        <h1 className="text-3xl font-light tracking-tight mt-6">
          Which of these channels do you actually watch?
        </h1>
        <p className="text-muted-foreground">
          Only channels you marked as &quot;known&quot; are shown here.
        </p>
      </div>

      {eligibleChannels.length === 0 ? (
        <div className="rounded-lg border border-border/50 p-8 text-center">
          <p className="text-muted-foreground">
            You didn&apos;t select any channels in the previous step.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Add a channel below or go back to select known channels.
          </p>
        </div>
      ) : (
        <ChannelList
          channels={eligibleChannels}
          selectedIds={watchedChannelIds}
          onToggle={onToggle}
          maxSelections={MAX_WATCHED_CHANNELS}
        />
      )}

      <div className="flex items-center justify-between border-t border-border/50 pt-6">
        <div className="flex items-center gap-4">
          <AddChannelDialog onChannelAdded={onChannelAdded} />
          <span className="text-sm text-muted-foreground">
            {watchedChannelIds.size} channel{watchedChannelIds.size !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      {!canSubmit && (
        <p className="text-center text-sm text-muted-foreground">
          Select at least 1 channel you watch, or add a new channel to submit.
        </p>
      )}
    </div>
  );
}
