"use client";

import { useMemo } from "react";
import { ChannelList } from "./channel-list";
import { AddChannelDialog } from "./add-channel-dialog";
import { Button } from "@/components/ui/button";
import { MAX_WATCHED_CHANNELS } from "@/lib/validation";
import type { Channel } from "@/actions/channels";

type Props = {
  allChannels: Channel[];
  knownChannelIds: Set<string>;
  watchedChannelIds: Set<string>;
  onToggle: (id: string) => void;
  onChannelAdded: (channel: Channel) => void;
  onBack: () => void;
  onNext: () => void;
  onSkipAll: () => void;
};

export function StepWatching({
  allChannels,
  knownChannelIds,
  watchedChannelIds,
  onToggle,
  onChannelAdded,
  onBack,
  onNext,
  onSkipAll,
}: Props) {
  const eligibleChannels = useMemo(() => {
    return allChannels.filter((c) => knownChannelIds.has(c.id));
  }, [allChannels, knownChannelIds]);

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Шаг 2 из 3
        </p>
        <h1 className="text-2xl sm:text-3xl font-normal leading-tight">
          Какие из этих каналов вы смотрите?
        </h1>
        <p className="text-muted-foreground">
          Здесь только каналы, которые вы отметили как знакомые.
        </p>
      </header>

      {eligibleChannels.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Вы не выбрали ни одного канала на предыдущем шаге.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Добавьте канал или вернитесь назад.
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

      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-border">
        <AddChannelDialog onChannelAdded={onChannelAdded} />

        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Назад
          </button>
          <Button variant="outline" onClick={onSkipAll} className="rounded-none">
            Никого не смотрю
          </Button>
          <Button onClick={onNext} className="rounded-none">
            Далее →
          </Button>
        </div>
      </footer>
    </div>
  );
}
