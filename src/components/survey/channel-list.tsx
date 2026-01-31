"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Channel } from "@/actions/channels";

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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border/50">
        {filteredChannels.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">
            No channels found
          </p>
        ) : (
          <ul className="divide-y divide-border/30">
            {filteredChannels.map((channel) => {
              const isSelected = selectedIds.has(channel.id);
              const isDisabled = Boolean(!isSelected && isMaxReached);

              return (
                <li key={channel.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/5 ${
                      isDisabled ? "cursor-not-allowed opacity-50" : ""
                    } ${isSelected ? "bg-accent/10" : ""}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => !isDisabled && onToggle(channel.id)}
                      disabled={isDisabled}
                    />
                    <span className="flex-1 text-sm">{channel.name}</span>
                    {channel.status === "pending" && (
                      <Badge variant="pending" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isMaxReached && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxSelections} selections reached
        </p>
      )}
    </div>
  );
}
