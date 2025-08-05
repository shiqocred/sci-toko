import { apiXenditDev } from "@/config";
import { clsx, type ClassValue } from "clsx";
import { formatInTimeZone } from "date-fns-tz";
import { twMerge } from "tailwind-merge";
import { Xendit } from "xendit-node";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomNumber(length = 5): string {
  const digits = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += digits[Math.floor(Math.random() * digits.length)];
  }
  return result;
}

export const sizesImage =
  "(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 100vw";

export function formatRupiah(rupiah: string | number): string {
  const value =
    typeof rupiah === "string"
      ? parseFloat(rupiah.replace(/[^\d.-]/g, ""))
      : rupiah;

  if (!value || isNaN(value)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.ceil(value));
}

export const timeNow = async () => {
  const jakartaNow = formatInTimeZone(
    new Date(),
    "Asia/Jakarta",
    "yyyy-MM-dd HH:mm:ss"
  );

  const now = new Date(jakartaNow);
  return now;
};

export const numericString = (e: string) => {
  return e.startsWith("0") ? e.replace(/^0+/, "") : e;
};

export function isResponse(obj: unknown): obj is Response {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "status" in obj &&
    "headers" in obj &&
    typeof (obj as Response).status === "number"
  );
}

export const pronoun = (num: number) => {
  return num > 1 ? "s" : "";
};

export const xendit = new Xendit({ secretKey: apiXenditDev });
