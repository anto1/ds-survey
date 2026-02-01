"use client";

import { ChannelList } from "./channel-list";
import { AddChannelDialog } from "./add-channel-dialog";
import { Button } from "@/components/ui/button";
import { MAX_KNOWN_CHANNELS } from "@/lib/validation";
import type { Channel } from "@/actions/channels";

type Props = {
  channels: Channel[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onChannelAdded: (channel: Channel) => void;
  onNext: () => void;
  onSkipAll: () => void;
};

export function StepAwareness({
  channels,
  selectedIds,
  onToggle,
  onChannelAdded,
  onNext,
  onSkipAll,
}: Props) {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Шаг 1 из 3
        </p>
        <h1 className="text-2xl sm:text-3xl font-normal leading-tight">
          Какие дизайн-каналы на YouTube вы знаете?
        </h1>
        <p className="text-muted-foreground">
          Выберите все каналы, которые вам знакомы, даже если вы их не смотрите.
        </p>
      </header>

      <ChannelList
        channels={channels}
        selectedIds={selectedIds}
        onToggle={onToggle}
        maxSelections={MAX_KNOWN_CHANNELS}
      />

      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-border">
        <div className="flex items-center gap-6">
          <AddChannelDialog onChannelAdded={onChannelAdded} />
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} выбрано
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSkipAll}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Никого не знаю
          </button>
          <Button onClick={onNext} className="rounded-none">
            Далее →
          </Button>
        </div>
      </footer>
    </div>
  );
}
