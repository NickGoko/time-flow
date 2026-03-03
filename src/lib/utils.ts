import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Traffic-light color for progress percentage.
 *  Returns an object with `bg` (for bars) and `text` (for labels) classes. */
export function getProgressColor(percent: number): { bg: string; text: string } {
  if (percent >= 90) return { bg: 'bg-success', text: 'text-success' };
  if (percent >= 75) return { bg: 'bg-warning', text: 'text-warning' };
  return { bg: 'bg-destructive', text: 'text-destructive' };
}
