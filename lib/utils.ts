import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a relative Laravel storage path (/storage/...) to an absolute URL
 * pointing to the backend server. Absolute URLs are passed through unchanged.
 */
export function getStorageUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const backendBase = (
    process.env.NEXT_PUBLIC_API_URL || "https://api.ensiashub.me/api"
  ).replace(/\/api$/, "");
  return `${backendBase}${path}`;
}
