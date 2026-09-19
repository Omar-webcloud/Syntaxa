import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FORMAL_AVATARS = [
  "Alexander",
  "Sophia",
  "James",
  "Emma",
  "William",
  "Olivia",
  "Michael",
  "Elena",
  "David",
  "Grace",
  "Lucas",
  "Clara",
];

export function getAvatarUrl(seed?: string): string {
  const s = seed && seed.trim().length > 0 ? seed.trim() : "Alexander";
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(s)}&backgroundColor=e8dded,f3eef6,e0e7ff,f0fdf4,fef3c7,f1f5f9`;
}
