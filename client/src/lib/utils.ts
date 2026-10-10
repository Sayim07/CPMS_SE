import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names and resolves Tailwind CSS conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency / package value in LPA.
 */
export function formatLPA(val: number): string {
  return `${val.toFixed(1)} LPA`;
}

/**
 * Formats a percentage value.
 */
export function formatPct(val: number): string {
  return `${val.toFixed(1)}%`;
}
