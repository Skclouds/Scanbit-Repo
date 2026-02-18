import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  // Safe implementation of cn to prevent "is not a function" errors in production
  try {
    if (typeof clsx !== 'function') return "";
    const classes = clsx(inputs);
    if (typeof twMerge !== 'function') return classes;
    return twMerge(classes);
  } catch {
    return "";
  }
}
