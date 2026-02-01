"use client";

type StackedBarItem = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

type Props = {
  title: string;
  data: StackedBarItem[];
  total: number;
};

const colors = [
  "bg-foreground",
  "bg-foreground/80",
  "bg-foreground/60",
  "bg-foreground/40",
  "bg-foreground/25",
  "bg-foreground/15",
];

export function StackedBarChart({ title, data, total }: Props) {
  if (data.length === 0 || total === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm text-muted-foreground uppercase tracking-wider">
        {title}
      </h2>

      {/* Stacked bar */}
      <div className="h-8 w-full flex border border-border overflow-hidden">
        {data.map((item, index) => (
          <div
            key={item.id}
            className={`${colors[index % colors.length]} transition-all duration-300 relative group`}
            style={{ width: `${item.percentage}%` }}
            title={`${item.label}: ${item.count} (${item.percentage.toFixed(1)}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {data.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${colors[index % colors.length]} border border-border`} />
            <span>
              {item.label}
              <span className="text-muted-foreground ml-1">
                {item.count} ({item.percentage.toFixed(0)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
