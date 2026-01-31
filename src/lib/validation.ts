import { z } from "zod";
import { isValidYouTubeUrl } from "./utils";

export const MAX_KNOWN_CHANNELS = 40;
export const MAX_WATCHED_CHANNELS = 25;
export const MAX_SUGGESTIONS_PER_DAY = 5;
export const MIN_SUBMIT_TIME_MS = 4000; // 4 seconds

export const channelSuggestionSchema = z.object({
  name: z
    .string()
    .min(2, "Название канала должно быть не менее 2 символов")
    .max(80, "Название канала должно быть не более 80 символов")
    .transform((s) => s.trim()),
  youtubeUrl: z
    .string()
    .optional()
    .transform((s) => s?.trim() || undefined)
    .refine((url) => !url || isValidYouTubeUrl(url), {
      message: "Неверная ссылка на YouTube",
    }),
  note: z
    .string()
    .max(500, "Комментарий должен быть не более 500 символов")
    .optional()
    .transform((s) => s?.trim() || undefined),
});

export const submissionSchema = z.object({
  knownChannels: z
    .array(z.string().uuid())
    .max(MAX_KNOWN_CHANNELS, `Максимум ${MAX_KNOWN_CHANNELS} знакомых каналов`),
  watchedChannels: z
    .array(z.string().uuid())
    .max(MAX_WATCHED_CHANNELS, `Максимум ${MAX_WATCHED_CHANNELS} просматриваемых каналов`),
  honeypot: z.string().max(0, "Неверный запрос"),
});

export function validateWatchedSubset(
  knownChannels: string[],
  watchedChannels: string[]
): boolean {
  const knownSet = new Set(knownChannels);
  return watchedChannels.every((id) => knownSet.has(id));
}

export type ChannelSuggestionInput = z.infer<typeof channelSuggestionSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
