"use client";

import { ChannelList } from "./channel-list";
import { AddChannelDialog } from "./add-channel-dialog";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./progress-indicator";
import { MAX_KNOWN_CHANNELS } from "@/lib/validation";
import type { Channel } from "@/actions/channels";

type Props = {
  channels: Channel[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onChannelAdded: (channel: Channel) => void;
  onNext: () => void;
  onSkip: () => void;
};

export function StepAwareness({
  channels,
  selectedIds,
  onToggle,
  onChannelAdded,
  onNext,
  onSkip,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <ProgressIndicator currentStep={1} />
        <h1 className="text-3xl font-light tracking-tight mt-6">
          Which design YouTube channels do you know?
        </h1>
        <p className="text-muted-foreground">
          Select all channels you recognize, even if you don&apos;t watch them.
        </p>
      </div>

      <ChannelList
        channels={channels}
        selectedIds={selectedIds}
        onToggle={onToggle}
        maxSelections={MAX_KNOWN_CHANNELS}
      />

      <div className="flex items-center justify-between border-t border-border/50 pt-6">
        <div className="flex items-center gap-4">
          <AddChannelDialog onChannelAdded={onChannelAdded} />
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} channel{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={onNext}>
            Next step
          </Button>
        </div>
      </div>
    </div>
  );
}
