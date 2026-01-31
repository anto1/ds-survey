"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Channel } from "@/actions/channels";

function extractHandle(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/@([^/]+)/);
  return match ? `@${match[1]}` : null;
}

type Props = {
  channels: Channel[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  maxSelections?: number;
};

export function ChannelList({
  channels,
  selectedIds,
  onToggle,
  maxSelections,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;
    const query = search.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(query));
  }, [channels, search]);

  const isMaxReached = maxSelections !== undefined && selectedIds.size >= maxSelections;

  return (
    <div className="space-y-8">
      <Input
        type="text"
        placeholder="Поиск..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:max-w-xs border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent text-base"
      />

      {filteredChannels.length === 0 ? (
        <p className="text-muted-foreground">Ничего не найдено</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
          {filteredChannels.map((channel) => {
            const isSelected = selectedIds.has(channel.id);
            const isDisabled = Boolean(!isSelected && isMaxReached);

            const handle = extractHandle(channel.youtubeUrl);

            return (
              <label
                key={channel.id}
                className={`flex items-center gap-3 py-2 sm:py-1 cursor-pointer group ${
                  isDisabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => !isDisabled && onToggle(channel.id)}
                  disabled={isDisabled}
                  className="rounded-none border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground shrink-0"
                />
                <span className={`text-sm transition-colors ${
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}>
                  {channel.name}
                  {handle && (
                    <span className="ml-1.5 text-muted-foreground/50">{handle}</span>
                  )}
                  {channel.status === "pending" && (
                    <span className="ml-2 text-xs text-muted-foreground/60">•</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {isMaxReached && (
        <p className="text-xs text-muted-foreground">
          Лимит: {maxSelections}
        </p>
      )}
    </div>
  );
}
