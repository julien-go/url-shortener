export type DayUTC = string;

export function getDayUtc(date = new Date()): DayUTC {
  return date.toISOString().slice(0, 10);
}
