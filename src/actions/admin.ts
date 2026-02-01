"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ChannelStats = {
  id: string;
  name: string;
  slug: string;
  status: "approved" | "pending";
  awarenessCount: number;
  watchingCount: number;
  ratio: number;
};

export type StatItem = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

export type SurveyResults = {
  totalSubmissions: number;
  channelStats: ChannelStats[];
  professionStats: StatItem[];
  workplaceStats: StatItem[];
  pendingSuggestions: {
    id: string;
    name: string;
    youtubeUrl: string | null;
    note: string | null;
    createdAt: Date;
  }[];
};

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

const professionLabels: Record<string, string> = {
  product: "Продуктовый дизайнер",
  graphic: "Графический дизайнер",
  type: "Шрифтовой дизайнер",
  illustrator: "Иллюстратор",
  motion: "Моушн-дизайнер",
  "3d": "3Д-дизайнер",
  producer: "Продюсер",
  art_director: "Арт-директор",
  design_director: "Дизайн-директор",
  creative_director: "Креативный директор",
  marketer: "Маркетолог",
  copywriter: "Копирайтер",
  developer: "Разработчик",
  student: "Студент",
  recruiter: "Рекрутер",
  other: "Другое",
};

const workplaceLabels: Record<string, string> = {
  inhouse: "Инхаус",
  agency: "Агентство или студия",
  freelance: "Фриланс",
  other: "Другое",
};

export async function getSurveyResults(): Promise<SurveyResults> {
  // Get all submissions
  const submissions = await prisma.submission.findMany({
    select: {
      knownChannels: true,
      watchedChannels: true,
      profession: true,
      workplace: true,
    },
  });

  // Get all channels
  const channels = await prisma.channel.findMany({
    orderBy: { name: "asc" },
  });

  // Count awareness and watching for each channel
  const awarenessMap = new Map<string, number>();
  const watchingMap = new Map<string, number>();

  for (const submission of submissions) {
    const known = submission.knownChannels as string[];
    const watched = submission.watchedChannels as string[];

    for (const id of known) {
      awarenessMap.set(id, (awarenessMap.get(id) || 0) + 1);
    }

    for (const id of watched) {
      watchingMap.set(id, (watchingMap.get(id) || 0) + 1);
    }
  }

  // Build channel stats
  const channelStats: ChannelStats[] = channels.map((channel) => {
    const awarenessCount = awarenessMap.get(channel.id) || 0;
    const watchingCount = watchingMap.get(channel.id) || 0;
    const ratio = awarenessCount > 0 ? watchingCount / awarenessCount : 0;

    return {
      id: channel.id,
      name: channel.name,
      slug: channel.slug,
      status: channel.status,
      awarenessCount,
      watchingCount,
      ratio,
    };
  });

  // Sort by awareness count descending
  channelStats.sort((a, b) => b.awarenessCount - a.awarenessCount);

  // Count professions
  const professionCounts = new Map<string, number>();
  const workplaceCounts = new Map<string, number>();

  for (const submission of submissions) {
    if (submission.profession) {
      professionCounts.set(
        submission.profession,
        (professionCounts.get(submission.profession) || 0) + 1
      );
    }
    if (submission.workplace) {
      workplaceCounts.set(
        submission.workplace,
        (workplaceCounts.get(submission.workplace) || 0) + 1
      );
    }
  }

  // Build profession stats
  const professionStats: StatItem[] = Array.from(professionCounts.entries())
    .map(([id, count]) => ({
      id,
      label: professionLabels[id] || id,
      count,
      percentage: submissions.length > 0 ? (count / submissions.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Build workplace stats
  const workplaceStats: StatItem[] = Array.from(workplaceCounts.entries())
    .map(([id, count]) => ({
      id,
      label: workplaceLabels[id] || id,
      count,
      percentage: submissions.length > 0 ? (count / submissions.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Get pending suggestions
  const pendingSuggestions = await prisma.channelSuggestion.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      youtubeUrl: true,
      note: true,
      createdAt: true,
    },
  });

  return {
    totalSubmissions: submissions.length,
    channelStats,
    professionStats,
    workplaceStats,
    pendingSuggestions,
  };
}

export async function approveChannel(channelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.channel.update({
      where: { id: channelId },
      data: { status: "approved" },
    });

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error approving channel:", error);
    return { success: false, error: "Ошибка при одобрении канала" };
  }
}

export async function rejectChannel(channelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.channel.delete({
      where: { id: channelId },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting channel:", error);
    return { success: false, error: "Ошибка при удалении канала" };
  }
}
