import { clsx, type ClassValue } from "clsx";
import Hashids from "hashids";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | null) => {
  if (!date) return null;

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(date));

  return formattedDate;
};

export function formatTime(timeString: string | null) {
  if (!timeString) {
    return null;
  }

  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
}

export function encode(ids: number[]) {
  const hashids = new Hashids("coyuli", 5);
  return hashids.encode(ids);
}

export function decode(hash: string) {
  const hashids = new Hashids("coyuli", 5);
  return hashids.decode(hash);
}
