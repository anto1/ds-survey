"use client";

import { useState } from "react";

type ChannelStat = {
  id: string;
  name: string;
  slug: string;
  awareness: number;
  watching: number;
};

type SortKey = "name" | "awareness" | "watching" | "conversion";
type SortDir = "asc" | "desc";

type Props = {
  data: ChannelStat[];
};

export function ChannelStatsTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("awareness");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortKey) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "awareness":
        aVal = a.awareness;
        bVal = b.awareness;
        break;
      case "watching":
        aVal = a.watching;
        bVal = b.watching;
        break;
      case "conversion":
        aVal = a.awareness > 0 ? a.watching / a.awareness : 0;
        bVal = b.awareness > 0 ? b.watching / b.awareness : 0;
        break;
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ label, keyName }: { label: string; keyName: SortKey }) => (
    <th
      className="py-3 px-2 text-right cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => handleSort(keyName)}
    >
      {label}
      {sortKey === keyName && (
        <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th
              className="py-3 px-2 cursor-pointer hover:text-foreground transition-colors select-none"
              onClick={() => handleSort("name")}
            >
              Канал
              {sortKey === "name" && (
                <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
              )}
            </th>
            <SortHeader label="Знают" keyName="awareness" />
            <SortHeader label="Смотрят" keyName="watching" />
            <SortHeader label="Конверсия" keyName="conversion" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((ch) => (
            <tr key={ch.id} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-3 px-2">{ch.name}</td>
              <td className="py-3 px-2 text-right tabular-nums">{ch.awareness}</td>
              <td className="py-3 px-2 text-right tabular-nums">{ch.watching}</td>
              <td className="py-3 px-2 text-right tabular-nums">
                {ch.awareness > 0 ? `${Math.round((ch.watching / ch.awareness) * 100)}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
