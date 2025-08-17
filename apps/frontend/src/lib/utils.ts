import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertCurrencyBigint = (val: bigint) =>
  Number(val / BigInt(1e3)) / 1e3;
