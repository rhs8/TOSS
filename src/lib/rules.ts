/**
 * Toss platform rules:
 * 1. You must list an item before you can receive/borrow anything.
 * 2. Only one exchange per user per week.
 * 3. Minimum 6-month commitment from first listing.
 * 4. Card on file: charged if user doesn't return item (abuse).
 */

export const COMMITMENT_MONTHS = 6;
export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  return d;
}

export function isWithinCommitment(commitmentEnd: Date): boolean {
  return new Date() <= new Date(commitmentEnd);
}

export function addCommitmentMonths(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}
