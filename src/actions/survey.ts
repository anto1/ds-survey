"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  generateFingerprint,
  getUserAgent,
  getGeoData,
  getLanguage,
  getReferrer,
} from "@/lib/fingerprint";
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
    const geo = await getGeoData();
    const language = await getLanguage();
    const referrer = await getReferrer();
    const cookieStore = await cookies();

    // Check timing (anti-bot)
    const pageLoadTime = cookieStore.get("survey_start")?.value;
    if (pageLoadTime) {
      const elapsed = Date.now() - parseInt(pageLoadTime, 10);
      if (elapsed < MIN_SUBMIT_TIME_MS) {
        return {
          success: false,
          error: "Пожалуйста, не торопитесь с заполнением",
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
        error: "Вы уже отправили ответ. Попробуйте снова завтра.",
      };
    }

    // Parse form data
    const knownChannelsRaw = formData.get("knownChannels") as string;
    const watchedChannelsRaw = formData.get("watchedChannels") as string;
    const profession = (formData.get("profession") as string) || null;
    const workplace = (formData.get("workplace") as string) || null;
    const honeypot = (formData.get("website") as string) || "";

    let knownChannels: string[] = [];
    let watchedChannels: string[] = [];

    try {
      knownChannels = JSON.parse(knownChannelsRaw || "[]");
      watchedChannels = JSON.parse(watchedChannelsRaw || "[]");
    } catch {
      return { success: false, error: "Неверный формат данных" };
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
        error: "Неверный выбор: просматриваемые каналы должны быть из знакомых",
      };
    }

    // Verify all channel IDs exist
    const validChannels = await prisma.channel.findMany({
      where: {
        id: { in: knownChannels.concat(watchedChannels) },
      },
      select: { id: true },
    });

    const validIds = new Set(validChannels.map((c) => c.id));
    const allSubmittedIds = Array.from(new Set(knownChannels.concat(watchedChannels)));

    if (!allSubmittedIds.every((id) => validIds.has(id))) {
      return {
        success: false,
        error: "Неверный выбор канала",
      };
    }

    // Create submission
    await prisma.submission.create({
      data: {
        fingerprintHash: fingerprint,
        knownChannels: knownChannels,
        watchedChannels: watchedChannels,
        profession,
        workplace,
        country: geo.country,
        city: geo.city,
        region: geo.region,
        userAgent: userAgent?.slice(0, 500) || null,
        language,
        referrer: referrer?.slice(0, 500) || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting survey:", error);
    return {
      success: false,
      error: "Ошибка отправки. Попробуйте ещё раз.",
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
