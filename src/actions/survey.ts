"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { generateFingerprint, getUserAgent } from "@/lib/fingerprint";
import {
  submissionSchema,
  validateWatchedSubset,
  MIN_SUBMIT_TIME_MS,
} from "@/lib/validation";

export type SubmissionResult = {
  success: boolean;
  error?: string;
};

export async function submitSurvey(formData: FormData): Promise<SubmissionResult> {
  try {
    const fingerprint = await generateFingerprint();
    const userAgent = await getUserAgent();
    const cookieStore = await cookies();

    // Check timing (anti-bot)
    const pageLoadTime = cookieStore.get("survey_start")?.value;
    if (pageLoadTime) {
      const elapsed = Date.now() - parseInt(pageLoadTime, 10);
      if (elapsed < MIN_SUBMIT_TIME_MS) {
        return {
          success: false,
          error: "Please take your time to complete the survey",
        };
      }
    }

    // Check for existing submission in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        fingerprintHash: fingerprint,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (existingSubmission) {
      return {
        success: false,
        error: "You have already submitted a response. Please try again tomorrow.",
      };
    }

    // Parse form data
    const knownChannelsRaw = formData.get("knownChannels") as string;
    const watchedChannelsRaw = formData.get("watchedChannels") as string;
    const honeypot = (formData.get("website") as string) || "";

    let knownChannels: string[] = [];
    let watchedChannels: string[] = [];

    try {
      knownChannels = JSON.parse(knownChannelsRaw || "[]");
      watchedChannels = JSON.parse(watchedChannelsRaw || "[]");
    } catch {
      return { success: false, error: "Invalid data format" };
    }

    // Validate input
    const parsed = submissionSchema.safeParse({
      knownChannels,
      watchedChannels,
      honeypot,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0].message,
      };
    }

    // Validate subset rule: watched must be subset of known
    if (!validateWatchedSubset(knownChannels, watchedChannels)) {
      return {
        success: false,
        error: "Invalid selection: watched channels must be from known channels",
      };
    }

    // Verify all channel IDs exist
    const validChannels = await prisma.channel.findMany({
      where: {
        id: { in: [...knownChannels, ...watchedChannels] },
      },
      select: { id: true },
    });

    const validIds = new Set(validChannels.map((c) => c.id));
    const allSubmittedIds = Array.from(new Set(knownChannels.concat(watchedChannels)));

    if (!allSubmittedIds.every((id) => validIds.has(id))) {
      return {
        success: false,
        error: "Invalid channel selection",
      };
    }

    // Create submission
    await prisma.submission.create({
      data: {
        fingerprintHash: fingerprint,
        knownChannels: knownChannels,
        watchedChannels: watchedChannels,
        userAgent: userAgent?.slice(0, 500) || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting survey:", error);
    return {
      success: false,
      error: "Failed to submit. Please try again.",
    };
  }
}

export async function checkExistingSubmission(): Promise<boolean> {
  try {
    const fingerprint = await generateFingerprint();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existing = await prisma.submission.findFirst({
      where: {
        fingerprintHash: fingerprint,
        createdAt: { gte: oneDayAgo },
      },
    });

    return !!existing;
  } catch {
    return false;
  }
}
