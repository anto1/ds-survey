"use client";

import { useTransition } from "react";
import { approveChannel, rejectChannel } from "@/actions/admin";

type Props = {
  channelId: string;
  channelName: string;
};

export function ChannelActions({ channelId, channelName }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      await approveChannel(channelId);
    });
  };

  const handleReject = () => {
    if (confirm(`Удалить канал "${channelName}"?`)) {
      startTransition(async () => {
        await rejectChannel(channelId);
      });
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="px-3 py-1 text-xs border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Одобрить"}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="px-3 py-1 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  );
}
