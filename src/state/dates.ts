export const timeZone = 'America/Argentina/Buenos_Aires';
export function activityDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
/** Calendar arithmetic operates on a BA date, never the UTC date of an instant. */
export function weekKey(date: string): string {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}
export function monthKey(date: string): string { return date.slice(0, 7); }
export function displayDate(date: string): string {
  return new Intl.DateTimeFormat('es-AR', {timeZone, day:'numeric',month:'long',year:'numeric'}).format(new Date(`${date}T12:00:00Z`));
}
