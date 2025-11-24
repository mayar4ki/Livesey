/**
 * Format a date to a readable string with full date and time
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string (e.g., "January 15, 2024, 10:30:45 AM")
 */
export function formatDateTime(date: Date | string | number): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
