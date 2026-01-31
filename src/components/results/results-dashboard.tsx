"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { verifyAdminPassword, getSurveyResults, type SurveyResults } from "@/actions/admin";

export function ResultsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState<"awareness" | "watching" | "ratio">("awareness");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const valid = await verifyAdminPassword(password);

      if (valid) {
        setIsAuthenticated(true);
        const data = await getSurveyResults();
        setResults(data);
      } else {
        setError("Неверный пароль");
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-light text-center">Доступ для админа</h1>
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Проверка..." : "Войти"}
          </Button>
        </form>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const sortedChannels = [...results.channelStats].sort((a, b) => {
    if (sortBy === "awareness") return b.awarenessCount - a.awarenessCount;
    if (sortBy === "watching") return b.watchingCount - a.watchingCount;
    return b.ratio - a.ratio;
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light">Результаты опроса</h1>
          <p className="text-muted-foreground">
            Всего ответов: {results.totalSubmissions}
          </p>
        </div>

        {/* Channel Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Статистика каналов</h2>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "awareness" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("awareness")}
              >
                Знают
              </Button>
              <Button
                variant={sortBy === "watching" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("watching")}
              >
                Смотрят
              </Button>
              <Button
                variant={sortBy === "ratio" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("ratio")}
              >
                Конверсия
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Канал</th>
                  <th className="text-center px-4 py-3 font-medium">Статус</th>
                  <th className="text-right px-4 py-3 font-medium">Знают</th>
                  <th className="text-right px-4 py-3 font-medium">Смотрят</th>
                  <th className="text-right px-4 py-3 font-medium">Конверсия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedChannels.map((channel) => (
                  <tr key={channel.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{channel.name}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={channel.status === "approved" ? "secondary" : "pending"}
                      >
                        {channel.status === "approved" ? "одобрен" : "на модерации"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {channel.awarenessCount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {channel.watchingCount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {(channel.ratio * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Suggestions */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium">
            Предложенные каналы ({results.pendingSuggestions.length})
          </h2>

          {results.pendingSuggestions.length === 0 ? (
            <p className="text-muted-foreground">Нет предложений</p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Название</th>
                    <th className="text-left px-4 py-3 font-medium">Ссылка</th>
                    <th className="text-left px-4 py-3 font-medium">Комментарий</th>
                    <th className="text-left px-4 py-3 font-medium">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.pendingSuggestions.map((suggestion) => (
                    <tr key={suggestion.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">{suggestion.name}</td>
                      <td className="px-4 py-3">
                        {suggestion.youtubeUrl ? (
                          <a
                            href={suggestion.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Ссылка
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {suggestion.note || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(suggestion.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
