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

export type SurveyResults = {
  totalSubmissions: number;
  channelStats: ChannelStats[];
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

export async function getSurveyResults(): Promise<SurveyResults> {
  // Get all submissions
  const submissions = await prisma.submission.findMany({
    select: {
      knownChannels: true,
      watchedChannels: true,
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
