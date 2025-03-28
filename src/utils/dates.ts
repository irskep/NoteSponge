import { format } from "date-fns";

export function formatDateTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd 'at' h:mm a");
}
