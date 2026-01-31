"use server";

import { prisma } from "@/lib/db";
import { generateFingerprint } from "@/lib/fingerprint";
import { slugify } from "@/lib/utils";
import {
  channelSuggestionSchema,
  MAX_SUGGESTIONS_PER_DAY,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

export type Channel = {
  id: string;
  name: string;
  slug: string;
  youtubeUrl: string | null;
  status: "approved" | "pending";
};

export async function getApprovedChannels(): Promise<Channel[]> {
  const channels = await prisma.channel.findMany({
    where: { status: "approved" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      youtubeUrl: true,
      status: true,
    },
  });

  return channels;
}

export async function addChannelSuggestion(formData: FormData): Promise<{
  success: boolean;
  channel?: Channel;
  error?: string;
}> {
  try {
    const fingerprint = await generateFingerprint();

    // Rate limit check
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSuggestions = await prisma.channelSuggestion.count({
      where: {
        fingerprintHash: fingerprint,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentSuggestions >= MAX_SUGGESTIONS_PER_DAY) {
      return {
        success: false,
        error: `Maximum ${MAX_SUGGESTIONS_PER_DAY} channel suggestions per day`,
      };
    }

    // Parse and validate input
    const raw = {
      name: formData.get("name") as string,
      youtubeUrl: formData.get("youtubeUrl") as string,
      note: formData.get("note") as string,
    };

    const parsed = channelSuggestionSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0].message,
      };
    }

    const { name, youtubeUrl, note } = parsed.data;
    const slug = slugify(name);

    // Check for duplicate by slug or URL
    const existing = await prisma.channel.findFirst({
      where: {
        OR: [
          { slug },
          ...(youtubeUrl ? [{ youtubeUrl }] : []),
        ],
      },
    });

    if (existing) {
      return {
        success: false,
        error: "This channel already exists",
      };
    }

    // Create the channel as pending
    const channel = await prisma.channel.create({
      data: {
        name,
        slug,
        youtubeUrl: youtubeUrl || null,
        status: "pending",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        youtubeUrl: true,
        status: true,
      },
    });

    // Also save as suggestion for admin review
    await prisma.channelSuggestion.create({
      data: {
        name,
        youtubeUrl: youtubeUrl || null,
        note: note || null,
        fingerprintHash: fingerprint,
      },
    });

    revalidatePath("/survey/design-youtube");

    return { success: true, channel };
  } catch (error) {
    console.error("Error adding channel suggestion:", error);
    return {
      success: false,
      error: "Failed to add channel. Please try again.",
    };
  }
}
