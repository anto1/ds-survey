"use client";

import { type StatItem } from "@/actions/admin";

type Props = {
  title: string;
  data: StatItem[];
};

export function BarChart({ title, data }: Props) {
  const maxPercentage = Math.max(...data.map((d) => d.percentage), 1);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">{title}</h2>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-6 w-full bg-muted/30 border border-border">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
