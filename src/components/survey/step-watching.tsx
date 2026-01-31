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
          Какие из этих каналов вы действительно смотрите?
        </h1>
        <p className="text-muted-foreground">
          Здесь показаны только каналы, которые вы отметили как знакомые.
        </p>
      </div>

      {eligibleChannels.length === 0 ? (
        <div className="rounded-lg border border-border/50 p-8 text-center">
          <p className="text-muted-foreground">
            Вы не выбрали ни одного канала на предыдущем шаге.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Добавьте канал ниже или вернитесь назад.
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
            Выбрано: {watchedChannelIds.size}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
            Назад
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Отправить"}
          </Button>
        </div>
      </div>

      {!canSubmit && (
        <p className="text-center text-sm text-muted-foreground">
          Выберите хотя бы 1 канал или добавьте новый для отправки.
        </p>
      )}
    </div>
  );
}
