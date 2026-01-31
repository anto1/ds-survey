import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { ChannelActions } from "./channel-actions";
import { AdminWrapper } from "./admin-wrapper";

export const metadata: Metadata = {
  title: "Админ — Опрос",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getSubmissions() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const channels = await prisma.channel.findMany();
  const channelMap = new Map(channels.map((c) => [c.id, c]));

  return { submissions, channelMap };
}

async function getStats() {
  const totalSubmissions = await prisma.submission.count();

  const professionStats = await prisma.submission.groupBy({
    by: ["profession"],
    _count: true,
    orderBy: { _count: { profession: "desc" } },
  });

  const workplaceStats = await prisma.submission.groupBy({
    by: ["workplace"],
    _count: true,
    orderBy: { _count: { workplace: "desc" } },
  });

  const countryStats = await prisma.submission.groupBy({
    by: ["country"],
    _count: true,
    orderBy: { _count: { country: "desc" } },
  });

  return { totalSubmissions, professionStats, workplaceStats, countryStats };
}

async function getPendingChannels() {
  return prisma.channel.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

async function getChannelStats(submissions: { knownChannels: unknown; watchedChannels: unknown }[]) {
  const channels = await prisma.channel.findMany({
    where: { status: "approved" },
    orderBy: { name: "asc" },
  });

  const awarenessMap = new Map<string, number>();
  const watchingMap = new Map<string, number>();

  for (const sub of submissions) {
    const known = sub.knownChannels as string[];
    const watched = sub.watchedChannels as string[];

    for (const id of known) {
      awarenessMap.set(id, (awarenessMap.get(id) || 0) + 1);
    }
    for (const id of watched) {
      watchingMap.set(id, (watchingMap.get(id) || 0) + 1);
    }
  }

  return channels
    .map((ch) => ({
      id: ch.id,
      name: ch.name,
      slug: ch.slug,
      awareness: awarenessMap.get(ch.id) || 0,
      watching: watchingMap.get(ch.id) || 0,
    }))
    .sort((a, b) => b.awareness - a.awareness);
}

export default async function AdminPage() {
  const { submissions, channelMap } = await getSubmissions();
  const stats = await getStats();
  const pendingChannels = await getPendingChannels();
  const channelStats = await getChannelStats(submissions);

  const professionLabels: Record<string, string> = {
    product: "Продуктовый дизайнер",
    graphic: "Графический дизайнер",
    marketer: "Маркетолог",
    copywriter: "Копирайтер",
    developer: "Разработчик",
    other: "Другое",
  };

  const workplaceLabels: Record<string, string> = {
    inhouse: "Инхаус",
    agency: "Агентство/студия",
    freelance: "Фриланс",
    other: "Другое",
  };

  return (
    <AdminWrapper>
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <header>
          <h1 className="text-3xl font-normal">Результаты опроса</h1>
          <p className="text-muted-foreground mt-2">
            Всего ответов: {stats.totalSubmissions}
          </p>
        </header>

        {/* Pending channels */}
        {pendingChannels.length > 0 && (
          <div className="border border-yellow-500/50 bg-yellow-500/5 p-6 space-y-4">
            <h2 className="text-sm text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
              Предложенные каналы ({pendingChannels.length})
            </h2>
            <div className="space-y-3">
              {pendingChannels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                  <div>
                    <span className="font-medium">{ch.name}</span>
                    {ch.youtubeUrl && (
                      <a
                        href={ch.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        ↗
                      </a>
                    )}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(ch.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <ChannelActions channelId={ch.id} channelName={ch.name} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profession stats */}
          <div className="border border-border p-6 space-y-4">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider">
              По профессии
            </h2>
            <ul className="space-y-2">
              {stats.professionStats.map((item) => (
                <li key={item.profession || "null"} className="flex justify-between">
                  <span>{item.profession ? professionLabels[item.profession] || item.profession : "—"}</span>
                  <span className="text-muted-foreground">{item._count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Workplace stats */}
          <div className="border border-border p-6 space-y-4">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider">
              По месту работы
            </h2>
            <ul className="space-y-2">
              {stats.workplaceStats.map((item) => (
                <li key={item.workplace || "null"} className="flex justify-between">
                  <span>{item.workplace ? workplaceLabels[item.workplace] || item.workplace : "—"}</span>
                  <span className="text-muted-foreground">{item._count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Country stats */}
          <div className="border border-border p-6 space-y-4">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider">
              По странам
            </h2>
            <ul className="space-y-2">
              {stats.countryStats.slice(0, 10).map((item) => (
                <li key={item.country || "null"} className="flex justify-between">
                  <span>{item.country || "—"}</span>
                  <span className="text-muted-foreground">{item._count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Channel stats */}
        <div className="space-y-4">
          <h2 className="text-xl font-normal">Статистика каналов</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-2">Канал</th>
                  <th className="py-3 px-2 text-right">Знают</th>
                  <th className="py-3 px-2 text-right">Смотрят</th>
                  <th className="py-3 px-2 text-right">Конверсия</th>
                </tr>
              </thead>
              <tbody>
                {channelStats.map((ch) => (
                  <tr key={ch.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2">{ch.name}</td>
                    <td className="py-3 px-2 text-right">{ch.awareness}</td>
                    <td className="py-3 px-2 text-right">{ch.watching}</td>
                    <td className="py-3 px-2 text-right">
                      {ch.awareness > 0 ? `${Math.round((ch.watching / ch.awareness) * 100)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submissions list */}
        <div className="space-y-4">
          <h2 className="text-xl font-normal">Все ответы</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-2">Дата</th>
                  <th className="py-3 px-2">Профессия</th>
                  <th className="py-3 px-2">Место</th>
                  <th className="py-3 px-2">Страна</th>
                  <th className="py-3 px-2">Город</th>
                  <th className="py-3 px-2">Знакомые</th>
                  <th className="py-3 px-2">Смотрят</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const known = sub.knownChannels as string[];
                  const watched = sub.watchedChannels as string[];
                  return (
                    <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-2 whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-2">
                        {sub.profession ? professionLabels[sub.profession] || sub.profession : "—"}
                      </td>
                      <td className="py-3 px-2">
                        {sub.workplace ? workplaceLabels[sub.workplace] || sub.workplace : "—"}
                      </td>
                      <td className="py-3 px-2">{sub.country || "—"}</td>
                      <td className="py-3 px-2">{sub.city || "—"}</td>
                      <td className="py-3 px-2">
                        <span title={known.map((id) => channelMap.get(id)?.name || id).join(", ")}>
                          {known.length}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span title={watched.map((id) => channelMap.get(id)?.name || id).join(", ")}>
                          {watched.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </AdminWrapper>
  );
}
