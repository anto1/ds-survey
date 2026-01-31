import { z } from "zod";
import { isValidYouTubeUrl } from "./utils";

export const MAX_KNOWN_CHANNELS = 40;
export const MAX_WATCHED_CHANNELS = 25;
export const MAX_SUGGESTIONS_PER_DAY = 5;
export const MIN_SUBMIT_TIME_MS = 4000; // 4 seconds

export const channelSuggestionSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .max(80, "Channel name must be at most 80 characters")
    .transform((s) => s.trim()),
  youtubeUrl: z
    .string()
    .optional()
    .transform((s) => s?.trim() || undefined)
    .refine((url) => !url || isValidYouTubeUrl(url), {
      message: "Invalid YouTube URL",
    }),
  note: z
    .string()
    .max(500, "Note must be at most 500 characters")
    .optional()
    .transform((s) => s?.trim() || undefined),
});

export const submissionSchema = z.object({
  knownChannels: z
    .array(z.string().uuid())
    .max(MAX_KNOWN_CHANNELS, `Maximum ${MAX_KNOWN_CHANNELS} known channels allowed`),
  watchedChannels: z
    .array(z.string().uuid())
    .max(MAX_WATCHED_CHANNELS, `Maximum ${MAX_WATCHED_CHANNELS} watched channels allowed`),
  honeypot: z.string().max(0, "Invalid submission"),
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
