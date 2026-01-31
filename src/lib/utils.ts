import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 500);
}

export function isValidYouTubeUrl(url: string): boolean {
  if (!url) return true; // Optional field
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "m.youtube.com" ||
      parsed.hostname === "youtu.be"
    );
  } catch {
    return false;
  }
}
